import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReviewsService } from './reviews.service';
import { GetUser } from '../../common/decorators/user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() data: { projectId: string; rating: number; comment?: string }, @GetUser() user: any) {
    return this.reviewsService.create(data, user.id);
  }

  @Get('project/:projectId')
  async getProjectReviews(@Param('projectId') projectId: string) {
    return this.reviewsService.getProjectReviews(projectId);
  }

  @Get('user/:userId')
  async getUserReviews(@Param('userId') userId: string) {
    return this.reviewsService.getUserReviews(userId);
  }
}
