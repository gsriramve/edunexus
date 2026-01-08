import {
  Controller,
  Get,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import {
  QueryCollectionsDto,
  QueryApplicationsDto,
  QueryCertificatesDto,
  QueryTasksDto,
  QueryAnnouncementsDto,
} from './dto/admin-dashboard.dto';

@Controller('admin-dashboard')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  /**
   * Get complete admin dashboard data
   */
  @Get()
  async getDashboard(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.adminDashboardService.getDashboard(tenantId, userId);
  }

  /**
   * Get recent fee collections
   */
  @Get('collections')
  async getCollections(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryCollectionsDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.adminDashboardService.getCollections(tenantId, userId, query);
  }

  /**
   * Get pending admission applications
   */
  @Get('applications')
  async getApplications(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryApplicationsDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.adminDashboardService.getApplications(tenantId, userId, query);
  }

  /**
   * Get certificate requests
   */
  @Get('certificates')
  async getCertificates(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryCertificatesDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.adminDashboardService.getCertificates(tenantId, userId, query);
  }

  /**
   * Get upcoming tasks
   */
  @Get('tasks')
  async getTasks(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryTasksDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.adminDashboardService.getTasks(tenantId, userId, query);
  }

  /**
   * Get recent announcements
   */
  @Get('announcements')
  async getAnnouncements(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryAnnouncementsDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.adminDashboardService.getAnnouncements(tenantId, userId, query);
  }
}
