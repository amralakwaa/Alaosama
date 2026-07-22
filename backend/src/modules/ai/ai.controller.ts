import {
  Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatDto, AuthorAssistDto, AdminInsightDto } from './dto/chat.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // ── Health check (public) ────────────────────────────
  @Public()
  @Get('health')
  health() {
    return {
      status: 'ok',
      provider: 'groq',
      model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
    };
  }

  // ── Public Reader Chat ───────────────────────────────
  @Public()
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() dto: ChatDto) {
    return this.aiService.chatWithLibrary(dto.message);
  }

  // ── Author Assistant ─────────────────────────────────
  @Post('author/assist')
  @HttpCode(HttpStatus.OK)
  async authorAssist(
    @Body() dto: AuthorAssistDto,
    @CurrentUser() user: { id: number; role: UserRole },
  ) {
    return this.aiService.assistAuthor(
      user.id,
      dto.bookTitle,
      dto.description || '',
      dto.category || '',
      dto.action,
    );
  }

  // ── Admin Insights ───────────────────────────────────
  @Post('admin/insights')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async adminInsights(@Body() dto: AdminInsightDto) {
    return this.aiService.getAdminInsights(dto.query);
  }
}
