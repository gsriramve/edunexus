import { Module } from '@nestjs/common';
import { HodAttendanceController } from './hod-attendance.controller';
import { HodAttendanceService } from './hod-attendance.service';

@Module({
  controllers: [HodAttendanceController],
  providers: [HodAttendanceService],
  exports: [HodAttendanceService],
})
export class HodAttendanceModule {}
