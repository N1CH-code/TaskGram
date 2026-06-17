import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { GetUser } from '../../common/decorators/user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findByUser(@GetUser() user: any, @Query('page') page?: number) {
    return this.notificationsService.findByUser(user.id, page);
  }

  @Post(':id/read')
  @UseGuards(AuthGuard('jwt'))
  async markAsRead(@Param('id') id: string, @GetUser() user: any) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Post('read-all')
  @UseGuards(AuthGuard('jwt'))
  async markAllAsRead(@GetUser() user: any) {
    return this.notificationsService.markAllAsRead(user.id);
  }
}
