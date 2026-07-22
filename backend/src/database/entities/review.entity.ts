import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Book } from './book.entity';
import { ReviewReply } from './review-reply.entity';

export enum ReviewStatus {
  APPROVED = 'approved',
  HIDDEN = 'hidden',
  PENDING = 'pending',
}

@Entity('reviews')
@Index(['bookId'])
@Index(['userId'])
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number; // 1 to 5

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.APPROVED })
  status: ReviewStatus;

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

  @OneToMany(() => ReviewReply, (reply) => reply.review, { cascade: true, eager: false })
  replies: ReviewReply[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
