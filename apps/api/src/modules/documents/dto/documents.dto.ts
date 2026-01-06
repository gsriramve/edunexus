import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsInt,
  IsDateString,
  Min,
  Max,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

// Enums
export enum DocumentCategory {
  ACADEMIC = 'academic',
  ADMINISTRATIVE = 'administrative',
  PERSONAL = 'personal',
  CERTIFICATE = 'certificate',
  IDENTITY = 'identity',
  FINANCIAL = 'financial',
  ASSIGNMENT = 'assignment',
  SYLLABUS = 'syllabus',
  NOTICE = 'notice',
  REPORT = 'report',
  OTHER = 'other',
}

export enum DocumentVisibility {
  PRIVATE = 'private',
  SHARED = 'shared',
  DEPARTMENT = 'department',
  COLLEGE = 'college',
  PUBLIC = 'public',
}

export enum DocumentStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
  PENDING_REVIEW = 'pending_review',
}

export enum SharePermission {
  VIEW = 'view',
  DOWNLOAD = 'download',
  EDIT = 'edit',
  ADMIN = 'admin',
}

// ==================== Folder DTOs ====================

export class CreateFolderDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsString()
  ownerId: string;

  @IsString()
  ownerType: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsEnum(DocumentVisibility)
  visibility?: DocumentVisibility;
}

export class UpdateFolderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsEnum(DocumentVisibility)
  visibility?: DocumentVisibility;
}

// ==================== Document DTOs ====================

export class UploadDocumentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  folderId?: string;

  @IsEnum(DocumentCategory)
  category: DocumentCategory;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsString()
  uploadedById: string;

  @IsString()
  uploadedByType: string;

  @IsString()
  uploadedByName: string;

  @IsOptional()
  @IsEnum(DocumentVisibility)
  visibility?: DocumentVisibility;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  staffId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  folderId?: string;

  @IsOptional()
  @IsEnum(DocumentCategory)
  category?: DocumentCategory;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(DocumentVisibility)
  visibility?: DocumentVisibility;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class VerifyDocumentDto {
  @IsString()
  verifiedById: string;

  @IsBoolean()
  isVerified: boolean;
}

export class DocumentQueryDto {
  @IsOptional()
  @IsString()
  folderId?: string;

  @IsOptional()
  @IsEnum(DocumentCategory)
  category?: DocumentCategory;

  @IsOptional()
  @IsEnum(DocumentVisibility)
  visibility?: DocumentVisibility;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @IsOptional()
  @IsString()
  uploadedById?: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  staffId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

// ==================== Share DTOs ====================

export class CreateShareDto {
  @IsString()
  documentId: string;

  @IsOptional()
  @IsString()
  sharedWithUserId?: string;

  @IsOptional()
  @IsString()
  sharedWithRole?: string;

  @IsOptional()
  @IsString()
  sharedWithDeptId?: string;

  @IsEnum(SharePermission)
  permission: SharePermission;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxDownloads?: number;

  @IsOptional()
  @IsBoolean()
  isPublicLink?: boolean;

  @IsString()
  sharedById: string;

  @IsString()
  sharedByName: string;
}

export class UpdateShareDto {
  @IsOptional()
  @IsEnum(SharePermission)
  permission?: SharePermission;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxDownloads?: number;
}

// ==================== Access Log DTOs ====================

export class CreateAccessLogDto {
  @IsString()
  documentId: string;

  @IsString()
  userId: string;

  @IsString()
  userName: string;

  @IsString()
  userType: string;

  @IsString()
  action: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  details?: Record<string, unknown>;
}

export class AccessLogQueryDto {
  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// ==================== Settings DTOs ====================

export class UpdateDocumentSettingsDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  totalStorageQuota?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  studentQuota?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  staffQuota?: number;

  @IsOptional()
  @IsInt()
  @Min(1048576) // Min 1 MB
  @Max(104857600) // Max 100 MB
  maxFileSize?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedMimeTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blockedExtensions?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  autoDeleteDays?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  archiveAfterDays?: number;

  @IsOptional()
  @IsBoolean()
  versioningEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  maxVersions?: number;

  @IsOptional()
  @IsBoolean()
  publicSharingEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  externalSharingEnabled?: boolean;
}

// ==================== Presigned URL DTOs ====================

export class GetUploadUrlDto {
  @IsString()
  filename: string;

  @IsString()
  contentType: string;

  @IsEnum(DocumentCategory)
  category: DocumentCategory;

  @IsOptional()
  @IsInt()
  @Min(300) // Min 5 minutes
  @Max(86400) // Max 24 hours
  expiresIn?: number = 3600;
}

export class GetDownloadUrlDto {
  @IsString()
  documentId: string;

  @IsOptional()
  @IsInt()
  @Min(300)
  @Max(86400)
  expiresIn?: number = 3600;
}

// ==================== Bulk Operations DTOs ====================

export class BulkDeleteDto {
  @IsArray()
  @IsString({ each: true })
  documentIds: string[];
}

export class BulkMoveDto {
  @IsArray()
  @IsString({ each: true })
  documentIds: string[];

  @IsString()
  targetFolderId: string;
}

export class BulkUpdateVisibilityDto {
  @IsArray()
  @IsString({ each: true })
  documentIds: string[];

  @IsEnum(DocumentVisibility)
  visibility: DocumentVisibility;
}
