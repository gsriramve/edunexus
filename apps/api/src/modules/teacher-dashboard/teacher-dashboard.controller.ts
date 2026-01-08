import { Controller, Get, Headers } from '@nestjs/common';
import { TeacherDashboardService } from './teacher-dashboard.service';

@Controller('teacher-dashboard')
export class TeacherDashboardController {
  constructor(private readonly teacherDashboardService: TeacherDashboardService) {}

  /**
   * Get complete dashboard data
   */
  @Get()
  async getDashboard(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string
  ) {
    return this.teacherDashboardService.getDashboard(tenantId, userId);
  }

  /**
   * Get today's schedule only
   */
  @Get('schedule')
  async getTodaySchedule(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string
  ) {
    return this.teacherDashboardService.getTodaySchedule(tenantId, userId);
  }

  /**
   * Get pending tasks only
   */
  @Get('tasks')
  async getPendingTasks(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string
  ) {
    return this.teacherDashboardService.getPendingTasks(tenantId, userId);
  }

  /**
   * Get subject stats only
   */
  @Get('subjects')
  async getSubjectStats(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string
  ) {
    return this.teacherDashboardService.getSubjectStats(tenantId, userId);
  }
}
