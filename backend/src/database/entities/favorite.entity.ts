import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Column,
} from 'typeorm';
import { User } from './user.entity';
import { Book } from './book.entity';

@Entity('favorites')
@Index(['userId', 'bookId'], { unique: true })
export class Favorite {
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

  @CreateDateColumn()
  createdAt: Date;
}
