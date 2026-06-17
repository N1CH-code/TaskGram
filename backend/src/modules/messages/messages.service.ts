import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BotService } from '../bot/bot.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bot: BotService,
  ) {}

  async send(data: { projectId: string; text?: string; fileId?: string; type?: string }, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) throw new ForbiddenException('Project not found');
    if (project.employerId !== userId && project.workerId !== userId) {
      throw new ForbiddenException('Not part of this project');
    }

    const message = await this.prisma.message.create({
      data: {
        text: data.text,
        type: (data.type as any) || 'TEXT',
        projectId: data.projectId,
        senderId: userId,
        fileId: data.fileId || null,
      },
      include: {
        sender: { select: { id: true, firstName: true, username: true, photoUrl: true } },
        file: true,
      },
    });

    const recipientId = project.employerId === userId ? project.workerId : project.employerId;
    if (recipientId) {
      const recipient = await this.prisma.user.findUnique({ where: { id: recipientId } });
      if (recipient) {
        await this.bot.sendMessage(recipient.telegramId, 
          `💬 Новое сообщение в проекте "${project.title}":\n\n${data.text || '📎 Файл отправлен'}`
        );
      }
    }

    return message;
  }

  async getProjectMessages(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new ForbiddenException('Project not found');
    if (project.employerId !== userId && project.workerId !== userId) {
      throw new ForbiddenException('Not part of this project');
    }

    const messages = await this.prisma.message.findMany({
      where: { projectId },
      include: {
        sender: { select: { id: true, firstName: true, username: true, photoUrl: true } },
        file: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    await this.prisma.message.updateMany({
      where: { projectId, senderId: { not: userId }, isRead: false },
      data: { isRead: true },
    });

    return messages;
  }
}
