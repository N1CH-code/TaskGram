import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { BotModule } from '../bot/bot.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [BotModule, ProjectsModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
