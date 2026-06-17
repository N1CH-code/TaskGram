import { Controller, Post, Get, Param, UseGuards, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { GetUser } from '../../common/decorators/user.decorator';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: any,
    @Query('projectId') projectId?: string,
  ) {
    return this.filesService.uploadFile(file, user.id, projectId);
  }

  @Get('project/:projectId')
  @UseGuards(AuthGuard('jwt'))
  async getProjectFiles(@Param('projectId') projectId: string) {
    return this.filesService.getProjectFiles(projectId);
  }
}
