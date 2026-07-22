import { Controller, Get, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  @Get()
  getUserNotifications(@CurrentUser() user: { id: number }) {
    return this.notifService.getUserNotifications(user.id);
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.notifService.markAsRead(id, user.id);
  }
}
