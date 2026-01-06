import { Module } from '@nestjs/common';
import { SportsClubsController } from './sports-clubs.controller';
import { SportsClubsService } from './sports-clubs.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SportsClubsController],
  providers: [SportsClubsService],
  exports: [SportsClubsService],
})
export class SportsClubsModule {}
