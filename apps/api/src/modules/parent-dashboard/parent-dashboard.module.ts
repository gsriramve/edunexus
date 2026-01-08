import { Module } from '@nestjs/common';
import { ParentDashboardController } from './parent-dashboard.controller';
import { ParentDashboardService } from './parent-dashboard.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ParentDashboardController],
  providers: [ParentDashboardService],
  exports: [ParentDashboardService],
})
export class ParentDashboardModule {}
