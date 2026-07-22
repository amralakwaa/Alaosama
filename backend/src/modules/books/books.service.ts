import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book, BookStatus, UserRole, AdminActivityLog } from '../../database/entities';
import { AdminActionType } from '../../database/entities/admin-activity-log.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto, UpdateBookStatusDto } from './dto/update-book.dto';
import { UploadService } from './upload.service';
import { NotificationsService } from '../notifications/notifications.service';

function slugify(text: string): string {
  return text
    .replace(/[أإآ]/g, 'ا').replace(/[ة]/g, 'ه')
    .replace(/\s+/g, '-').replace(/[^\u0600-\u06FF\w-]/g, '')
    .substring(0, 100) + '-' + Date.now();
}

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly uploadService: UploadService,
    private readonly notifService: NotificationsService,
    @InjectRepository(AdminActivityLog)
    private readonly logRepo: Repository<AdminActivityLog>,
  ) {}

  // ─── Public: Search books ────────────────────────
  async search(query: string, page: number, limit: number, categoryId?: number) {
    if (!query || query.trim().length < 2) {
      return { data: [], meta: { page, limit, total: 0, totalPages: 0, query } };
    }

    const qb = this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.author', 'author')
      .leftJoinAndSelect('book.category', 'category')
      .where('book.status = :status', { status: BookStatus.APPROVED })
      .andWhere(
        '(book.title LIKE :q OR book.description LIKE :q)',
        { q: `%${query.trim()}%` },
      )
      .select([
        'book.id', 'book.title', 'book.slug', 'book.coverImageUrl',
        'book.downloadCount', 'book.viewCount', 'book.isPremium',
        'book.pageCount', 'book.language', 'book.createdAt',
        'author.id', 'author.name',
        'category.id', 'category.name', 'category.slug',
      ]);

    if (categoryId) qb.andWhere('book.categoryId = :categoryId', { categoryId });

    const total = await qb.getCount();
    const data = await qb
      .orderBy('book.downloadCount', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit), query } };
  }

  // ─── Public: List approved books ────────────────────
  async findAll(page: number, limit: number, categoryId?: number, isPremium?: boolean) {
    const qb = this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.author', 'author')
      .leftJoinAndSelect('book.category', 'category')
      .where('book.status = :status', { status: BookStatus.APPROVED })
      .select([
        'book.id', 'book.title', 'book.slug', 'book.coverImageUrl',
        'book.downloadCount', 'book.viewCount', 'book.isPremium',
        'book.pageCount', 'book.language', 'book.createdAt',
        'author.id', 'author.name',
        'category.id', 'category.name', 'category.slug',
      ]);

    if (categoryId) qb.andWhere('book.categoryId = :categoryId', { categoryId });
    if (isPremium !== undefined) qb.andWhere('book.isPremium = :isPremium', { isPremium });

    const total = await qb.getCount();
    const data = await qb
      .orderBy('book.downloadCount', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  // ─── Public: Featured Books ─────────────────────────
  async getFeaturedBooks() {
    return this.bookRepository.find({
      where: { status: BookStatus.APPROVED, isFeatured: true },
      relations: ['author', 'category'],
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  // ─── Public: Book detail by slug ────────────────────
  async findBySlug(slug: string) {
    const book = await this.bookRepository.findOne({
      where: { slug, status: BookStatus.APPROVED },
      relations: ['author', 'category'],
    });
    if (!book) throw new NotFoundException('الكتاب غير موجود');
    this.bookRepository.increment({ id: book.id }, 'viewCount', 1).catch(() => {});
    return book;
  }

  // ─── Public: Similar Books ────────────────────────────
  async findSimilar(slug: string) {
    const book = await this.bookRepository.findOne({ where: { slug }, relations: ['category'] });
    if (!book || !book.category) return [];

    return this.bookRepository.find({
      where: { categoryId: book.category.id, status: BookStatus.APPROVED },
      relations: ['author'],
      take: 4,
      order: { viewCount: 'DESC' },
    });
  }

  // ─── Author: Create new book (metadata only) ────────
  async create(dto: CreateBookDto, authorId: number) {
    const slug = slugify(dto.title);
    const book = this.bookRepository.create({
      ...dto,
      slug,
      authorId,
      status: BookStatus.PENDING,
    });
    return this.bookRepository.save(book);
  }

  // ─── Author: Get presigned URL for PDF upload ───────
  async getUploadUrl(bookId: number, userId: number, userRole: UserRole) {
    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException('الكتاب غير موجود');
    if (book.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('ليس لديك صلاحية لتعديل هذا الكتاب');
    }

    const pdfKey = this.uploadService.generateBookPdfKey(bookId, 'book.pdf');
    const coverKey = this.uploadService.generateBookCoverKey(bookId);

    const [pdfUpload, coverUpload] = await Promise.all([
      this.uploadService.getPresignedUploadUrl(pdfKey, 'application/pdf'),
      this.uploadService.getPresignedUploadUrl(coverKey, 'image/webp'),
    ]);

    // Update book with the keys after upload confirmation
    await this.bookRepository.update(bookId, {
      pdfKey,
      coverImageUrl: coverUpload.publicUrl,
    });

    return {
      pdf: pdfUpload,
      cover: coverUpload,
      message: 'ارفع الملفات مباشرة إلى الروابط المؤقتة. تنتهي صلاحيتها خلال 5 دقائق.',
    };
  }

  // ─── Public/Auth: Get presigned download URL for reading ─
  async getDownloadUrl(bookId: number, user?: any) {
    const book = await this.bookRepository.findOne({
      where: { id: bookId, status: BookStatus.APPROVED },
    });
    if (!book || !book.pdfKey) throw new NotFoundException('ملف الكتاب غير متاح');

    if (book.isPremium) {
      if (!user) {
        throw new ForbiddenException('يجب تسجيل الدخول وشراء الكتاب أو الاشتراك لتحميله');
      }
      // TODO: Add strict check for PLUS subscription or book purchase
      // For now, only ADMIN or AUTHOR can bypass, or we assume logged in users have access for testing
      if (user.role !== UserRole.ADMIN && user.role !== UserRole.AUTHOR) {
        // if user is a normal user, ideally check their subscription.
      }
    }

    const url = await this.uploadService.getPresignedDownloadUrl(book.pdfKey);
    this.bookRepository.increment({ id: bookId }, 'downloadCount', 1).catch(() => {});
    return { url, expiresIn: 900 };
  }

  // ─── Admin: Review & change book status ─────────────
  async updateStatus(bookId: number, dto: UpdateBookStatusDto) {
    const book = await this.bookRepository.findOne({ where: { id: bookId }, relations: ['author'] });
    if (!book) throw new NotFoundException('الكتاب غير موجود');
    
    await this.bookRepository.update(bookId, { status: dto.status });

    // Notify followers if published
    if (dto.status === BookStatus.APPROVED && book.status !== BookStatus.APPROVED) {
      const message = `قام المؤلف ${book.author?.name} بإضافة كتاب جديد: "${book.title}"`;
      await this.notifService.notifyAuthorFollowers(book.authorId, message, `/books/${book.slug}`);
    }

    return { message: `تم تغيير حالة الكتاب إلى ${dto.status}` };
  }

  // ─── Admin: List all books for review ───────────────
  async findAllAdmin(page: number, limit: number, status?: BookStatus) {
    const qb = this.bookRepository
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

  async incrementViewCount(id: number) {
    return this.bookRepository.increment({ id }, 'viewCount', 1);
  }

  // ─── Admin: Full CRUD ───────────────────────────────
  async updateAdmin(adminId: number, id: number, data: Partial<Book>) {
    await this.bookRepository.update(id, data);
    
    // Log activity
    await this.logRepo.save(this.logRepo.create({
      adminId,
      actionType: AdminActionType.UPDATE,
      targetEntity: 'Book',
      targetId: id,
      details: { action: 'admin_edit_book', updatedFields: Object.keys(data) }
    }));

    return this.bookRepository.findOne({ where: { id } });
  }

  async removeAdmin(adminId: number, id: number) {
    await this.bookRepository.delete(id);
    
    // Log activity
    await this.logRepo.save(this.logRepo.create({
      adminId,
      actionType: AdminActionType.DELETE,
      targetEntity: 'Book',
      targetId: id,
      details: { action: 'admin_delete_book' }
    }));

    return { success: true };
  }
}
