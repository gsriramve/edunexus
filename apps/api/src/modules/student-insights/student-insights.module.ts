import { Module } from '@nestjs/common';
import { StudentInsightsController } from './student-insights.controller';
import { StudentInsightsService } from './student-insights.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StudentInsightsController],
  providers: [StudentInsightsService],
  exports: [StudentInsightsService],
})
export class StudentInsightsModule {}
