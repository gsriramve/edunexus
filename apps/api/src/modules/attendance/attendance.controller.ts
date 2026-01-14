import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import {
  QueryAttendanceDto,
  MarkAttendanceDto,
  BulkMarkAttendanceDto,
  AttendanceStatus,
  ByDateQueryDto,
} from './dto/attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * List attendance records with filters
   * GET /api/attendance
   */
  @Get()
  async listAttendance(
    @Query() query: QueryAttendanceDto & { page?: number; limit?: number },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.attendanceService.listAttendance(tenantId, query);
  }

  /**
   * Get attendance records for a specific student
   * GET /api/attendance/student/:studentId
   */
  @Get('student/:studentId')
  async getStudentAttendance(
    @Param('studentId') studentId: string,
    @Query() query: QueryAttendanceDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.attendanceService.getStudentAttendance(tenantId, studentId, query);
  }

  /**
   * Get attendance statistics for a student
   * GET /api/attendance/student/:studentId/stats
   */
  @Get('student/:studentId/stats')
  async getStudentStats(
    @Param('studentId') studentId: string,
    @Query() query: QueryAttendanceDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.attendanceService.getStudentStats(tenantId, studentId, query);
  }

  /**
   * Get subject-wise attendance for a student
   * GET /api/attendance/student/:studentId/subjects
   */
  @Get('student/:studentId/subjects')
  async getStudentSubjectAttendance(
    @Param('studentId') studentId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.attendanceService.getStudentSubjectAttendance(tenantId, studentId);
  }

  /**
   * Get attendance for a specific date (for marking)
   * GET /api/attendance/by-date?date=2024-01-08
   */
  @Get('by-date')
  async getByDate(
    @Query() query: ByDateQueryDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.attendanceService.getByDate(tenantId, query);
  }

  /**
   * Get overall attendance statistics
   * GET /api/attendance/stats
   */
  @Get('stats')
  async getOverallStats(
    @Query('date') date?: string,
    @Query('departmentId') departmentId?: string,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.attendanceService.getOverallStats(tenantId!, { date, departmentId });
  }

  /**
   * Mark attendance for students
   * POST /api/attendance
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
   * Bulk mark attendance
   * POST /api/attendance/bulk
   */
  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  async bulkMarkAttendance(
    @Body() dto: BulkMarkAttendanceDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.attendanceService.bulkMarkAttendance(tenantId, userId, dto);
  }

  /**
   * Update an attendance record
   * PATCH /api/attendance/:id
   */
  @Patch(':id')
  async updateAttendance(
    @Param('id') id: string,
    @Body() data: { status: AttendanceStatus; remarks?: string },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.attendanceService.updateAttendance(tenantId, id, data);
  }

  /**
   * Delete an attendance record
   * DELETE /api/attendance/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAttendance(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.attendanceService.deleteAttendance(tenantId, id);
  }
}
