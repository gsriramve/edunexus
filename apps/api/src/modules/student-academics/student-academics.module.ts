import { Module } from '@nestjs/common';
import { StudentAcademicsService } from './student-academics.service';
import { StudentAcademicsController } from './student-academics.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [StudentAcademicsController],
  providers: [StudentAcademicsService, PrismaService],
  exports: [StudentAcademicsService],
})
export class StudentAcademicsModule {}
