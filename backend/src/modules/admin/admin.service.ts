import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Book, Category, ReadingProgress, BookStatus, UserRole, UserStatus, AdminActivityLog, Review, ReviewReply, ReviewStatus } from '../../database/entities';
import { AdminActionType } from '../../database/entities/admin-activity-log.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)   private readonly userRepo: Repository<User>,
    @InjectRepository(Book)   private readonly bookRepo: Repository<Book>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    @InjectRepository(ReadingProgress) private readonly progressRepo: Repository<ReadingProgress>,
    @InjectRepository(AdminActivityLog) private readonly logRepo: Repository<AdminActivityLog>,
    @InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
    @InjectRepository(ReviewReply) private readonly replyRepo: Repository<ReviewReply>,
  ) {}

  async logActivity(adminId: number, actionType: AdminActionType, targetEntity: string, targetId?: number, details?: any, ipAddress?: string) {
    const log = this.logRepo.create({ adminId, actionType, targetEntity, targetId, details, ipAddress });
    await this.logRepo.save(log);
  }

  // ─── Platform Stats ───────────────────────────────────
  async getStats() {
    const [
      totalUsers, totalBooks, approvedBooks, pendingBooks,
      totalDownloads, totalReads,
    ] = await Promise.all([
      this.userRepo.count(),
      this.bookRepo.count(),
      this.bookRepo.count({ where: { status: BookStatus.APPROVED } }),
      this.bookRepo.count({ where: { status: BookStatus.PENDING } }),
      this.bookRepo
        .createQueryBuilder('b')
        .select('SUM(b.downloadCount)', 'total')
        .getRawOne().then((r) => parseInt(r?.total || '0')),
      this.progressRepo.count(),
    ]);

    // New users this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsersThisWeek = await this.userRepo
      .createQueryBuilder('u')
      .where('u.createdAt >= :date', { date: weekAgo })
      .getCount();

    return {
      users: { total: totalUsers, newThisWeek: newUsersThisWeek },
      books: { total: totalBooks, approved: approvedBooks, pending: pendingBooks, rejected: totalBooks - approvedBooks - pendingBooks },
      engagement: { totalDownloads, totalReads },
    };
  }

  // ─── Books Management ─────────────────────────────────
  async getBooks(page: number, limit: number, status?: BookStatus) {
    const qb = this.bookRepo
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.author', 'author')
      .leftJoinAndSelect('book.category', 'category');

    if (status) qb.where('book.status = :status', { status });

    const total = await qb.getCount();
    const data = await qb
      .orderBy('book.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async updateBookStatus(adminId: number, bookId: number, status: BookStatus) {
    await this.bookRepo.update(bookId, { status });
    await this.logActivity(adminId, AdminActionType.UPDATE, 'Book', bookId, { action: 'change_status', status });
    return { success: true, bookId, status };
  }

  async updateBookFeatured(adminId: number, bookId: number, isFeatured: boolean) {
    const book = await this.bookRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException('الكتاب غير موجود');

    book.isFeatured = isFeatured;
    await this.bookRepo.save(book);

    await this.logActivity(adminId, AdminActionType.UPDATE, 'Book', bookId, {
      action: 'update_featured',
      isFeatured,
      title: book.title,
    });

    return book;
  }

  // ─── Users & Authors Management ─────────────────────────────────
  async getUsers(page: number, limit: number, role?: UserRole) {
    const qb = this.userRepo.createQueryBuilder('user');
    if (role) qb.where('user.role = :role', { role });

    const total = await qb.getCount();
    const data = await qb
      .select(['user.id', 'user.name', 'user.email', 'user.role',
               'user.status', 'user.createdAt', 'user.lastLoginAt'])
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async updateUserStatus(adminId: number, userId: number, status: UserStatus) {
    await this.userRepo.update(userId, { status });
    await this.logActivity(adminId, AdminActionType.UPDATE, 'User', userId, { action: 'change_status', status });
    return { success: true, userId, status };
  }

  async updateUserRole(adminId: number, userId: number, role: UserRole) {
    await this.userRepo.update(userId, { role });
    await this.logActivity(adminId, AdminActionType.UPDATE, 'User', userId, { action: 'change_role', role });
    return { success: true, userId, role };
  }

  async updateUserAdmin(adminId: number, userId: number, data: any) {
    if (data.password) {
      const bcrypt = require('bcryptjs');
      data.password = await bcrypt.hash(data.password, 10);
    }
    await this.userRepo.update(userId, data);
    await this.logActivity(adminId, AdminActionType.UPDATE, 'User', userId, { action: 'update_profile', updatedFields: Object.keys(data) });
    return this.userRepo.findOne({ where: { id: userId }, select: ['id', 'name', 'email', 'role', 'status'] });
  }

  async deleteUserAdmin(adminId: number, userId: number) {
    await this.userRepo.delete(userId);
    await this.logActivity(adminId, AdminActionType.DELETE, 'User', userId, { action: 'delete_user' });
    return { success: true };
  }

  async updateUserFeatured(adminId: number, userId: number, isFeatured: boolean) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    user.isFeatured = isFeatured;
    await this.userRepo.save(user);

    await this.logActivity(adminId, AdminActionType.UPDATE, 'User', userId, {
      action: 'update_featured',
      isFeatured,
      name: user.name,
    });

    return user;
  }

  // ─── Logs Management ──────────────────────────────────
  async getLogs(page: number, limit: number) {
    const qb = this.logRepo.createQueryBuilder('log')
      .leftJoinAndSelect('log.admin', 'admin');
    
    const total = await qb.getCount();
    const data = await qb
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
      
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  // ─── Reviews Management ────────────────────────────────
  async getAdminReviews(page: number, limit: number, status?: ReviewStatus, bookId?: number) {
    const qb = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.book', 'book')
      .leftJoinAndSelect('review.replies', 'replies')
      .leftJoinAndSelect('replies.author', 'replyAuthor');

    if (status) qb.andWhere('review.status = :status', { status });
    if (bookId) qb.andWhere('review.bookId = :bookId', { bookId });

    const total = await qb.getCount();
    const data = await qb
      .orderBy('review.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async updateReviewStatus(adminId: number, reviewId: number, status: ReviewStatus) {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId }, relations: ['book'] });
    if (!review) throw new NotFoundException('التقييم غير موجود');

    review.status = status;
    await this.reviewRepo.save(review);

    // Recalculate book stats after status change
    const stats = await this.reviewRepo
      .createQueryBuilder('r')
      .where('r.bookId = :bookId', { bookId: review.bookId })
      .andWhere('r.status = :status', { status: ReviewStatus.APPROVED })
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(r.id)', 'count')
      .getRawOne();

    await this.bookRepo.update(review.bookId, {
      averageRating: parseFloat(stats.avg) || 0,
      reviewsCount: parseInt(stats.count, 10) || 0,
    });

    await this.logActivity(adminId, 'UPDATE' as any, 'Review', reviewId, { action: 'change_status', status });
    return { success: true, reviewId, status };
  }

  async deleteAdminReview(adminId: number, reviewId: number) {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('التقييم غير موجود');

    const bookId = review.bookId;
    await this.reviewRepo.remove(review);

    const stats = await this.reviewRepo
      .createQueryBuilder('r')
      .where('r.bookId = :bookId', { bookId })
      .andWhere('r.status = :status', { status: ReviewStatus.APPROVED })
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(r.id)', 'count')
      .getRawOne();

    await this.bookRepo.update(bookId, {
      averageRating: parseFloat(stats.avg) || 0,
      reviewsCount: parseInt(stats.count, 10) || 0,
    });

    await this.logActivity(adminId, 'DELETE' as any, 'Review', reviewId, { action: 'delete_review' });
    return { success: true };
  }

  async deleteAdminReply(adminId: number, replyId: number) {
    const reply = await this.replyRepo.findOne({ where: { id: replyId } });
    if (!reply) throw new NotFoundException('الرد غير موجود');

    await this.replyRepo.remove(reply);
    await this.logActivity(adminId, 'DELETE' as any, 'ReviewReply', replyId, { action: 'delete_reply' });
    return { success: true };
  }

  async getAdminReviewStats() {
    const [total, approved, hidden, pending] = await Promise.all([
      this.reviewRepo.count(),
      this.reviewRepo.count({ where: { status: ReviewStatus.APPROVED } }),
      this.reviewRepo.count({ where: { status: ReviewStatus.HIDDEN } }),
      this.reviewRepo.count({ where: { status: ReviewStatus.PENDING } }),
    ]);

    const avgResult = await this.reviewRepo
      .createQueryBuilder('r')
      .where('r.status = :status', { status: ReviewStatus.APPROVED })
      .select('AVG(r.rating)', 'avg')
      .getRawOne();

    return {
      total,
      approved,
      hidden,
      pending,
      averageRating: Math.round((parseFloat(avgResult?.avg || '0')) * 10) / 10,
    };
  }
}
