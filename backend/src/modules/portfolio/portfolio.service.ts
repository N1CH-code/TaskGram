import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { title: string; description?: string; url?: string; fileUrl?: string; imageUrl?: string; tags?: string[] }, userId: string) {
    return this.prisma.portfolioItem.create({
      data: {
        ...data,
        tags: data.tags || [],
        userId,
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.portfolioItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, userId: string, data: any) {
    return this.prisma.portfolioItem.updateMany({
      where: { id, userId },
      data,
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.portfolioItem.deleteMany({
      where: { id, userId },
    });
  }
}
