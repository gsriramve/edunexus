import { Module } from '@nestjs/common';
import { HodSkillGapsController } from './hod-skill-gaps.controller';
import { HodSkillGapsService } from './hod-skill-gaps.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HodSkillGapsController],
  providers: [HodSkillGapsService],
  exports: [HodSkillGapsService],
})
export class HodSkillGapsModule {}
