import { Module } from '@nestjs/common';
import { HodExamsController } from './hod-exams.controller';
import { HodExamsService } from './hod-exams.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HodExamsController],
  providers: [HodExamsService],
  exports: [HodExamsService],
})
export class HodExamsModule {}
