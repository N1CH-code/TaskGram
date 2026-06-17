import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import express from 'express';
import { AppModule } from '../src/app.module';
import helmet from 'helmet';

const server = express();
let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
    );

    app.setGlobalPrefix('api/v1');
    app.enableCors({
      origin: [
        process.env.FRONTEND_URL || 'https://frontend-kappa-five-70.vercel.app',
        'https://t.me',
      ],
      credentials: true,
    });

    app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );

    await app.init();
    cachedApp = app;
    Logger.log('NestJS app initialized', 'Vercel');
  }
  return cachedApp;
}

export default async function handler(req: any, res: any) {
  await bootstrap();
  server(req, res);
}
