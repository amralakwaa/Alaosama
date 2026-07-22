import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 10, nullable: true })
  icon: string;

  @Column({ length: 500, nullable: true })
  imageUrl: string;

  @Column({ length: 300, nullable: true })
  whatsappMessage: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  displayOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
