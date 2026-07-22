import { IsString, IsOptional, IsEmail, IsNumber, MaxLength, MinLength } from 'class-validator';

export class CreatePublishRequestDto {
  @IsString()
  @MaxLength(255)
  manuscriptTitle: string;

  @IsString()
  @MaxLength(100)
  authorName: string;

  @IsString()
  @MinLength(7)
  @MaxLength(20)
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsNumber()
  pageCount?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePublishRequestStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;
}
