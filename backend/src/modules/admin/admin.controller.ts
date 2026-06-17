import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { GetUser } from '../../common/decorators/user.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @UseGuards(AuthGuard('jwt'))
  async getDashboard(@GetUser() user: any) {
    this.checkAdmin(user);
    return this.adminService.getDashboard();
  }

  @Get('users')
  @UseGuards(AuthGuard('jwt'))
  async getUsers(@GetUser() user: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    this.checkAdmin(user);
    return this.adminService.getUsers(page, limit);
  }

  @Post('users/:id/toggle-block')
  @UseGuards(AuthGuard('jwt'))
  async toggleBlock(@GetUser() user: any, @Param('id') id: string) {
    this.checkAdmin(user);
    return this.adminService.toggleBlockUser(id);
  }

  @Post('projects/:id/delete')
  @UseGuards(AuthGuard('jwt'))
  async deleteProject(@GetUser() user: any, @Param('id') id: string) {
    this.checkAdmin(user);
    return this.adminService.deleteProject(id);
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  async getStats(@GetUser() user: any) {
    this.checkAdmin(user);
    return this.adminService.getStats();
  }

  private checkAdmin(user: any) {
    if (!user.isAdmin) {
      throw new Error('Unauthorized: Admin only');
    }
  }
}
