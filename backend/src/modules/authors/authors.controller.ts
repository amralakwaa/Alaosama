import { Controller, Get, Post, Delete, Param, ParseIntPipe, Query } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Public()
  @Get()
  getAllAuthors(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.authorsService.getAllAuthors(Number(page), Number(limit));
  }

  @Get('followed')
  getFollowedAuthors(@CurrentUser() user: { id: number }) {
    return this.authorsService.getFollowedAuthors(user.id);
  }

  @Get('me/stats')
  getDashboardStats(@CurrentUser() user: { id: number }) {
    return this.authorsService.getDashboardStats(user.id);
  }

  @Public()
  @Get(':id/profile')
  getAuthorProfile(@Param('id') id: string) {
    return this.authorsService.getAuthorProfile(id);
  }

  @Post(':id/follow')
  followAuthor(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.authorsService.followAuthor(user.id, id);
  }

  @Delete(':id/follow')
  unfollowAuthor(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.authorsService.unfollowAuthor(user.id, id);
  }
}
