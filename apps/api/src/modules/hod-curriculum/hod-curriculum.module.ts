import { Module } from '@nestjs/common';
import { HodCurriculumController } from './hod-curriculum.controller';
import { HodCurriculumService } from './hod-curriculum.service';

@Module({
  controllers: [HodCurriculumController],
  providers: [HodCurriculumService],
  exports: [HodCurriculumService],
})
export class HodCurriculumModule {}
