import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'الاسم يجب أن يكون نصاً' })
  @MinLength(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' })
  @MaxLength(100, { message: 'الاسم لا يمكن أن يتجاوز 100 حرف' })
  name: string;

  @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  @MaxLength(50)
  password: string;
}
