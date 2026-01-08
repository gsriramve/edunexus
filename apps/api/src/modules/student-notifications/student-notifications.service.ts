import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  QueryNotificationsDto,
  NotificationItem,
  NotificationsResponse,
  NotificationPreferences,
} from './dto/student-notifications.dto';

@Injectable()
export class StudentNotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(
    tenantId: string,
    studentId: string,
    query: QueryNotificationsDto,
  ): Promise<NotificationsResponse> {
    const { category = 'all', status = 'all', page = 1, limit = 20 } = query;

    // Get the student to find their userId
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      select: { userId: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Build the where clause
    const where: any = {
      userId: student.userId,
      tenantId,
    };

    // Filter by read status
    if (status === 'read') {
      where.readAt = { not: null };
    } else if (status === 'unread') {
      where.readAt = null;
    }

    // Filter by category (stored in type field, mapped accordingly)
    // Categories: academic, events, messages, system
    // Types in DB: info, warning, success, error + we can use type field to store category
    if (category !== 'all') {
      // We'll filter based on type prefix or exact match
      where.type = { contains: category };
    }

    // Get total count
    const total = await this.prisma.notification.count({ where });

    // Get paginated notifications
    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get unread count
    const unreadCount = await this.prisma.notification.count({
      where: {
        userId: student.userId,
        tenantId,
        readAt: null,
      },
    });

    // Format notifications
    const formattedNotifications: NotificationItem[] = notifications.map((n) => ({
      id: n.id,
      type: this.mapTypeToDisplayType(n.type),
      category: this.mapTypeToCategory(n.type),
      title: n.title,
      message: n.content,
      time: this.formatRelativeTime(n.createdAt),
      createdAt: n.createdAt.toISOString(),
      read: !!n.readAt,
    }));

    // If no notifications in DB, return sample data
    if (notifications.length === 0 && page === 1) {
      return this.getSampleNotificationsResponse();
    }

    return {
      notifications: formattedNotifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  async markAsRead(tenantId: string, studentId: string, notificationId: string): Promise<{ success: boolean }> {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      select: { userId: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: student.userId,
        tenantId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });

    return { success: true };
  }

  async markAllAsRead(tenantId: string, studentId: string): Promise<{ success: boolean; count: number }> {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      select: { userId: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const result = await this.prisma.notification.updateMany({
      where: {
        userId: student.userId,
        tenantId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return { success: true, count: result.count };
  }

  async getUnreadCount(tenantId: string, studentId: string): Promise<{ count: number }> {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      select: { userId: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const count = await this.prisma.notification.count({
      where: {
        userId: student.userId,
        tenantId,
        readAt: null,
      },
    });

    return { count };
  }

  async getPreferences(tenantId: string, studentId: string): Promise<NotificationPreferences> {
    // For now, return default preferences
    // In a full implementation, this would fetch from a NotificationPreferences table
    return {
      email: true,
      sms: true,
      push: true,
      categories: {
        academic: true,
        events: true,
        messages: true,
        system: true,
      },
    };
  }

  async updatePreferences(
    tenantId: string,
    studentId: string,
    preferences: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    // For now, return the merged preferences
    // In a full implementation, this would update a NotificationPreferences table
    return {
      email: preferences.email ?? true,
      sms: preferences.sms ?? true,
      push: preferences.push ?? true,
      categories: {
        academic: preferences.categories?.academic ?? true,
        events: preferences.categories?.events ?? true,
        messages: preferences.categories?.messages ?? true,
        system: preferences.categories?.system ?? true,
      },
    };
  }

  private formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString();
  }

  private mapTypeToDisplayType(type: string): string {
    // Map notification types to display types
    const typeMap: Record<string, string> = {
      info: 'info',
      warning: 'warning',
      success: 'success',
      error: 'error',
      academic: 'info',
      events: 'info',
      messages: 'info',
      system: 'info',
    };
    return typeMap[type] || 'info';
  }

  private mapTypeToCategory(type: string): string {
    // Map notification types to categories
    if (type.includes('academic') || type.includes('exam') || type.includes('grade')) {
      return 'academic';
    }
    if (type.includes('event') || type.includes('calendar')) {
      return 'events';
    }
    if (type.includes('message') || type.includes('chat')) {
      return 'messages';
    }
    return 'system';
  }

  private getSampleNotificationsResponse(): NotificationsResponse {
    const now = new Date();
    const sampleNotifications: NotificationItem[] = [
      {
        id: 'sample-1',
        type: 'info',
        category: 'system',
        title: 'Welcome to EduNexus',
        message: 'Your notification center is ready. You will receive important updates here.',
        time: 'Just now',
        createdAt: now.toISOString(),
        read: false,
      },
      {
        id: 'sample-2',
        type: 'info',
        category: 'academic',
        title: 'Academic Notifications',
        message: 'Stay updated on exam results, grade updates, and assignment deadlines.',
        time: '5 minutes ago',
        createdAt: new Date(now.getTime() - 5 * 60000).toISOString(),
        read: false,
      },
      {
        id: 'sample-3',
        type: 'info',
        category: 'events',
        title: 'Events & Activities',
        message: 'Get notified about upcoming events, workshops, and campus activities.',
        time: '10 minutes ago',
        createdAt: new Date(now.getTime() - 10 * 60000).toISOString(),
        read: true,
      },
      {
        id: 'sample-4',
        type: 'info',
        category: 'messages',
        title: 'Messages',
        message: 'Receive messages from faculty, administration, and your peers.',
        time: '1 hour ago',
        createdAt: new Date(now.getTime() - 60 * 60000).toISOString(),
        read: true,
      },
    ];

    return {
      notifications: sampleNotifications,
      pagination: {
        page: 1,
        limit: 20,
        total: sampleNotifications.length,
        totalPages: 1,
      },
      unreadCount: 2,
    };
  }
}
