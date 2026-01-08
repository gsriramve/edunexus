import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============ Query DTOs ============

export class QueryCollectionsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  date?: string;
}

export class QueryApplicationsDto {
  @IsOptional()
  @IsIn(['all', 'pending', 'document_review', 'verification', 'approved', 'rejected'])
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

export class QueryCertificatesDto {
  @IsOptional()
  @IsIn(['all', 'pending', 'processing', 'ready', 'issued'])
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

export class QueryTasksDto {
  @IsOptional()
  @IsIn(['all', 'high', 'medium', 'low'])
  priority?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

export class QueryAnnouncementsDto {
  @IsOptional()
  @IsIn(['all', 'active', 'scheduled', 'draft', 'expired'])
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

// ============ Response DTOs ============

export class AdminInfoDto {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  role: string;
}

export class DashboardStatsDto {
  totalStudents: number;
  newAdmissions: number;
  pendingApplications: number;
  todayCollections: number;
  monthlyTarget: number;
  monthlyCollected: number;
  pendingFees: number;
  certificatesRequested: number;
  pendingVerifications: number;
}

export class RecentCollectionDto {
  id: string;
  studentName: string;
  rollNo: string;
  amount: number;
  type: string;
  time: string;
  mode: string;
}

export class PendingApplicationDto {
  id: string;
  name: string;
  type: string;
  branch?: string;
  from?: string;
  to?: string;
  submitted: string;
  status: string;
  priority: string;
}

export class CertificateRequestDto {
  id: string;
  studentName: string;
  rollNo: string;
  type: string;
  requestDate: string;
  status: string;
}

export class UpcomingTaskDto {
  id: string;
  title: string;
  dueDate: string;
  priority: string;
  type: string;
}

export class AnnouncementDto {
  id: string;
  title: string;
  date: string;
  audience: string;
  status: string;
}

// ============ Combined Response DTOs ============

export class AdminDashboardResponseDto {
  adminInfo: AdminInfoDto;
  stats: DashboardStatsDto;
  recentCollections: RecentCollectionDto[];
  pendingApplications: PendingApplicationDto[];
  certificateRequests: CertificateRequestDto[];
  upcomingTasks: UpcomingTaskDto[];
  recentAnnouncements: AnnouncementDto[];
}

export class CollectionsResponseDto {
  collections: RecentCollectionDto[];
  total: number;
  todayTotal: number;
}

export class ApplicationsResponseDto {
  applications: PendingApplicationDto[];
  total: number;
}

export class CertificatesResponseDto {
  certificates: CertificateRequestDto[];
  total: number;
}

export class TasksResponseDto {
  tasks: UpcomingTaskDto[];
  total: number;
}

export class AnnouncementsResponseDto {
  announcements: AnnouncementDto[];
  total: number;
}
