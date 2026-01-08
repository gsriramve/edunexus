import { Controller, Get, Query, Param, Headers } from '@nestjs/common';
import { HodAttendanceService } from './hod-attendance.service';
import { QueryAttendanceDto } from './dto/hod-attendance.dto';

@Controller('hod-attendance')
export class HodAttendanceController {
  constructor(private readonly hodAttendanceService: HodAttendanceService) {}

  /**
   * Get attendance overview for the HoD's department
   */
  @Get()
  async getAttendanceOverview(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryAttendanceDto
  ) {
    return this.hodAttendanceService.getAttendanceOverview(tenantId, userId, query);
  }

  /**
   * Get detailed attendance for a specific student
   */
  @Get('students/:studentId')
  async getStudentAttendance(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('studentId') studentId: string
  ) {
    return this.hodAttendanceService.getStudentAttendance(tenantId, userId, studentId);
  }

  /**
   * Get students with low attendance
   */
  @Get('low-attendance')
  async getLowAttendanceStudents(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('threshold') threshold?: string
  ) {
    const thresholdValue = threshold ? parseInt(threshold) : 75;
    return this.hodAttendanceService.getLowAttendanceStudents(
      tenantId,
      userId,
      thresholdValue
    );
  }
}
