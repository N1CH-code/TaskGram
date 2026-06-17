import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PortfolioService } from './portfolio.service';
import { GetUser } from '../../common/decorators/user.decorator';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.portfolioService.findByUser(userId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() data: any, @GetUser() user: any) {
    return this.portfolioService.create(data, user.id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() data: any, @GetUser() user: any) {
    return this.portfolioService.update(id, user.id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string, @GetUser() user: any) {
    return this.portfolioService.remove(id, user.id);
  }
}
