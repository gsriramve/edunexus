import { Module } from '@nestjs/common';
import { StudentEnrollmentController } from './student-enrollment.controller';
import { StudentEnrollmentPublicController } from './student-enrollment-public.controller';
import { StudentEnrollmentApprovalController } from './student-enrollment-approval.controller';
import { StudentEnrollmentService } from './student-enrollment.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [
    StudentEnrollmentController,
    StudentEnrollmentPublicController,
    StudentEnrollmentApprovalController,
  ],
  providers: [StudentEnrollmentService, PrismaService],
  exports: [StudentEnrollmentService],
})
export class StudentEnrollmentModule {}
