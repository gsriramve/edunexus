import { Module } from '@nestjs/common';
import { StudentNotificationsController } from './student-notifications.controller';
import { StudentNotificationsService } from './student-notifications.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StudentNotificationsController],
  providers: [StudentNotificationsService],
  exports: [StudentNotificationsService],
})
export class StudentNotificationsModule {}
