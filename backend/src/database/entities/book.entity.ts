import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';

export enum BookStatus {
  PENDING = 'pending',     // Awaiting admin review
  APPROVED = 'approved',   // Published and visible
  REJECTED = 'rejected',   // Rejected by admin
  ARCHIVED = 'archived',   // Hidden by admin/author
}

export enum BookLanguage {
  ARABIC = 'ar',
  ENGLISH = 'en',
}

@Entity('books')
@Index(['status', 'categoryId'])   // Frequently filtered together
@Index(['authorId'])
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ unique: true, length: 300 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  aiSummary: string;   // AI-generated summary (Sprint 10)

  @Column({ nullable: true, length: 500 })
  coverImageUrl: string;   // S3 URL via Cloudflare CDN

  @Column({ nullable: true, length: 500 })
  pdfKey: string;   // S3 object key (NOT a public URL — Presigned only)

  @Column({ nullable: true, length: 500 })
  pdfPreviewKey: string;   // First 10 pages only for preview

  @Column({ nullable: true })
  pdfSizeBytes: number;

  @Column({ nullable: true })
  pageCount: number;

  @Column({ nullable: true, length: 20 })
  isbn: string;

  @Column({ nullable: true })
  publishYear: number;

  @Column({ nullable: true, length: 150 })
  publisher: string;

  @Column({ type: 'enum', enum: BookLanguage, default: BookLanguage.ARABIC })
  language: BookLanguage;

  @Column({ type: 'enum', enum: BookStatus, default: BookStatus.PENDING })
  status: BookStatus;

  @Column({ default: false })
  isPremium: boolean;   // PLUS subscribers only

  @Column({ default: 0 })
  downloadCount: number;   // Denormalized counter (Redis → MySQL sync)

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  readCount: number;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  reviewsCount: number;

  // Relations
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ nullable: true })
  authorId: number;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
