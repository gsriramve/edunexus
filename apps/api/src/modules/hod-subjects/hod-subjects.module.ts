import { Module } from '@nestjs/common';
import { HodSubjectsController } from './hod-subjects.controller';
import { HodSubjectsService } from './hod-subjects.service';

@Module({
  controllers: [HodSubjectsController],
  providers: [HodSubjectsService],
  exports: [HodSubjectsService],
})
export class HodSubjectsModule {}
