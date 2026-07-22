import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { SettingsService } from './settings.service';
import { UpdateSettingsBatchDto } from './dto/setting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../database/entities';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Put('admin/batch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateBatch(@Body() dto: UpdateSettingsBatchDto) {
    return this.settingsService.updateBatch(dto);
  }
}
