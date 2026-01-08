import { Controller, Get, Headers } from '@nestjs/common';
import { HodDashboardService } from './hod-dashboard.service';

@Controller('hod-dashboard')
export class HodDashboardController {
  constructor(private readonly hodDashboardService: HodDashboardService) {}

  /**
   * Get complete dashboard data
   */
  @Get()
  async getDashboard(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string
  ) {
    return this.hodDashboardService.getDashboard(tenantId, userId);
  }

  /**
   * Get department stats only (lightweight)
   */
  @Get('stats')
  async getStats(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string
  ) {
    return this.hodDashboardService.getStats(tenantId, userId);
  }

  /**
   * Get faculty overview
   */
  @Get('faculty-overview')
  async getFacultyOverview(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string
  ) {
    return this.hodDashboardService.getFacultyOverview(tenantId, userId);
  }

  /**
   * Get alerts
   */
  @Get('alerts')
  async getAlerts(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string
  ) {
    return this.hodDashboardService.getAlerts(tenantId, userId);
  }
}
