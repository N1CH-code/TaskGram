import { Controller, Get, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { GetUser } from '../../common/decorators/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@GetUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Put('me')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@GetUser() user: any, @Body() data: any) {
    return this.usersService.updateProfile(user.id, data);
  }

  @Get('workers')
  async getWorkers(
    @Query('skills') skills?: string,
    @Query('rating') rating?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.getWorkers({ skills, rating, page, limit });
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
