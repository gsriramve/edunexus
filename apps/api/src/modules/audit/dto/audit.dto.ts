import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsArray,
  IsObject,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// =============================================================================
// ENUMS
// =============================================================================

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  PUBLISH = 'PUBLISH',
  ARCHIVE = 'ARCHIVE',
  RESTORE = 'RESTORE',
  BULK_CREATE = 'BULK_CREATE',
  BULK_UPDATE = 'BULK_UPDATE',
  BULK_DELETE = 'BULK_DELETE',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  SETTINGS_CHANGE = 'SETTINGS_CHANGE',
}

export enum AuditCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  STUDENT_MANAGEMENT = 'STUDENT_MANAGEMENT',
  STAFF_MANAGEMENT = 'STAFF_MANAGEMENT',
  ACADEMIC = 'ACADEMIC',
  FINANCIAL = 'FINANCIAL',
  ATTENDANCE = 'ATTENDANCE',
  EXAM = 'EXAM',
  TRANSPORT = 'TRANSPORT',
  HOSTEL = 'HOSTEL',
  LIBRARY = 'LIBRARY',
  COMMUNICATION = 'COMMUNICATION',
  DOCUMENT = 'DOCUMENT',
  IMPORT_EXPORT = 'IMPORT_EXPORT',
  SYSTEM = 'SYSTEM',
  SETTINGS = 'SETTINGS',
}

export enum AuditStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PENDING = 'pending',
}

// =============================================================================
// CREATE AUDIT LOG DTO
// =============================================================================

export class CreateAuditLogDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  userEmail?: string;

  @IsString()
  @IsOptional()
  userName?: string;

  @IsString()
  @IsOptional()
  userRole?: string;

  @IsEnum(AuditAction)
  action: AuditAction;

  @IsEnum(AuditCategory)
  category: AuditCategory;

  @IsString()
  @IsOptional()
  entityType?: string;

  @IsString()
  @IsOptional()
  entityId?: string;

  @IsString()
  @IsOptional()
  entityName?: string;

  @IsObject()
  @IsOptional()
  oldValue?: Record<string, any>;

  @IsObject()
  @IsOptional()
  newValue?: Record<string, any>;

  @IsArray()
  @IsOptional()
  changedFields?: string[];

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsString()
  @IsOptional()
  requestMethod?: string;

  @IsString()
  @IsOptional()
  requestPath?: string;

  @IsString()
  @IsOptional()
  requestId?: string;

  @IsEnum(AuditStatus)
  @IsOptional()
  status?: AuditStatus;

  @IsString()
  @IsOptional()
  errorMessage?: string;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

// =============================================================================
// QUERY DTOs
// =============================================================================

export class AuditLogQueryDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsEnum(AuditAction)
  @IsOptional()
  action?: AuditAction;

  @IsEnum(AuditCategory)
  @IsOptional()
  category?: AuditCategory;

  @IsString()
  @IsOptional()
  entityType?: string;

  @IsString()
  @IsOptional()
  entityId?: string;

  @IsEnum(AuditStatus)
  @IsOptional()
  status?: AuditStatus;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  offset?: number;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

export class AuditLogSummaryQueryDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(90)
  days?: number;
}

// =============================================================================
// SETTINGS DTOs
// =============================================================================

export class UpdateAuditSettingsDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(30)
  @Max(3650)
  retentionDays?: number;

  @IsBoolean()
  @IsOptional()
  logReads?: boolean;

  @IsBoolean()
  @IsOptional()
  logAuthentication?: boolean;

  @IsBoolean()
  @IsOptional()
  logDataChanges?: boolean;

  @IsBoolean()
  @IsOptional()
  logExports?: boolean;

  @IsBoolean()
  @IsOptional()
  logImports?: boolean;

  @IsBoolean()
  @IsOptional()
  logSystemEvents?: boolean;

  @IsArray()
  @IsOptional()
  excludedEntityTypes?: string[];

  @IsArray()
  @IsOptional()
  excludedActions?: string[];
}

// =============================================================================
// RESPONSE INTERFACES
// =============================================================================

export interface AuditLogResponse {
  id: string;
  tenantId: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  action: string;
  category: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  changedFields: string[];
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestPath?: string;
  requestId?: string;
  status: string;
  errorMessage?: string;
  duration?: number;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface AuditLogListResponse {
  logs: AuditLogResponse[];
  total: number;
  limit: number;
  offset: number;
}

export interface AuditLogStats {
  totalLogs: number;
  todayLogs: number;
  successLogs: number;
  failureLogs: number;
  uniqueUsers: number;
  actionCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  entityTypeCounts: Record<string, number>;
  recentActivity: AuditLogResponse[];
}

export interface AuditLogSummaryResponse {
  date: Date;
  createCount: number;
  updateCount: number;
  deleteCount: number;
  viewCount: number;
  loginCount: number;
  logoutCount: number;
  exportCount: number;
  importCount: number;
  otherCount: number;
  successCount: number;
  failureCount: number;
  uniqueUsers: number;
  topEntities?: Array<{ entityType: string; count: number }>;
}

export interface AuditSettingsResponse {
  id: string;
  tenantId: string;
  retentionDays: number;
  logReads: boolean;
  logAuthentication: boolean;
  logDataChanges: boolean;
  logExports: boolean;
  logImports: boolean;
  logSystemEvents: boolean;
  excludedEntityTypes: string[];
  excludedActions: string[];
}

export interface EntityActivityResponse {
  entityType: string;
  entityId: string;
  entityName?: string;
  logs: AuditLogResponse[];
  total: number;
}

export interface UserActivityResponse {
  userId: string;
  userName?: string;
  userEmail?: string;
  logs: AuditLogResponse[];
  total: number;
  actionCounts: Record<string, number>;
}
