import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../database/entities';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Check duplicate email
    const exists = await this.userRepository.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('البريد الإلكتروني مسجّل مسبقاً');

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.USER,
    });

    const saved = await this.userRepository.save(user);

    const tokens = this.generateTokens(saved);
    return {
      user: this.sanitizeUser(saved),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    // Get user with password field (select: false by default)
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: dto.email })
      .getOne();

    if (!user) throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');

    if (user.status === 'banned') throw new UnauthorizedException('تم تعليق حسابك. يرجى التواصل مع الدعم.');

    // Update lastLoginAt
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    const tokens = this.generateTokens(user);
    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.sanitizeUser(user);
  }

  // ─── Private Helpers ─────────────────────────────────
  private generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safe } = user as any;
    return safe;
  }
}
