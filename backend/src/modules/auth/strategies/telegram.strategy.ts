import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class TelegramStrategy extends PassportStrategy(Strategy, 'telegram') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: (req) => req?.body?.initData || null,
      ignoreExpiration: true,
      secretOrKey: process.env.TELEGRAM_BOT_TOKEN || '',
    });
  }

  async validate(payload: any) {
    return { telegramId: payload.id };
  }
}
