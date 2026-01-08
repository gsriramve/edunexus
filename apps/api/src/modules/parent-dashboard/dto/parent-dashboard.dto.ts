import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

// Query DTOs
export class QueryActivityDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class QueryNotificationsDto {
  @IsOptional()
  @IsString()
  status?: 'all' | 'unread' | 'read';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class QueryEventsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  type?: 'all' | 'exam' | 'meeting' | 'fee' | 'event';
}

export class QueryPerformanceDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  semester?: number;
}

// Response DTOs
export class ChildInfoDto {
  id: string;
  name: string;
  rollNo: string;
  department: string;
  semester: number;
  batchYear: number;
  photo?: string;
}

export class ChildStatsDto {
  cgpa: number;
  sgpa: number;
  attendancePercentage: number;
  pendingFees: number;
  rank: number;
  totalStudents: number;
}

export class RecentActivityDto {
  id: string;
  type: string; // attendance, assignment, exam, fee, grade
  message: string;
  time: string;
  status: string; // positive, negative, warning, info
}

export class NotificationDto {
  id: string;
  title: string;
  message: string;
  type: string; // info, warning, alert
  unread: boolean;
  createdAt: string;
}

export class UpcomingEventDto {
  id: string;
  title: string;
  date: string;
  type: string; // exam, meeting, fee, event
  description?: string;
}

export class SubjectPerformanceDto {
  subject: string;
  code: string;
  marks: number;
  attendance: number;
  trend: string; // up, down, stable
}

export class ParentDashboardResponseDto {
  childInfo: ChildInfoDto;
  stats: ChildStatsDto;
  recentActivity: RecentActivityDto[];
  notifications: NotificationDto[];
  upcomingEvents: UpcomingEventDto[];
  subjectPerformance: SubjectPerformanceDto[];
}
