import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(data: { projectId: string; rating: number; comment?: string }, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) throw new BadRequestException('Project not found');
    if (project.status !== 'COMPLETED') throw new BadRequestException('Project not completed');
    if (project.employerId !== userId && project.workerId !== userId) {
      throw new ForbiddenException('Not part of this project');
    }

    const existingReview = await this.prisma.review.findFirst({
      where: { projectId: data.projectId, authorId: userId },
    });
    if (existingReview) throw new BadRequestException('Already reviewed');

    const targetId = project.employerId === userId ? project.workerId! : project.employerId;

    const review = await this.prisma.review.create({
      data: {
        projectId: data.projectId,
        authorId: userId,
        targetId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        author: { select: { id: true, firstName: true, username: true, photoUrl: true } },
        target: { select: { id: true, firstName: true, username: true, photoUrl: true } },
      },
    });

    await this.usersService.updateRating(targetId);

    return review;
  }

  async getProjectReviews(projectId: string) {
    return this.prisma.review.findMany({
      where: { projectId },
      include: {
        author: { select: { id: true, firstName: true, username: true, photoUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserReviews(userId: string) {
    return this.prisma.review.findMany({
      where: { targetId: userId },
      include: {
        author: { select: { id: true, firstName: true, username: true, photoUrl: true } },
        project: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
