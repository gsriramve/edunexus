import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { BiasNormalizerService } from './bias-normalizer.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FeedbackController],
  providers: [FeedbackService, BiasNormalizerService],
  exports: [FeedbackService, BiasNormalizerService],
})
export class FeedbackModule {}
