import { Module } from '@nestjs/common';
import { AdminRecordsService } from './admin-records.service';
import { AdminRecordsController } from './admin-records.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [AdminRecordsController],
  providers: [AdminRecordsService, PrismaService],
  exports: [AdminRecordsService],
})
export class AdminRecordsModule {}
