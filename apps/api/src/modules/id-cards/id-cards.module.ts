import { Module } from '@nestjs/common';
import { IdCardsController } from './id-cards.controller';
import { IdCardsService } from './id-cards.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [IdCardsController],
  providers: [IdCardsService, PrismaService],
  exports: [IdCardsService],
})
export class IdCardsModule {}
