import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';
import { GetUser } from '../../common/decorators/user.decorator';
import { ProjectType, ProjectStatus } from '@prisma/client';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(
    @Query('type') type?: ProjectType,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: ProjectStatus,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort') sort?: string,
  ) {
    return this.projectsService.findAll({ type, categoryId, status, search, page, limit, sort });
  }

  @Get('popular')
  async getPopular(@Query('type') type?: ProjectType) {
    return this.projectsService.getPopular(type);
  }

  @Get('last-orders')
  async getLastOrders() {
    return this.projectsService.getLastOrders();
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  async getMy(
    @GetUser() user: any,
    @Query('role') role: 'employer' | 'worker' = 'worker',
  ) {
    return this.projectsService.getMyProjects(user.id, role);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() data: any, @GetUser() user: any) {
    return this.projectsService.create(data, user.id);
  }

  @Post(':id/apply')
  @UseGuards(AuthGuard('jwt'))
  async apply(@Param('id') id: string, @GetUser() user: any) {
    return this.projectsService.apply(id, user.id);
  }

  @Post(':id/accept')
  @UseGuards(AuthGuard('jwt'))
  async accept(
    @Param('id') id: string,
    @Body('workerId') workerId: string,
    @GetUser() user: any,
  ) {
    return this.projectsService.acceptWorker(id, workerId, user.id);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'))
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ProjectStatus,
    @GetUser() user: any,
  ) {
    return this.projectsService.updateStatus(id, status, user.id);
  }
}
