import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
  ) {}

  async authenticate(initData: string): Promise<{ accessToken: string; user: any }> {
    const validated = this.validateTelegramData(initData);
    if (!validated) {
      throw new UnauthorizedException('Invalid Telegram data');
    }

    const userData = this.parseInitData(initData);
    let user = await this.prisma.user.findUnique({
      where: { telegramId: userData.id.toString() },
    });

    if (!user) {
      user = await this.createUser(userData);
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          username: userData.username || user.username,
          firstName: userData.first_name || user.firstName,
          lastName: userData.last_name || user.lastName,
          photoUrl: userData.photo_url || user.photoUrl,
        },
      });
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('User is blocked');
    }

    const payload = { sub: user.id, telegramId: user.telegramId };
    const accessToken = this.jwtService.sign(payload);

    await this.redis.set(`session:${user.id}`, accessToken, 'EX', 604800);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  async validateUser(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.isBlocked) return null;
    return this.sanitizeUser(user);
  }

  private validateTelegramData(initData: string): boolean {
    try {
      const params = new URLSearchParams(initData);
      const hash = params.get('hash');
      if (!hash) return false;

      const dataCheckString = Array.from(params.entries())
        .filter(([key]) => key !== 'hash')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      const secretKey = require('crypto')
        .createHmac('sha256', 'WebAppData')
        .update(process.env.TELEGRAM_BOT_TOKEN || '')
        .digest();

      const computedHash = require('crypto')
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      return computedHash === hash;
    } catch (error) {
      this.logger.error('Validation error', error);
      return false;
    }
  }

  private parseInitData(initData: string): any {
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    return userStr ? JSON.parse(userStr) : {};
  }

  private async createUser(telegramUser: any) {
    return this.prisma.user.create({
      data: {
        telegramId: telegramUser.id.toString(),
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        photoUrl: telegramUser.photo_url,
      },
    });
  }

  sanitizeUser(user: any) {
    const { isBlocked, referralCode, ...safe } = user;
    return safe;
  }
}
