import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalUsers,
      totalProjects,
      activeProjects,
      totalReviews,
      totalSubscriptions,
      recentUsers,
      recentProjects,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.project.count(),
      this.prisma.project.count({ where: { status: { in: ['IN_PROGRESS', 'DISCUSSION'] } } }),
      this.prisma.review.count(),
      this.prisma.subscription.count(),
      this.prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
      this.prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          employer: { select: { id: true, firstName: true, username: true } },
          worker: { select: { id: true, firstName: true, username: true } },
        },
      }),
    ]);

    return {
      stats: { totalUsers, totalProjects, activeProjects, totalReviews, totalSubscriptions },
      recentUsers,
      recentProjects,
    };
  }

  async getUsers(page = 1, limit = 20) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { sentProjects: true } } },
      }),
      this.prisma.user.count(),
    ]);
    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async toggleBlockUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { isBlocked: !user.isBlocked },
    });
  }

  async deleteProject(projectId: string) {
    return this.prisma.project.delete({ where: { id: projectId } });
  }

  async getStats() {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [usersThisMonth, projectsThisMonth, revenue] = await Promise.all([
      this.prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
      this.prisma.project.count({ where: { createdAt: { gte: monthAgo } } }),
      this.prisma.subscription.count({ where: { createdAt: { gte: monthAgo } } }),
    ]);

    const usersByRole = await this.prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    const projectsByType = await this.prisma.project.groupBy({
      by: ['type'],
      _count: true,
    });

    const projectsByStatus = await this.prisma.project.groupBy({
      by: ['status'],
      _count: true,
    });

    return {
      monthly: { usersThisMonth, projectsThisMonth, newSubscriptions: revenue },
      usersByRole,
      projectsByType,
      projectsByStatus,
    };
  }
}
