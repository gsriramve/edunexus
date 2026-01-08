import {
  Controller,
  Get,
  Query,
  Param,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ParentDashboardService } from './parent-dashboard.service';
import {
  QueryActivityDto,
  QueryNotificationsDto,
  QueryEventsDto,
  QueryPerformanceDto,
} from './dto/parent-dashboard.dto';

@Controller('parent-dashboard')
export class ParentDashboardController {
  constructor(private readonly parentDashboardService: ParentDashboardService) {}

  /**
   * Get complete parent dashboard data for a specific child
   */
  @Get(':studentId')
  async getDashboard(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('studentId') studentId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    if (!studentId) {
      throw new BadRequestException('Student ID is required');
    }
    return this.parentDashboardService.getDashboard(tenantId, userId, studentId);
  }

  /**
   * Get child's basic info
   */
  @Get(':studentId/info')
  async getChildInfo(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('studentId') studentId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.parentDashboardService.getChildInfo(tenantId, studentId);
  }

  /**
   * Get child's stats
   */
  @Get(':studentId/stats')
  async getChildStats(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('studentId') studentId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.parentDashboardService.getChildStats(tenantId, studentId);
  }

  /**
   * Get recent activity for child
   */
  @Get(':studentId/activity')
  async getRecentActivity(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('studentId') studentId: string,
    @Query() query: QueryActivityDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.parentDashboardService.getRecentActivity(tenantId, studentId, query);
  }

  /**
   * Get parent notifications
   */
  @Get('notifications')
  async getNotifications(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryNotificationsDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.parentDashboardService.getNotifications(tenantId, userId, query);
  }

  /**
   * Get upcoming events for child
   */
  @Get(':studentId/events')
  async getUpcomingEvents(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('studentId') studentId: string,
    @Query() query: QueryEventsDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.parentDashboardService.getUpcomingEvents(tenantId, studentId, query);
  }

  /**
   * Get subject performance for child
   */
  @Get(':studentId/performance')
  async getSubjectPerformance(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('studentId') studentId: string,
    @Query() query: QueryPerformanceDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.parentDashboardService.getSubjectPerformance(tenantId, studentId, query);
  }
}
