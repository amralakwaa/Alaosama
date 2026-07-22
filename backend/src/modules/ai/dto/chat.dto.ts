import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEnum } from 'class-validator';

export enum ChatRole {
  USER = 'user',
  AUTHOR = 'author',
  ADMIN = 'admin',
}

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message: string;

  @IsOptional()
  @IsEnum(ChatRole)
  role?: ChatRole = ChatRole.USER;

  @IsOptional()
  @IsString()
  conversationId?: string;
}

export class AuthorAssistDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  bookTitle: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsString()
  @IsNotEmpty()
  action: 'improve_description' | 'generate_keywords' | 'suggest_category' | 'review_book';
}

export class AdminInsightDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  query: string;
}
