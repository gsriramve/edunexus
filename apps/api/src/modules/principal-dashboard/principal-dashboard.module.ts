import { Module } from '@nestjs/common';
import { PrincipalDashboardController } from './principal-dashboard.controller';
import { PrincipalDashboardService } from './principal-dashboard.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PrincipalDashboardController],
  providers: [PrincipalDashboardService],
  exports: [PrincipalDashboardService],
})
export class PrincipalDashboardModule {}
