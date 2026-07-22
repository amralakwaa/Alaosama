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

export enum AdminActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  LOGIN = 'LOGIN',
}

@Entity('admin_activity_logs')
export class AdminActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adminId' })
  admin: User;

  @Column()
  @Index()
  adminId: number;

  @Column({ type: 'enum', enum: AdminActionType })
  actionType: AdminActionType;

  @Column({ length: 100 })
  targetEntity: string;

  @Column({ nullable: true })
  targetId: number;

  @Column({ type: 'json', nullable: true })
  details: any;

  @Column({ length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}