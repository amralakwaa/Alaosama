import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { PublishingRequestsService } from './publishing-requests.service';
import { CreatePublishRequestDto, UpdatePublishRequestStatusDto } from './dto/publishing-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../database/entities';

@Controller('publish-requests')
export class PublishingRequestsController {
  constructor(private readonly service: PublishingRequestsService) {}

  // ─── Public: Submit a request ───────────────────────────────
  @Post()
  create(@Body() dto: CreatePublishRequestDto, @Request() req: any) {
    const userId = req.user?.id; // Optional — works for guests too
    return this.service.create(dto, userId);
  }

  // ─── Auth: My requests ──────────────────────────────────────
  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMy(@Request() req: any) {
    return this.service.findMy(req.user.id);
  }

  // ─── Admin: All requests ────────────────────────────────────
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.service.findAll(status, +page, +limit);
  }

  // ─── Admin: Update status ────────────────────────────────────
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePublishRequestStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }

  // ─── Admin: Stats ─────────────────────────────────────────
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getStats() {
    return this.service.getStats();
  }
}
