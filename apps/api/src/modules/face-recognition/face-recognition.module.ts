import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FaceRecognitionController } from './face-recognition.controller';
import { RekognitionService } from './rekognition.service';
import { EnrollmentService } from './enrollment.service';
import { AttendanceService } from './attendance.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [FaceRecognitionController],
  providers: [RekognitionService, EnrollmentService, AttendanceService],
  exports: [RekognitionService, EnrollmentService, AttendanceService],
})
export class FaceRecognitionModule {}
