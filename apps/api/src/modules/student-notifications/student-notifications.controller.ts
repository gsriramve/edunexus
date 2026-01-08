import { Controller, Get, Post, Patch, Param, Query, Body, Headers } from '@nestjs/common';
import { StudentNotificationsService } from './student-notifications.service';
import { QueryNotificationsDto, NotificationPreferences } from './dto/student-notifications.dto';

@Controller('student-notifications')
export class StudentNotificationsController {
  constructor(private readonly studentNotificationsService: StudentNotificationsService) {}

  /**
   * Get all notifications for a student with pagination and filtering
   */
  @Get(':studentId')
  async getNotifications(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
    @Query() query: QueryNotificationsDto,
  ) {
    return this.studentNotificationsService.getNotifications(tenantId, studentId, query);
  }

  /**
   * Get unread notifications count
   */
  @Get(':studentId/unread-count')
  async getUnreadCount(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.studentNotificationsService.getUnreadCount(tenantId, studentId);
  }

  /**
   * Mark a specific notification as read
   */
  @Patch(':studentId/read/:notificationId')
  async markAsRead(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
    @Param('notificationId') notificationId: string,
  ) {
    return this.studentNotificationsService.markAsRead(tenantId, studentId, notificationId);
  }

  /**
   * Mark all notifications as read
   */
  @Post(':studentId/read-all')
  async markAllAsRead(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.studentNotificationsService.markAllAsRead(tenantId, studentId);
  }

  /**
   * Get notification preferences
   */
  @Get(':studentId/preferences')
  async getPreferences(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.studentNotificationsService.getPreferences(tenantId, studentId);
  }

  /**
   * Update notification preferences
   */
  @Patch(':studentId/preferences')
  async updatePreferences(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
    @Body() preferences: Partial<NotificationPreferences>,
  ) {
    return this.studentNotificationsService.updatePreferences(tenantId, studentId, preferences);
  }
}
