import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryNotificationsDto {
  @IsOptional()
  @IsString()
  @IsIn(['all', 'academic', 'events', 'messages', 'system'])
  category?: string;

  @IsOptional()
  @IsString()
  @IsIn(['read', 'unread', 'all'])
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}

export class MarkNotificationReadDto {
  @IsString()
  notificationId: string;
}

// Response types
export interface NotificationItem {
  id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  time: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  categories: {
    academic: boolean;
    events: boolean;
    messages: boolean;
    system: boolean;
  };
}
