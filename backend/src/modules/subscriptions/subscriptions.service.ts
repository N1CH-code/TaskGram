import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPlans() {
    return {
      worker: [
        {
          tier: 'PREMIUM',
          name: 'Premium',
          price: 490,
          period: 'month',
          features: [
            'Безлимитные отклики',
            'Приоритет в выдаче',
            'Расширенное портфолио',
            'Значок Premium',
          ],
        },
        {
          tier: 'PREMIUM_PRO',
          name: 'Premium Pro',
          price: 990,
          period: 'month',
          features: [
            'Всё из Premium',
            'Выделенный профиль',
            'Рекомендации',
            'Расширенная статистика',
          ],
        },
      ],
      employer: [
        {
          tier: 'PUBLISHER',
          name: 'Публикация заказа',
          description: 'Фриланс-заказ',
          price: 99,
          type: 'one_time',
        },
        {
          tier: 'PUBLISHER',
          name: 'Публикация вакансии',
          description: 'Вакансия',
          price: 199,
          type: 'one_time',
        },
        {
          tier: 'SUBSCRIBER',
          name: 'Подписка работодателя',
          price: 1490,
          period: 'month',
          features: [
            'Безлимит публикаций',
            'Приоритетная поддержка',
          ],
        },
      ],
    };
  }

  async activateTrial(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    if (user.trialUsed) throw new BadRequestException('Trial already used');

    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: true,
        premiumExpiresAt: expiresAt,
        subscriptionTier: 'PREMIUM',
        trialUsed: true,
      },
    });

    await this.prisma.subscription.create({
      data: {
        userId,
        tier: 'PREMIUM',
        startDate: new Date(),
        endDate: expiresAt,
      },
    });

    return { message: 'Trial activated', expiresAt };
  }

  async subscribeWorker(userId: string, tier: 'PREMIUM' | 'PREMIUM_PRO') {
    const prices = { PREMIUM: 490, PREMIUM_PRO: 990 };
    const price = prices[tier];
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const paymentLink = await this.createPaymentLink(userId, price, `TaskGram ${tier}`);

    return {
      message: 'Redirect to payment',
      paymentLink,
      tier,
      price,
      expiresAt,
    };
  }

  async subscribeEmployer(userId: string) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const paymentLink = await this.createPaymentLink(userId, 1490, 'TaskGram Employer');

    return {
      message: 'Redirect to payment',
      paymentLink,
      tier: 'SUBSCRIBER',
      price: 1490,
      expiresAt,
    };
  }

  async confirmPayment(paymentId: string, userId: string, tier: string) {
    let updateData: any = {};

    if (tier === 'PREMIUM' || tier === 'PREMIUM_PRO') {
      updateData = {
        isPremium: true,
        premiumExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subscriptionTier: tier,
      };
    } else if (tier === 'SUBSCRIBER') {
      updateData = {
        employerTier: 'SUBSCRIBER',
        employerExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    } else if (tier === 'PUBLISHER_FREELANCE') {
      updateData = { employerTier: 'PUBLISHER' };
    } else if (tier === 'PUBLISHER_JOB') {
      updateData = { employerTier: 'PUBLISHER' };
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    await this.prisma.subscription.create({
      data: {
        userId,
        tier: tier as any,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentId,
      },
    });

    return { message: 'Payment confirmed' };
  }

  private async createPaymentLink(userId: string, amount: number, description: string): Promise<string> {
    // Integration with YooKassa (ЮKassa) or similar Russian payment system
    // For MVP, return a placeholder
    return `${process.env.FRONTEND_URL || 'https://taskgram.app'}/payment?amount=${amount}&userId=${userId}&desc=${encodeURIComponent(description)}`;
  }
}
