import { Module } from '@nestjs/common';
import { HodFacultyController } from './hod-faculty.controller';
import { HodFacultyService } from './hod-faculty.service';

@Module({
  controllers: [HodFacultyController],
  providers: [HodFacultyService],
  exports: [HodFacultyService],
})
export class HodFacultyModule {}
