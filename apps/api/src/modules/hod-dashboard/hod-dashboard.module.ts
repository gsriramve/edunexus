import { Module } from '@nestjs/common';
import { HodDashboardController } from './hod-dashboard.controller';
import { HodDashboardService } from './hod-dashboard.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HodDashboardController],
  providers: [HodDashboardService],
  exports: [HodDashboardService],
})
export class HodDashboardModule {}
