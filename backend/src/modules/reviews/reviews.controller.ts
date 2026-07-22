import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Req,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../database/entities';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ─── Public: Get book reviews + stats ────────────────────────────────────
  @Public()
  @Get('books/:id/reviews')
  getBookReviews(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getBookReviews(id);
  }

  // ─── Authenticated: Get current user's review for a book ─────────────────
  @Get('books/:id/my-review')
  getMyReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.reviewsService.getUserReview(user.id, id);
  }

  // ─── Authenticated: Add or update own review ─────────────────────────────
  @Post('books/:id/reviews')
  addReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { rating: number; comment?: string },
    @CurrentUser() user: { id: number },
  ) {
    return this.reviewsService.addReview(
      user.id,
      id,
      body.rating,
      body.comment || '',
    );
  }

  // ─── Authenticated: Delete own review ────────────────────────────────────
  @Delete('reviews/:id')
  deleteReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.reviewsService.deleteReview(user.id, id);
  }

  // ─── Author: Reply to a review on their book ─────────────────────────────
  @Post('reviews/:id/reply')
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  addReply(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { replyText: string },
    @CurrentUser() user: { id: number },
  ) {
    return this.reviewsService.addReply(user.id, id, body.replyText);
  }

  // ─── Author/Admin: Delete a reply ─────────────────────────────────────────
  @Delete('review-replies/:id')
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  deleteReply(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: UserRole },
  ) {
    return this.reviewsService.deleteReply(user.id, id, user.role);
  }

  // ─── Author: Get reviews for their books ─────────────────────────────────
  @Get('author/reviews')
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  getAuthorReviews(
    @CurrentUser() user: { id: number },
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.reviewsService.getAuthorReviews(user.id, +page, +limit);
  }

  // ─── Author: Get review stats ─────────────────────────────────────────────
  @Get('author/review-stats')
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  getAuthorReviewStats(@CurrentUser() user: { id: number }) {
    return this.reviewsService.getAuthorReviewStats(user.id);
  }
}