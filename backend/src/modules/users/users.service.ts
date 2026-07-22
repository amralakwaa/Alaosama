import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, ReadingProgress, Book, BookStatus, Favorite } from '../../database/entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ReadingProgress)
    private readonly progressRepository: Repository<ReadingProgress>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  // ─── Profile ─────────────────────────────────────────
  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('المستخدم غير موجود');
    return user;
  }

  async updateProfile(userId: number, data: { name?: string; bio?: string; avatar?: string }) {
    await this.userRepository.update(userId, data);
    return this.getProfile(userId);
  }

  // ─── Reading Progress ─────────────────────────────────
  async getReadingHistory(userId: number) {
    return this.progressRepository.find({
      where: { userId },
      relations: ['book', 'book.category'],
      order: { lastReadAt: 'DESC' },
      take: 20,
    });
  }

  async upsertProgress(userId: number, bookId: number, currentPage: number) {
    const book = await this.bookRepository.findOne({
      where: { id: bookId, status: BookStatus.APPROVED },
    });
    if (!book) throw new NotFoundException('الكتاب غير موجود');

    const progressPercent = book.pageCount
      ? Math.min(100, (currentPage / book.pageCount) * 100)
      : 0;

    const existing = await this.progressRepository.findOne({
      where: { userId, bookId },
    });

    if (existing) {
      await this.progressRepository.update(existing.id, {
        currentPage,
        progressPercent,
        lastReadAt: new Date(),
      });
      return { ...existing, currentPage, progressPercent };
    }

    const progress = this.progressRepository.create({
      userId,
      bookId,
      currentPage,
      progressPercent,
      lastReadAt: new Date(),
    });
    return this.progressRepository.save(progress);
  }

  async getBookProgress(userId: number, bookId: number) {
    return this.progressRepository.findOne({ where: { userId, bookId } });
  }

  // ─── Favorites ────────────────────────────────────────
  async toggleFavorite(userId: number, bookId: number) {
    const book = await this.bookRepository.findOne({ where: { id: bookId, status: BookStatus.APPROVED } });
    if (!book) throw new NotFoundException('الكتاب غير موجود');

    const existing = await this.favoriteRepository.findOne({ where: { userId, bookId } });
    if (existing) {
      await this.favoriteRepository.remove(existing);
      return { favorited: false };
    }

    const favorite = this.favoriteRepository.create({ userId, bookId });
    await this.favoriteRepository.save(favorite);
    return { favorited: true };
  }

  async getFavorites(userId: number) {
    return this.favoriteRepository.find({
      where: { userId },
      relations: ['book', 'book.author', 'book.category'],
      order: { createdAt: 'DESC' }
    });
  }

  async isFavorited(userId: number, bookId: number) {
    const existing = await this.favoriteRepository.findOne({ where: { userId, bookId } });
    return { favorited: !!existing };
  }

  // ─── Dashboard Stats ──────────────────────────────────
  async getDashboardStats(userId: number) {
    const [totalBooks, completedBooks, recentProgress] = await Promise.all([
      this.progressRepository.count({ where: { userId } }),
      this.progressRepository.count({
        where: { userId, progressPercent: 100 as unknown as never },
      }),
      this.progressRepository.find({
        where: { userId },
        relations: ['book', 'book.category'],
        order: { lastReadAt: 'DESC' },
        take: 5,
      }),
    ]);

    return {
      stats: {
        booksStarted: totalBooks,
        booksCompleted: completedBooks,
        booksInProgress: totalBooks - completedBooks,
      },
      recentlyRead: recentProgress,
    };
  }
}
