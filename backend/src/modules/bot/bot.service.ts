import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Telegraf, Context, Markup } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);
  private bot: Telegraf;

  constructor(private readonly prisma: PrismaService) {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');
  }

  async onModuleInit() {
    this.setupCommands();
    this.bot.launch().then(() => {
      this.logger.log('Telegram bot started');
    }).catch((err) => {
      this.logger.error('Bot launch failed', err);
    });
  }

  private setupCommands() {
    this.bot.start(async (ctx: Context) => {
      const userId = ctx.from?.id.toString();
      const refParam = ctx.message && 'text' in ctx.message
        ? (ctx.message.text as string).split(' ')[1]
        : undefined;

      let referralCode: string | undefined;
      if (refParam && refParam.startsWith('ref_')) {
        referralCode = refParam.replace('ref_', '');
      }

      const user = await this.prisma.user.findUnique({ where: { telegramId: userId! } });

      if (referralCode && !user) {
        const referrer = await this.prisma.user.findUnique({ where: { referralCode } });
        if (referrer) {
          await this.prisma.user.update({
            where: { id: referrer.id },
            data: { referredBy: userId },
          });
        }
      }

      const miniAppUrl = `${process.env.FRONTEND_URL || 'https://taskgram.app'}`;

      await ctx.reply(
        `👋 Добро пожаловать в TaskGram!\n\n` +
        `🚀 Платформа для поиска работы, фриланса и микрозадач внутри Telegram.\n\n` +
        `Открыть приложение:`,
        Markup.inlineKeyboard([
          Markup.button.webApp('🚀 Открыть TaskGram', miniAppUrl),
        ])
      );
    });

    this.bot.help(async (ctx: Context) => {
      await ctx.reply(
        `📖 *Помощь по TaskGram*\n\n` +
        `/start - Запустить бота\n` +
        `/profile - Мой профиль\n` +
        `/projects - Мои проекты\n` +
        `/help - Помощь\n\n` +
        `💡 Открой Mini App для полного функционала.`,
        { parse_mode: 'Markdown' }
      );
    });

    this.bot.command('profile', async (ctx: Context) => {
      const miniAppUrl = process.env.FRONTEND_URL || 'https://taskgram.app';
      await ctx.reply(
        `👤 Ваш профиль`,
        Markup.inlineKeyboard([
          Markup.button.webApp('👤 Открыть профиль', `${miniAppUrl}/profile`),
        ])
      );
    });

    this.bot.command('projects', async (ctx: Context) => {
      const miniAppUrl = process.env.FRONTEND_URL || 'https://taskgram.app';
      await ctx.reply(
        `📋 Ваши проекты`,
        Markup.inlineKeyboard([
          Markup.button.webApp('📋 Мои проекты', `${miniAppUrl}/projects`),
        ])
      );
    });

    this.bot.on('message', async (ctx: Context) => {
      if (ctx.message && 'text' in ctx.message) {
        const text = ctx.message.text as string;
        if (!text.startsWith('/')) {
          const miniAppUrl = process.env.FRONTEND_URL || 'https://taskgram.app';
          await ctx.reply(
            `💬 Используйте Mini App TaskGram для общения в проектах.\n\nОткрыть:`,
            Markup.inlineKeyboard([
              Markup.button.webApp('🚀 Открыть TaskGram', miniAppUrl),
            ])
          );
        }
      }
    });
  }

  async sendMessage(telegramId: string, text: string, buttons?: any[]) {
    try {
      const keyboard = buttons
        ? Markup.inlineKeyboard(buttons.map(b => [Markup.button.url(b.text, b.url)]))
        : undefined;

      await this.bot.telegram.sendMessage(telegramId, text, {
        parse_mode: 'HTML',
        ...(keyboard ? keyboard : {}),
      });
    } catch (err) {
      this.logger.error(`Failed to send message to ${telegramId}`, err);
    }
  }

  async notifyNewApplicant(project: any, worker: any) {
    const employer = await this.prisma.user.findUnique({ where: { id: project.employerId } });
    if (!employer) return;

    const miniAppUrl = process.env.FRONTEND_URL || 'https://taskgram.app';

    await this.sendMessage(
      employer.telegramId,
      `👋 <b>Новый отклик!</b>\n\n` +
      `📌 Проект: ${project.title}\n` +
      `👤 Исполнитель: ${worker.firstName || worker.username || 'Пользователь'}\n\n` +
      `Откройте Mini App, чтобы принять отклик.`,
      [{ text: '📋 Открыть проект', url: `${miniAppUrl}/projects/${project.id}` }]
    );
  }

  async notifyProjectStarted(project: any) {
    const worker = await this.prisma.user.findUnique({ where: { id: project.workerId } });
    const employer = await this.prisma.user.findUnique({ where: { id: project.employerId } });
    if (!worker || !employer) return;

    const miniAppUrl = process.env.FRONTEND_URL || 'https://taskgram.app';

    const message = `✅ <b>Проект начат!</b>\n\n📌 ${project.title}\n🆔 Проект #${project.id.slice(0, 8)}`;

    await this.sendMessage(worker.telegramId, message, [
      { text: '💬 Проект', url: `${miniAppUrl}/projects/${project.id}` }
    ]);
    await this.sendMessage(employer.telegramId, message, [
      { text: '💬 Проект', url: `${miniAppUrl}/projects/${project.id}` }
    ]);
  }
}
