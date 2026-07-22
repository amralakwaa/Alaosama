import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum PublishRequestStatus {
  SENT = 'sent',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  NEEDS_REVISION = 'needs_revision',
  REJECTED = 'rejected',
}

@Entity('publishing_requests')
export class PublishingRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  manuscriptTitle: string;

  @Column({ length: 100, nullable: true })
  authorName: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 150, nullable: true })
  email: string;

  @Column({ length: 100, nullable: true })
  genre: string;

  @Column({ nullable: true })
  pageCount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PublishRequestStatus,
    default: PublishRequestStatus.SENT,
  })
  status: PublishRequestStatus;

  @Column({ type: 'text', nullable: true })
  adminNotes: string;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
