import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User, UserRole, AuthorFollow, Book, BookStatus } from '../../database/entities';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(AuthorFollow) private followRepo: Repository<AuthorFollow>,
    @InjectRepository(Book) private bookRepo: Repository<Book>,
  ) {}

  async getAllAuthors(page: number = 1, limit: number = 20) {
    const [authors, total] = await this.userRepo.findAndCount({
      where: [{ role: UserRole.AUTHOR }, { role: UserRole.ADMIN }],
      select: ['id', 'name', 'avatar', 'bio', 'location', 'createdAt', 'role'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // We only want authors who have at least one book or are designated authors.
    // Let's get book counts and followers for each.
    const authorsWithStats = await Promise.all(authors.map(async (author) => {
      const [bookCount, followersCount] = await Promise.all([
        this.bookRepo.count({ where: { authorId: author.id, status: BookStatus.APPROVED } }),
        this.followRepo.count({ where: { authorId: author.id } })
      ]);
      return { ...author, bookCount, followersCount };
    }));

    // Filter out admins who don't have any books, keep all explicit authors
    const filteredAuthors = authorsWithStats.filter(a => a.role === UserRole.AUTHOR || a.bookCount > 0);

    return {
      data: filteredAuthors,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getAuthorProfile(identifier: string | number) {
    const author = await this.userRepo.findOne({
      where: [{ id: Number(identifier) }, { name: String(identifier) }],
      select: ['id', 'name', 'avatar', 'bio', 'location', 'createdAt', 'role'],
    });

    if (!author || (author.role !== UserRole.AUTHOR && author.role !== UserRole.ADMIN)) {
      throw new NotFoundException('المؤلف غير موجود');
    }

    const [books, followersCount] = await Promise.all([
      this.bookRepo.find({
        where: { authorId: author.id, status: BookStatus.APPROVED },
        order: { createdAt: 'DESC' },
        relations: ['category'],
      }),
      this.followRepo.count({ where: { authorId: author.id } }),
    ]);

    return { ...author, books, followersCount };
  }

  async getDashboardStats(authorId: number) {
    const [publishedCount, pendingCount, followersCount] = await Promise.all([
      this.bookRepo.count({ where: { authorId, status: BookStatus.APPROVED } }),
      this.bookRepo.count({ where: { authorId, status: BookStatus.PENDING } }),
      this.followRepo.count({ where: { authorId } }),
    ]);

    // Calculate total downloads for all published books of this author
    const books = await this.bookRepo.find({
      where: { authorId, status: BookStatus.APPROVED },
      select: ['downloadCount'],
    });
    const totalDownloads = books.reduce((sum, b) => sum + (b.downloadCount || 0), 0);

    return {
      publishedBooks: publishedCount,
      followers: followersCount,
      totalDownloads: totalDownloads,
      pendingReview: pendingCount,
    };
  }

  async followAuthor(userId: number, authorId: number) {
    const author = await this.userRepo.findOne({ where: { id: authorId, role: In([UserRole.AUTHOR, UserRole.ADMIN]) } });
    if (!author) throw new NotFoundException('المؤلف غير موجود');

    const existing = await this.followRepo.findOne({ where: { userId, authorId } });
    if (!existing) {
      await this.followRepo.save(this.followRepo.create({ userId, authorId }));
    }
    return { success: true };
  }

  async unfollowAuthor(userId: number, authorId: number) {
    await this.followRepo.delete({ userId, authorId });
    return { success: true };
  }

  async getFollowedAuthors(userId: number) {
    const follows = await this.followRepo.find({
      where: { userId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
    
    // Fetch book stats for each author
    const authorsWithStats = await Promise.all(follows.map(async (f) => {
      const [bookCount, latestBook] = await Promise.all([
        this.bookRepo.count({ where: { authorId: f.author.id, status: BookStatus.APPROVED } }),
        this.bookRepo.findOne({
          where: { authorId: f.author.id, status: BookStatus.APPROVED },
          order: { createdAt: 'DESC' },
          select: ['title']
        })
      ]);
      return {
        ...f.author,
        bookCount,
        latestBookTitle: latestBook ? latestBook.title : null
      };
    }));

    return authorsWithStats;
  }

  async getFollowers(authorId: number) {
    return this.followRepo.find({
      where: { authorId },
      select: ['userId'],
    });
  }
}
