import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ContactsService } from './contacts.service';
import { GetUser } from '../../common/decorators/user.decorator';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post('request')
  @UseGuards(AuthGuard('jwt'))
  async request(
    @Body() data: { targetId: string; projectId?: string },
    @GetUser() user: any,
  ) {
    return this.contactsService.requestContact(user.id, data.targetId, data.projectId);
  }

  @Post(':id/approve')
  @UseGuards(AuthGuard('jwt'))
  async approve(@Param('id') id: string, @GetUser() user: any) {
    return this.contactsService.approveContact(id, user.id);
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  async getMy(@GetUser() user: any) {
    return this.contactsService.getMyContacts(user.id);
  }

  @Get('pending')
  @UseGuards(AuthGuard('jwt'))
  async getPending(@GetUser() user: any) {
    return this.contactsService.getPendingRequests(user.id);
  }
}
