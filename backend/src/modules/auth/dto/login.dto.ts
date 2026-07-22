import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح' })
  email: string;

  @IsString()
  @MinLength(1, { message: 'كلمة المرور مطلوبة' })
  password: string;
}
