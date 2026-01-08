import { Controller, Get, Query, Param, Headers } from '@nestjs/common';
import { HodFacultyService } from './hod-faculty.service';
import { QueryFacultyDto } from './dto/hod-faculty.dto';

@Controller('hod-faculty')
export class HodFacultyController {
  constructor(private readonly hodFacultyService: HodFacultyService) {}

  /**
   * Get all faculty in the HoD's department
   */
  @Get()
  async getFaculty(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryFacultyDto
  ) {
    return this.hodFacultyService.getFaculty(tenantId, userId, query);
  }

  /**
   * Get department timetable
   */
  @Get('timetable')
  async getDepartmentTimetable(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string
  ) {
    return this.hodFacultyService.getDepartmentTimetable(tenantId, userId);
  }

  /**
   * Get workload details for all faculty
   */
  @Get('workload')
  async getWorkloadDetails(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string
  ) {
    return this.hodFacultyService.getWorkloadDetails(tenantId, userId);
  }

  /**
   * Get single faculty details
   */
  @Get(':staffId')
  async getFacultyById(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('staffId') staffId: string
  ) {
    return this.hodFacultyService.getFacultyById(tenantId, userId, staffId);
  }
}
