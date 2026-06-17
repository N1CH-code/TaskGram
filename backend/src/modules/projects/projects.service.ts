import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BotService } from '../bot/bot.service';
import { ProjectType, ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly bot: BotService,
  ) {}

  async create(data: any, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    if (data.type === 'JOB') {
      const canPost = await this.checkEmployerCanPost(userId);
      if (!canPost.allowed) {
        throw new BadRequestException(canPost.reason || 'Posting limit reached');
      }
    }

    const project = await this.prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type || 'FREELANCE',
        price: data.price ? parseFloat(data.price) : null,
        categoryId: data.categoryId || null,
        employerId: userId,
        skills: data.skills || [],
        deadline: data.deadline ? new Date(data.deadline) : null,
        isFeatured: user.isPremium,
      },
      include: {
        employer: true,
        category: true,
      },
    });

    await this.prisma.projectAction.create({
      data: {
        projectId: project.id,
        userId,
        action: 'CREATED',
        description: 'Project created',
      },
    });

    return project;
  }

  async findAll(filters: {
    type?: ProjectType;
    categoryId?: string;
    status?: ProjectStatus;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const where: any = { isActive: true };

    if (filters.type) where.type = filters.type;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (filters.sort === 'price') orderBy.price = 'desc';
    else if (filters.sort === 'newest') orderBy.createdAt = 'desc';
    else orderBy.createdAt = 'desc';

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, orderBy],
        include: {
          employer: { select: { id: true, firstName: true, username: true, photoUrl: true, rating: true } },
          category: true,
          _count: { select: { messages: true, reviews: true } },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return { projects, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        employer: { select: { id: true, firstName: true, username: true, photoUrl: true, rating: true } },
        worker: { select: { id: true, firstName: true, username: true, photoUrl: true, rating: true } },
        category: true,
        files: { orderBy: { createdAt: 'desc' } },
        reviews: {
          include: { author: true },
          orderBy: { createdAt: 'desc' },
        },
        actions: {
          include: { user: { select: { id: true, firstName: true, username: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { messages: true } },
      },
    });
  }

  async apply(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new BadRequestException('Project not found');
    if (project.employerId === userId) throw new BadRequestException('Cannot apply to own project');
    if (project.workerId) throw new BadRequestException('Project already has a worker');

    const existingMessage = await this.prisma.message.findFirst({
      where: { projectId, senderId: userId },
    });
    if (existingMessage) throw new BadRequestException('Already applied');

    const message = await this.prisma.message.create({
      data: {
        text: `👋 Хочу взяться за этот проект!`,
        type: 'TEXT',
        projectId,
        senderId: userId,
      },
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: { status: 'DISCUSSION' },
    });

    await this.prisma.projectAction.create({
      data: {
        projectId,
        userId,
        action: 'APPLIED',
        description: 'Worker applied to project',
      },
    });

    const worker = await this.prisma.user.findUnique({ where: { id: userId } });
    await this.bot.notifyNewApplicant(project, worker);

    return message;
  }

  async acceptWorker(projectId: string, workerId: string, employerId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.employerId !== employerId) {
      throw new ForbiddenException('Not your project');
    }

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        workerId,
        status: 'IN_PROGRESS',
      },
      include: {
        employer: true,
        worker: true,
      },
    });

    await this.prisma.projectAction.create({
      data: {
        projectId,
        userId: employerId,
        action: 'ACCEPTED',
        description: 'Worker accepted to project',
      },
    });

    await this.bot.notifyProjectStarted(updated);

    return updated;
  }

  async updateStatus(projectId: string, status: ProjectStatus, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new BadRequestException('Project not found');
    if (project.employerId !== userId && project.workerId !== userId) {
      throw new ForbiddenException('Not part of this project');
    }

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: { status },
      include: {
        employer: true,
        worker: true,
      },
    });

    await this.prisma.projectAction.create({
      data: {
        projectId,
        userId,
        action: `STATUS_${status}`,
        description: `Status changed to ${status}`,
      },
    });

    if (status === 'COMPLETED' || status === 'CANCELLED') {
      await this.prisma.project.update({
        where: { id: projectId },
        data: { isActive: false },
      });
    }

    return updated;
  }

  async getMyProjects(userId: string, role: 'employer' | 'worker') {
    const where = role === 'employer'
      ? { employerId: userId }
      : { workerId: userId };

    return this.prisma.project.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        employer: { select: { id: true, firstName: true, username: true, photoUrl: true } },
        worker: { select: { id: true, firstName: true, username: true, photoUrl: true } },
        category: true,
        _count: { select: { messages: true, files: true } },
      },
    });
  }

  async getPopular(type?: ProjectType) {
    const where: any = { isActive: true };
    if (type) where.type = type;

    return this.prisma.project.findMany({
      where,
      orderBy: [
        { reviews: { _count: 'desc' } },
        { messages: { _count: 'desc' } },
      ],
      take: 10,
      include: {
        employer: { select: { id: true, firstName: true, username: true, photoUrl: true, rating: true } },
        category: true,
        _count: { select: { messages: true } },
      },
    });
  }

  async getLastOrders() {
    return this.prisma.project.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        employer: { select: { id: true, firstName: true, username: true, photoUrl: true } },
        category: true,
      },
    });
  }

  private async checkEmployerCanPost(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { allowed: false, reason: 'User not found' };

    if (user.employerTier === 'SUBSCRIBER') {
      return { allowed: true };
    }

    if (user.employerTier === 'PUBLISHER') {
      const paidPosts = await this.prisma.project.count({
        where: { employerId: userId, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      });
      return { allowed: paidPosts < 5, reason: 'Paid posting limit reached' };
    }

    const freePosts = await this.prisma.project.count({
      where: {
        employerId: userId,
        type: 'JOB',
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    if (freePosts >= 2) {
      return { allowed: false, reason: 'Free limit: 2 posts per month. Upgrade to publish more.' };
    }

    return { allowed: true };
  }
}
