import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('telegram')
  async telegramAuth(@Body('initData') initData: string) {
    return this.authService.authenticate(initData);
  }

  @Post('telegram/simple')
  async telegramSimpleAuth(@Body('user') user: any) {
    return this.authService.simpleAuthenticate(user);
  }
}
