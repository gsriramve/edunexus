import { Module } from '@nestjs/common';
import { StudentCareerController } from './student-career.controller';
import { StudentCareerService } from './student-career.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StudentCareerController],
  providers: [StudentCareerService],
  exports: [StudentCareerService],
})
export class StudentCareerModule {}
