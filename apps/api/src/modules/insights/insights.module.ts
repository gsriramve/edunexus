import { Module } from '@nestjs/common';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { InsightAggregatorService } from './insight-aggregator.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InsightsController],
  providers: [
    InsightsService,
    InsightAggregatorService,
  ],
  exports: [
    InsightsService,
    InsightAggregatorService,
  ],
})
export class InsightsModule {}
