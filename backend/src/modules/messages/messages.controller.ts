import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MessagesService } from './messages.service';
import { GetUser } from '../../common/decorators/user.decorator';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async send(@Body() data: { projectId: string; text?: string; fileId?: string }, @GetUser() user: any) {
    return this.messagesService.send(data, user.id);
  }

  @Get('project/:projectId')
  @UseGuards(AuthGuard('jwt'))
  async getProjectMessages(@Param('projectId') projectId: string, @GetUser() user: any) {
    return this.messagesService.getProjectMessages(projectId, user.id);
  }
}
