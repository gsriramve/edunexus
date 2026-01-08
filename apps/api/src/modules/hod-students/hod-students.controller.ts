import { Controller, Get, Param, Query, Headers } from '@nestjs/common';
import { HodStudentsService } from './hod-students.service';
import { QueryStudentsDto } from './dto/hod-students.dto';

@Controller('hod-students')
export class HodStudentsController {
  constructor(private readonly hodStudentsService: HodStudentsService) {}

  /**
   * Get all students in the HoD's department
   */
  @Get()
  async getStudents(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryStudentsDto
  ) {
    return this.hodStudentsService.getStudents(tenantId, userId, query);
  }

  /**
   * Get at-risk students
   */
  @Get('at-risk')
  async getAtRiskStudents(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string
  ) {
    return this.hodStudentsService.getAtRiskStudents(tenantId, userId);
  }

  /**
   * Get top performing students
   */
  @Get('top-performers')
  async getTopPerformers(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.hodStudentsService.getTopPerformers(tenantId, userId, limitNum);
  }

  /**
   * Get semester-wise overview
   */
  @Get('semester-overview')
  async getSemesterOverview(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string
  ) {
    return this.hodStudentsService.getSemesterOverview(tenantId, userId);
  }

  /**
   * Get single student details
   */
  @Get(':studentId')
  async getStudentById(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('studentId') studentId: string
  ) {
    return this.hodStudentsService.getStudentById(tenantId, userId, studentId);
  }
}
