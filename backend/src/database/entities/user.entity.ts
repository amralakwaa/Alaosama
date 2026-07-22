import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  AUTHOR = 'author',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ select: false }) // Never return password in queries
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ nullable: true, length: 255 })
  avatar: string;

  @Column({ nullable: true, length: 500 })
  bio: string;

  @Column({ type: 'json', nullable: true })
  socialLinks: any;

  @Column({ nullable: true, length: 100 })
  location: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
