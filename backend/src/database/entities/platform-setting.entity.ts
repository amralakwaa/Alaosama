import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('platform_settings')
export class PlatformSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  key: string;

  @Column({ type: 'text', nullable: true })
  value: string;

  @Column({ length: 20, default: 'text' })
  type: string; // text | image | json | url

  @Column({ length: 200, nullable: true })
  label: string; // Human-readable label in Arabic

  @UpdateDateColumn()
  updatedAt: Date;
}
