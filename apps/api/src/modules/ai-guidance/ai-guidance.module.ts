import { Module } from '@nestjs/common';
import { AiGuidanceController } from './ai-guidance.controller';
import { AiGuidanceService } from './ai-guidance.service';
import { RecommendationEngineService } from './recommendation-engine.service';
import { AlertDetectionService } from './alert-detection.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiGuidanceController],
  providers: [
    AiGuidanceService,
    RecommendationEngineService,
    AlertDetectionService,
  ],
  exports: [
    AiGuidanceService,
    RecommendationEngineService,
    AlertDetectionService,
  ],
})
export class AiGuidanceModule {}
