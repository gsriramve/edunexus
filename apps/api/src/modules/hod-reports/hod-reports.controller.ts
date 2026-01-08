import { Controller, Get, Query, Headers, BadRequestException } from '@nestjs/common';
import { HodReportsService } from './hod-reports.service';
import { QueryReportsDto, QueryAvailableReportsDto } from './dto/hod-reports.dto';

@Controller('hod-reports')
export class HodReportsController {
  constructor(private readonly hodReportsService: HodReportsService) {}

  /**
   * Get quick stats for the department
   */
  @Get('quick-stats')
  async getQuickStats(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryReportsDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.hodReportsService.getQuickStats(tenantId, userId, query);
  }

  /**
   * Get attendance report for the department
   */
  @Get('attendance')
  async getAttendanceReport(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryReportsDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.hodReportsService.getAttendanceReport(tenantId, userId, query);
  }

  /**
   * Get academic report for the department
   */
  @Get('academic')
  async getAcademicReport(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryReportsDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.hodReportsService.getAcademicReport(tenantId, userId, query);
  }

  /**
   * Get placement report for the department
   */
  @Get('placement')
  async getPlacementReport(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryReportsDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.hodReportsService.getPlacementReport(tenantId, userId, query);
  }

  /**
   * Get available reports for download
   */
  @Get('available')
  async getAvailableReports(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryAvailableReportsDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.hodReportsService.getAvailableReports(tenantId, userId, query);
  }

  /**
   * Get all department reports (combined endpoint)
   */
  @Get()
  async getDepartmentReports(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryReportsDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.hodReportsService.getDepartmentReports(tenantId, userId, query);
  }
}
