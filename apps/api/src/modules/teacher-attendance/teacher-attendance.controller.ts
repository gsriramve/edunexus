import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TeacherAttendanceService } from './teacher-attendance.service';
import { MarkAttendanceDto, QueryAttendanceDto } from './dto/teacher-attendance.dto';

@Controller('teacher-attendance')
export class TeacherAttendanceController {
  constructor(private readonly attendanceService: TeacherAttendanceService) {}

  /**
   * Get attendance data for a class on a specific date
   * GET /api/teacher-attendance/:classId?date=2024-01-08
   */
  @Get(':classId')
  async getClassAttendance(
    @Param('classId') classId: string,
    @Query('date') date: string,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    const attendanceDate = date || new Date().toISOString().split('T')[0];
    return this.attendanceService.getClassAttendance(tenantId, userId, classId, attendanceDate);
  }

  /**
   * Mark attendance for a class
   * POST /api/teacher-attendance
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async markAttendance(
    @Body() dto: MarkAttendanceDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.attendanceService.markAttendance(tenantId, userId, dto);
  }

  /**
   * Get attendance history for a class
   * GET /api/teacher-attendance/:classId/history
   */
  @Get(':classId/history')
  async getClassAttendanceHistory(
    @Param('classId') classId: string,
    @Query() query: QueryAttendanceDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.attendanceService.getClassAttendanceHistory(tenantId, userId, classId, query);
  }

  /**
   * Get a specific student's attendance in a class
   * GET /api/teacher-attendance/:classId/student/:studentId
   */
  @Get(':classId/student/:studentId')
  async getStudentAttendance(
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
    @Query() query: QueryAttendanceDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.attendanceService.getStudentAttendance(
      tenantId,
      userId,
      classId,
      studentId,
      query,
    );
  }
}
