import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        portfolioItems: true,
        reviewsReceived: {
          include: { author: true, project: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async findByTelegramId(telegramId: string) {
    return this.prisma.user.findUnique({ where: { telegramId } });
  }

  async updateProfile(id: string, data: any) {
    const updateData: any = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.skills !== undefined) updateData.skills = data.skills;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async getWorkers(filters: { skills?: string; rating?: number; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const where: any = {
      OR: [
        { role: 'WORKER' },
        { role: 'BOTH' },
      ],
    };

    if (filters.skills) {
      where.skills = { hasSome: filters.skills.split(',') };
    }
    if (filters.rating) {
      where.rating = { gte: filters.rating };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { rating: 'desc' },
        include: {
          portfolioItems: { take: 3 },
          _count: { select: { sentProjects: true, reviewsReceived: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateRating(userId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { targetId: userId },
      select: { rating: true },
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    const completedCount = await this.prisma.project.count({
      where: {
        OR: [{ employerId: userId }, { workerId: userId }],
        status: 'COMPLETED',
      },
    });

    const activeCount = await this.prisma.project.count({
      where: {
        OR: [{ employerId: userId }, { workerId: userId }],
        status: { in: ['IN_PROGRESS', 'REVIEW'] },
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        completedProjects: completedCount,
        activeProjects: activeCount,
        reviewsCount: reviews.length,
      },
    });
  }
}
