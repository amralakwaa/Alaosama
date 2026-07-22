import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Book } from './book.entity';

@Entity('reading_progress')
@Index(['userId', 'bookId'], { unique: true })
export class ReadingProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId' })
  book: Book;

  @Column()
  bookId: number;

  @Column({ default: 1 })
  currentPage: number;

  @Column({ default: 0, type: 'decimal', precision: 5, scale: 2 })
  progressPercent: number;

  @Column({ nullable: true })
  lastReadAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
