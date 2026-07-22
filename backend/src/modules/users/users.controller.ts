import {
  Controller, Get, Put, Post, Body, Param, ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── Dashboard ────────────────────────────────────────
  @Get('me/dashboard')
  getDashboard(@CurrentUser() user: { id: number }) {
    return this.usersService.getDashboardStats(user.id);
  }

  // ─── Profile ──────────────────────────────────────────
  @Get('me/profile')
  getProfile(@CurrentUser() user: { id: number }) {
    return this.usersService.getProfile(user.id);
  }

  @Put('me/profile')
  updateProfile(
    @CurrentUser() user: { id: number },
    @Body() body: { name?: string; bio?: string; avatar?: string },
  ) {
    return this.usersService.updateProfile(user.id, body);
  }

  // ─── Reading History ──────────────────────────────────
  @Get('me/reading-history')
  getReadingHistory(@CurrentUser() user: { id: number }) {
    return this.usersService.getReadingHistory(user.id);
  }

  // ─── Update book progress ─────────────────────────────
  @Post('me/progress/:bookId')
  updateProgress(
    @CurrentUser() user: { id: number },
    @Param('bookId', ParseIntPipe) bookId: number,
    @Body() body: { currentPage: number },
  ) {
    return this.usersService.upsertProgress(user.id, bookId, body.currentPage);
  }

  // ─── Get progress for a specific book ────────────────
  @Get('me/progress/:bookId')
  getProgress(
    @CurrentUser() user: { id: number },
    @Param('bookId', ParseIntPipe) bookId: number,
  ) {
    return this.usersService.getBookProgress(user.id, bookId);
  }

  // ─── Favorites ────────────────────────────────────────
  @Get('me/favorites')
  getFavorites(@CurrentUser() user: { id: number }) {
    return this.usersService.getFavorites(user.id);
  }

  @Post('me/favorites/:bookId')
  toggleFavorite(
    @CurrentUser() user: { id: number },
    @Param('bookId', ParseIntPipe) bookId: number,
  ) {
    return this.usersService.toggleFavorite(user.id, bookId);
  }

  @Get('me/favorites/:bookId')
  isFavorited(
    @CurrentUser() user: { id: number },
    @Param('bookId', ParseIntPipe) bookId: number,
  ) {
    return this.usersService.isFavorited(user.id, bookId);
  }
}
