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
import { Review } from './review.entity';

@Entity('review_replies')
@Index(['reviewId'])
@Index(['authorId'])
export class ReviewReply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  replyText: string;

  @ManyToOne(() => Review, (review) => review.replies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewId' })
  review: Review;

  @Column()
  reviewId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: number;

  @CreateDateColumn()
  createdAt: Date;
}
