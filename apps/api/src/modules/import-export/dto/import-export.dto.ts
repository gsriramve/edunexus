import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsArray,
  IsObject,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// =============================================================================
// ENUMS
// =============================================================================

export enum EntityType {
  STUDENTS = 'students',
  STAFF = 'staff',
  DEPARTMENTS = 'departments',
  COURSES = 'courses',
  SUBJECTS = 'subjects',
  FEES = 'fees',
  ATTENDANCE = 'attendance',
  MARKS = 'marks',
  LIBRARY_BOOKS = 'library_books',
  HOSTEL_ROOMS = 'hostel_rooms',
  TRANSPORT_ROUTES = 'transport_routes',
}

export enum ImportStatus {
  PENDING = 'pending',
  VALIDATING = 'validating',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ExportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ExportFormat {
  XLSX = 'xlsx',
  CSV = 'csv',
}

// =============================================================================
// IMPORT DTOs
// =============================================================================

export class ColumnMappingDto {
  @IsString()
  sourceColumn: string;

  @IsString()
  targetField: string;

  @IsString()
  @IsOptional()
  transform?: string; // date, number, boolean, trim, uppercase, lowercase
}

export class ImportOptionsDto {
  @IsBoolean()
  @IsOptional()
  skipHeaderRow?: boolean;

  @IsBoolean()
  @IsOptional()
  updateExisting?: boolean;

  @IsString()
  @IsOptional()
  uniqueField?: string; // Field to check for existing records

  @IsBoolean()
  @IsOptional()
  validateOnly?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  startRow?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  endRow?: number;
}

export class CreateImportJobDto {
  @IsEnum(EntityType)
  entityType: EntityType;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  fileName: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  fileSize?: number;

  @IsArray()
  @IsOptional()
  mapping?: ColumnMappingDto[];

  @IsObject()
  @IsOptional()
  options?: ImportOptionsDto;

  @IsString()
  createdById: string;
}

export class UpdateImportJobDto {
  @IsArray()
  @IsOptional()
  mapping?: ColumnMappingDto[];

  @IsObject()
  @IsOptional()
  options?: ImportOptionsDto;

  @IsEnum(ImportStatus)
  @IsOptional()
  status?: ImportStatus;
}

export class ImportJobQueryDto {
  @IsEnum(EntityType)
  @IsOptional()
  entityType?: EntityType;

  @IsEnum(ImportStatus)
  @IsOptional()
  status?: ImportStatus;

  @IsString()
  @IsOptional()
  createdById?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

// =============================================================================
// EXPORT DTOs
// =============================================================================

export class ExportFiltersDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  courseId?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  batchYear?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  fromDate?: string;

  @IsString()
  @IsOptional()
  toDate?: string;
}

export class CreateExportJobDto {
  @IsEnum(EntityType)
  entityType: EntityType;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  fileName?: string;

  @IsEnum(ExportFormat)
  @IsOptional()
  format?: ExportFormat;

  @IsObject()
  @IsOptional()
  filters?: ExportFiltersDto;

  @IsArray()
  @IsOptional()
  columns?: string[];

  @IsString()
  createdById: string;
}

export class ExportJobQueryDto {
  @IsEnum(EntityType)
  @IsOptional()
  entityType?: EntityType;

  @IsEnum(ExportStatus)
  @IsOptional()
  status?: ExportStatus;

  @IsString()
  @IsOptional()
  createdById?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

// =============================================================================
// TEMPLATE DTOs
// =============================================================================

export class CreateImportTemplateDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEnum(EntityType)
  entityType: EntityType;

  @IsArray()
  mapping: ColumnMappingDto[];

  @IsObject()
  @IsOptional()
  options?: ImportOptionsDto;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsString()
  createdById: string;
}

export class UpdateImportTemplateDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsArray()
  @IsOptional()
  mapping?: ColumnMappingDto[];

  @IsObject()
  @IsOptional()
  options?: ImportOptionsDto;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class ImportTemplateQueryDto {
  @IsEnum(EntityType)
  @IsOptional()
  entityType?: EntityType;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

// =============================================================================
// RESPONSE DTOs
// =============================================================================

export interface EntityFieldInfo {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  example?: string;
}

export interface ImportValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: Array<{
    row: number;
    field: string;
    value: any;
    error: string;
  }>;
  preview: Array<Record<string, any>>;
}

export interface ImportStats {
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalImports: number;
  totalExports: number;
  recentImports: number;
  recentExports: number;
}
