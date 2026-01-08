import { Controller, Get, Headers } from '@nestjs/common';
import { PrincipalDashboardService } from './principal-dashboard.service';

@Controller('principal-dashboard')
export class PrincipalDashboardController {
  constructor(private readonly principalDashboardService: PrincipalDashboardService) {}

  /**
   * Get complete dashboard data
   */
  @Get()
  async getDashboard(@Headers('x-tenant-id') tenantId: string) {
    return this.principalDashboardService.getDashboard(tenantId);
  }

  /**
   * Get institution stats only (lightweight)
   */
  @Get('stats')
  async getStats(@Headers('x-tenant-id') tenantId: string) {
    return this.principalDashboardService.getStats(tenantId);
  }

  /**
   * Get department performance
   */
  @Get('departments')
  async getDepartmentPerformance(@Headers('x-tenant-id') tenantId: string) {
    return this.principalDashboardService.getDepartmentPerformance(tenantId);
  }

  /**
   * Get alerts
   */
  @Get('alerts')
  async getAlerts(@Headers('x-tenant-id') tenantId: string) {
    return this.principalDashboardService.getAlerts(tenantId);
  }

  /**
   * Get fee collection summary
   */
  @Get('fees')
  async getFeeCollection(@Headers('x-tenant-id') tenantId: string) {
    return this.principalDashboardService.getFeeCollection(tenantId);
  }

  /**
   * Get comprehensive exam overview
   */
  @Get('exams')
  async getExamOverview(@Headers('x-tenant-id') tenantId: string) {
    return this.principalDashboardService.getExamOverview(tenantId);
  }

  /**
   * Get comprehensive fee overview
   */
  @Get('fees/overview')
  async getFeeOverview(@Headers('x-tenant-id') tenantId: string) {
    return this.principalDashboardService.getFeeOverview(tenantId);
  }

  /**
   * Get comprehensive academics overview
   */
  @Get('academics')
  async getAcademicsOverview(@Headers('x-tenant-id') tenantId: string) {
    return this.principalDashboardService.getAcademicsOverview(tenantId);
  }
}
