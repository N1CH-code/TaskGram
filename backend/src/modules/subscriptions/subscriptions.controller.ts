import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionsService } from './subscriptions.service';
import { GetUser } from '../../common/decorators/user.decorator';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  async getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Post('trial')
  @UseGuards(AuthGuard('jwt'))
  async activateTrial(@GetUser() user: any) {
    return this.subscriptionsService.activateTrial(user.id);
  }

  @Post('worker')
  @UseGuards(AuthGuard('jwt'))
  async subscribeWorker(@GetUser() user: any, @Body('tier') tier: 'PREMIUM' | 'PREMIUM_PRO') {
    return this.subscriptionsService.subscribeWorker(user.id, tier);
  }

  @Post('employer')
  @UseGuards(AuthGuard('jwt'))
  async subscribeEmployer(@GetUser() user: any) {
    return this.subscriptionsService.subscribeEmployer(user.id);
  }

  @Post('confirm')
  async confirmPayment(@Body() data: { paymentId: string; userId: string; tier: string }) {
    return this.subscriptionsService.confirmPayment(data.paymentId, data.userId, data.tier);
  }
}
