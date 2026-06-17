import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private readonly prisma: PrismaService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, userId: string, projectId?: string) {
    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(this.uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    const url = `/uploads/${fileName}`;

    if (projectId) {
      return this.prisma.projectFile.create({
        data: {
          projectId,
          name: fileName,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url,
          uploadedById: userId,
        },
      });
    }

    return this.prisma.file.create({
      data: {
        userId,
        name: fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url,
      },
    });
  }

  async getProjectFiles(projectId: string) {
    return this.prisma.projectFile.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserFiles(userId: string) {
    return this.prisma.file.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
