import { Controller, Get, Patch, Delete, Body, Param, Query, ParseIntPipe, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { BookStatus, UserRole, UserStatus, ReviewStatus } from '../../database/entities';

@Controller('admin')
@Roles(UserRole.ADMIN) // All admin routes require ADMIN role
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Dashboard Stats ──────────────────────────────────
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // ─── Books Management ─────────────────────────────────
  @Get('books')
  getBooks(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: BookStatus,
  ) {
    return this.adminService.getBooks(+page, +limit, status);
  }

  @Patch('books/:id/status')
  updateBookStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: BookStatus },
  ) {
    return this.adminService.updateBookStatus(req.user.id, id, body.status);
  }

  @Patch('books/:id/feature')
  updateBookFeatured(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isFeatured: boolean },
  ) {
    return this.adminService.updateBookFeatured(req.user.id, id, body.isFeatured);
  }

  // ─── Users & Authors Management ─────────────────────────────────
  @Get('users')
  getUsers(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('role') role?: UserRole,
  ) {
    return this.adminService.getUsers(+page, +limit, role);
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: UserStatus },
  ) {
    return this.adminService.updateUserStatus(req.user.id, id, body.status);
  }

  @Patch('users/:id/role')
  updateUserRole(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { role: UserRole },
  ) {
    return this.adminService.updateUserRole(req.user.id, id, body.role);
  }

  @Patch('users/admin/:id')
  updateUserAdmin(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.adminService.updateUserAdmin(req.user.id, id, data);
  }

  @Delete('users/admin/:id')
  deleteUserAdmin(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.adminService.deleteUserAdmin(req.user.id, id);
  }

  @Patch('users/:id/feature')
  updateUserFeatured(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isFeatured: boolean },
  ) {
    return this.adminService.updateUserFeatured(req.user.id, id, body.isFeatured);
  }

  // ─── Logs Management ──────────────────────────────────
  @Get('logs')
  getLogs(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    return this.adminService.getLogs(+page, +limit);
  }

  // ─── Reviews Management ────────────────────────────────
  @Get('reviews')
  getAdminReviews(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: ReviewStatus,
    @Query('bookId') bookId?: string,
  ) {
    return this.adminService.getAdminReviews(+page, +limit, status, bookId ? +bookId : undefined);
  }

  @Get('reviews/stats')
  getAdminReviewStats() {
    return this.adminService.getAdminReviewStats();
  }

  @Patch('reviews/:id/status')
  updateReviewStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: ReviewStatus },
  ) {
    return this.adminService.updateReviewStatus(req.user.id, id, body.status);
  }

  @Delete('reviews/:id')
  deleteAdminReview(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.adminService.deleteAdminReview(req.user.id, id);
  }

  @Delete('review-replies/:id')
  deleteAdminReply(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.adminService.deleteAdminReply(req.user.id, id);
  }
}
