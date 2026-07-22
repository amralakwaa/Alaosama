import {
  IsString, IsOptional, IsNumber, IsBoolean,
  IsEnum, MinLength, MaxLength, Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BookLanguage } from '../../../database/entities';

export class CreateBookDto {
  @IsString()
  @MinLength(2, { message: 'العنوان يجب أن يكون حرفين على الأقل' })
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsEnum(BookLanguage)
  language?: BookLanguage;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  isbn?: string;

  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(2100)
  @Type(() => Number)
  publishYear?: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  publisher?: string;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageCount?: number;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  pdfKey?: string;
}
