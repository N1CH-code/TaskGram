import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async requestContact(initiatorId: string, targetId: string, projectId?: string) {
    if (initiatorId === targetId) throw new BadRequestException('Cannot request yourself');

    const existing = await this.prisma.contact.findFirst({
      where: {
        OR: [
          { initiatorId, receiverId: targetId, projectId: projectId || null },
          { initiatorId: targetId, receiverId: initiatorId, projectId: projectId || null },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'APPROVED') {
        return { status: 'APPROVED', message: 'Contacts already shared' };
      }
      if (existing.status === 'REQUESTED') {
        return { status: 'PENDING', message: 'Request already sent' };
      }
    }

    const contact = await this.prisma.contact.create({
      data: {
        initiatorId,
        receiverId: targetId,
        projectId: projectId || null,
        status: 'REQUESTED',
      },
    });

    return { contact, status: 'REQUESTED' };
  }

  async approveContact(contactId: string, userId: string) {
    const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact || contact.receiverId !== userId) {
      throw new BadRequestException('Cannot approve this request');
    }

    return this.prisma.contact.update({
      where: { id: contactId },
      data: { status: 'APPROVED' },
    });
  }

  async getMyContacts(userId: string) {
    return this.prisma.contact.findMany({
      where: {
        OR: [{ initiatorId: userId }, { receiverId: userId }],
        status: 'APPROVED',
      },
      include: {
        initiator: { select: { id: true, firstName: true, username: true, photoUrl: true, phone: true } },
        receiver: { select: { id: true, firstName: true, username: true, photoUrl: true, phone: true } },
      },
    });
  }

  async getPendingRequests(userId: string) {
    return this.prisma.contact.findMany({
      where: { receiverId: userId, status: 'REQUESTED' },
      include: {
        initiator: { select: { id: true, firstName: true, username: true, photoUrl: true } },
      },
    });
  }
}
