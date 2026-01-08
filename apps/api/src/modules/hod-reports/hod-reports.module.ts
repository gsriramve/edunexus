import { Module } from '@nestjs/common';
import { HodReportsController } from './hod-reports.controller';
import { HodReportsService } from './hod-reports.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HodReportsController],
  providers: [HodReportsService],
  exports: [HodReportsService],
})
export class HodReportsModule {}
