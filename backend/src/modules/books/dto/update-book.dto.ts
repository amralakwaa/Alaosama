import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { BookStatus } from '../../../database/entities';

export class UpdateBookStatusDto {
  @IsEnum(BookStatus, { message: 'الحالة غير صحيحة' })
  status: BookStatus;
}

export class UpdateBookDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  categoryId?: number;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;
}
