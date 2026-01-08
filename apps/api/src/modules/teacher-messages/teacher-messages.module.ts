import { Module } from '@nestjs/common';
import { TeacherMessagesController } from './teacher-messages.controller';
import { TeacherMessagesService } from './teacher-messages.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeacherMessagesController],
  providers: [TeacherMessagesService],
  exports: [TeacherMessagesService],
})
export class TeacherMessagesModule {}
