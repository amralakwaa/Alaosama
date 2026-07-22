import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Review,
  ReviewReply,
  ReviewStatus,
  Book,
  User,
  BookStatus,
  UserRole,
} from '../../database/entities';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(ReviewReply) private replyRepo: Repository<ReviewReply>,
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // ─── Get book reviews with stats ─────────────────────────────────────────
  async getBookReviews(bookId: number) {
    const reviews = await this.reviewRepo.find({
      where: { bookId, status: ReviewStatus.APPROVED },
      relations: ['user', 'replies', 'replies.author'],
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        rating: true,
        comment: true,
        status: true,
        createdAt: true,
        user: {
          id: true,
          name: true,
          avatar: true,
        },
        replies: {
          id: true,
          replyText: true,
          createdAt: true,
          author: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    // Star distribution stats
    const allRatings = await this.reviewRepo.find({
      where: { bookId, status: ReviewStatus.APPROVED },
      select: { rating: true },
    });

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allRatings.forEach((r) => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    const total = allRatings.length;
    const avg =
      total > 0
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / total
        : 0;

    return {
      stats: {
        averageRating: Math.round(avg * 10) / 10,
        totalReviews: total,
        distribution: {
          5: total > 0 ? Math.round((distribution[5] / total) * 100) : 0,
          4: total > 0 ? Math.round((distribution[4] / total) * 100) : 0,
          3: total > 0 ? Math.round((distribution[3] / total) * 100) : 0,
          2: total > 0 ? Math.round((distribution[2] / total) * 100) : 0,
          1: total > 0 ? Math.round((distribution[1] / total) * 100) : 0,
        },
        counts: distribution,
      },
      reviews,
    };
  }

  // ─── Add or update review ────────────────────────────────────────────────
  async addReview(
    userId: number,
    bookId: number,
    rating: number,
    comment: string,
  ) {
    if (rating < 1 || rating > 5)
      throw new BadRequestException('التقييم يجب أن يكون بين 1 و 5');

    const book = await this.bookRepo.findOne({
      where: { id: bookId, status: BookStatus.APPROVED },
    });
    if (!book) throw new NotFoundException('الكتاب غير موجود');

    // Upsert: update if exists, create if not
    let review = await this.reviewRepo.findOne({ where: { userId, bookId } });
    if (review) {
      review.rating = rating;
      review.comment = comment;
      await this.reviewRepo.save(review);
    } else {
      review = this.reviewRepo.create({
        userId,
        bookId,
        rating,
        comment,
        status: ReviewStatus.APPROVED,
      });
      await this.reviewRepo.save(review);
    }

    await this.updateBookStats(bookId);
    if (book.authorId) {
      await this.updateAuthorStats(book.authorId);
    }

    return review;
  }

  // ─── Delete own review ───────────────────────────────────────────────────
  async deleteReview(userId: number, reviewId: number) {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('التقييم غير موجود');
    if (review.userId !== userId)
      throw new ForbiddenException('لا يمكنك حذف تقييم شخص آخر');

    const bookId = review.bookId;
    await this.reviewRepo.remove(review);

    const book = await this.bookRepo.findOne({ where: { id: bookId } });
    await this.updateBookStats(bookId);
    if (book?.authorId) await this.updateAuthorStats(book.authorId);

    return { success: true };
  }

  // ─── Get user's own review for a book ───────────────────────────────────
  async getUserReview(userId: number, bookId: number) {
    return this.reviewRepo.findOne({ where: { userId, bookId } });
  }

  // ─── Reply to a review (author only) ────────────────────────────────────
  async addReply(
    authorId: number,
    reviewId: number,
    replyText: string,
  ) {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
      relations: ['book'],
    });
    if (!review) throw new NotFoundException('التقييم غير موجود');
    if (!review.book) throw new NotFoundException('الكتاب غير موجود');

    const author = await this.userRepo.findOne({ where: { id: authorId } });

    // Admins can reply to any review; authors only to their own books
    if (author?.role !== UserRole.ADMIN && review.book.authorId !== authorId) {
      throw new ForbiddenException('يمكنك الرد فقط على تقييمات كتبك');
    }

    // Check if author already replied — one reply per review per author
    const existing = await this.replyRepo.findOne({
      where: { reviewId, authorId },
    });
    if (existing) {
      existing.replyText = replyText;
      return this.replyRepo.save(existing);
    }

    const reply = this.replyRepo.create({ reviewId, authorId, replyText });
    return this.replyRepo.save(reply);
  }

  // ─── Delete reply (reply owner or admin) ────────────────────────────────
  async deleteReply(userId: number, replyId: number, userRole: UserRole) {
    const reply = await this.replyRepo.findOne({ where: { id: replyId } });
    if (!reply) throw new NotFoundException('الرد غير موجود');

    if (userRole !== UserRole.ADMIN && reply.authorId !== userId) {
      throw new ForbiddenException('لا يمكنك حذف هذا الرد');
    }

    await this.replyRepo.remove(reply);
    return { success: true };
  }

  // ─── Author: Get reviews for their books ─────────────────────────────────
  async getAuthorReviews(authorId: number, page = 1, limit = 10) {
    const books = await this.bookRepo.find({
      where: { authorId, status: BookStatus.APPROVED },
      select: { id: true },
    });
    const bookIds = books.map((b) => b.id);
    if (bookIds.length === 0)
      return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };

    const qb = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.book', 'book')
      .leftJoinAndSelect('review.replies', 'replies')
      .leftJoinAndSelect('replies.author', 'replyAuthor')
      .where('review.bookId IN (:...bookIds)', { bookIds })
      .orderBy('review.createdAt', 'DESC');

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  // ─── Author: Stats overview ───────────────────────────────────────────────
  async getAuthorReviewStats(authorId: number) {
    const books = await this.bookRepo.find({
      where: { authorId, status: BookStatus.APPROVED },
      select: { id: true, title: true, averageRating: true, reviewsCount: true },
    });
    const bookIds = books.map((b) => b.id);
    if (bookIds.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        totalReplies: 0,
        topBook: null,
        books: [],
      };
    }

    const stats = await this.reviewRepo
      .createQueryBuilder('review')
      .where('review.bookId IN (:...bookIds)', { bookIds })
      .select('COUNT(review.id)', 'totalReviews')
      .addSelect('AVG(review.rating)', 'avgRating')
      .getRawOne();

    const totalReplies = await this.replyRepo
      .createQueryBuilder('reply')
      .where('reply.authorId = :authorId', { authorId })
      .getCount();

    const topBook = books.sort((a, b) => b.reviewsCount - a.reviewsCount)[0];

    return {
      totalReviews: parseInt(stats?.totalReviews || '0'),
      averageRating: Math.round((parseFloat(stats?.avgRating || '0')) * 10) / 10,
      totalReplies,
      topBook: topBook || null,
      books,
    };
  }

  // ─── Internal helpers ─────────────────────────────────────────────────────
  private async updateBookStats(bookId: number) {
    const stats = await this.reviewRepo
      .createQueryBuilder('review')
      .where('review.bookId = :bookId', { bookId })
      .andWhere('review.status = :status', { status: ReviewStatus.APPROVED })
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'count')
      .getRawOne();

    await this.bookRepo.update(bookId, {
      averageRating: parseFloat(stats.avg) || 0,
      reviewsCount: parseInt(stats.count, 10) || 0,
    });
  }

  private async updateAuthorStats(authorId: number) {
    const stats = await this.bookRepo
      .createQueryBuilder('book')
      .where('book.authorId = :authorId', { authorId })
      .andWhere('book.status = :status', { status: BookStatus.APPROVED })
      .andWhere('book.reviewsCount > 0')
      .select('AVG(book.averageRating)', 'avg')
      .getRawOne();

    await this.userRepo.update(authorId, {
      averageRating: parseFloat(stats.avg) || 0,
    });
  }
}