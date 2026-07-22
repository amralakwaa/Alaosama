import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  Query, ParseIntPipe,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookStatusDto } from './dto/update-book.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, BookStatus } from '../../database/entities';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // ─── Public: Search ────────────────────────────────
  @Public()
  @Get('search')
  search(
    @Query('q') q = '',
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('categoryId') categoryId?: string,
  ) {
    return this.booksService.search(q, +page, Math.min(+limit, 50), categoryId ? +categoryId : undefined);
  }

  // ─── Public ─────────────────────────────────────────
  @Public()
  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('categoryId') categoryId?: string,
    @Query('isPremium') isPremium?: string,
  ) {
    let premiumFilter: boolean | undefined = undefined;
    if (isPremium === 'true') premiumFilter = true;
    if (isPremium === 'false') premiumFilter = false;
    
    return this.booksService.findAll(+page, Math.min(+limit, 50), categoryId ? +categoryId : undefined, premiumFilter);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.booksService.findBySlug(slug);
  }

  @Public()
  @Get(':slug/similar')
  findSimilar(@Param('slug') slug: string) {
    return this.booksService.findSimilar(slug);
  }

  // ─── Public/Authenticated: Get secure download URL ───
  @Public()
  @Get(':id/download-url')
  getDownloadUrl(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: { id: number; role: UserRole }
  ) {
    return this.booksService.getDownloadUrl(id, user);
  }

  // ─── Author/Admin: Submit a new book ─────────────────
  @Post()
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  create(
    @Body() dto: CreateBookDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.booksService.create(dto, user.id);
  }

  // ─── Author/Admin: Get upload URLs for PDF + Cover ───
  @Post(':id/upload-url')
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  getUploadUrl(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: UserRole },
  ) {
    return this.booksService.getUploadUrl(id, user.id, user.role);
  }

  // ─── Admin: List all books (any status) ─────────────
  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  findAllAdmin(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: BookStatus,
  ) {
    return this.booksService.findAllAdmin(+page, +limit, status);
  }

  // ─── Admin: Approve / Reject / Archive book ──────────
  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookStatusDto,
  ) {
    return this.booksService.updateStatus(id, dto);
  }

  @Patch('admin/:id')
  @Roles(UserRole.ADMIN)
  updateAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
    @CurrentUser() user: { id: number },
  ) {
    return this.booksService.updateAdmin(user.id, id, data);
  }

  @Delete('admin/:id')
  @Roles(UserRole.ADMIN)
  removeAdmin(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.booksService.removeAdmin(user.id, id);
  }
}
