import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsArray,
  IsDateString,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============ ENUMS ============

export enum EnrollmentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

export enum SessionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  REVIEW = 'review',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export enum DetectedFaceStatus {
  PENDING = 'pending',
  MATCHED = 'matched',
  UNMATCHED = 'unmatched',
  MANUAL_OVERRIDE = 'manual_override',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
}

// ============ ENROLLMENT DTOs ============

export class EnrollStudentDto {
  @IsString()
  studentId: string;

  @IsString()
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsString()
  imageBase64?: string; // Alternative to URL - base64 encoded image
}

export class BulkEnrollDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnrollStudentDto)
  enrollments: EnrollStudentDto[];
}

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  @IsOptional()
  @IsString()
  @IsUrl()
  sourceImageUrl?: string;
}

export class QueryEnrollmentsDto {
  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  @IsOptional()
  @IsString()
  search?: string; // Search by student name/roll number

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}

// ============ ATTENDANCE SESSION DTOs ============

export class CreateSessionDto {
  @IsString()
  @IsUrl()
  classPhotoUrl: string;

  @IsOptional()
  @IsString()
  imageBase64?: string; // Alternative to URL

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsDateString()
  date: string;
}

export class ProcessSessionDto {
  @IsString()
  sessionId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  matchThreshold?: number; // Minimum confidence for auto-match (default: 90)
}

export class ConfirmSessionDto {
  @IsString()
  sessionId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaceOverrideDto)
  overrides?: FaceOverrideDto[];
}

export class FaceOverrideDto {
  @IsString()
  detectedFaceId: string;

  @IsOptional()
  @IsString()
  studentId?: string; // Set to match a student, null for unmatched

  @IsOptional()
  @IsEnum(AttendanceStatus)
  attendanceStatus?: AttendanceStatus;
}

export class UpdateSessionDto {
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;
}

export class QuerySessionsDto {
  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}

// ============ DETECTED FACE DTOs ============

export class UpdateDetectedFaceDto {
  @IsOptional()
  @IsString()
  overrideStudentId?: string;

  @IsOptional()
  @IsEnum(DetectedFaceStatus)
  status?: DetectedFaceStatus;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  attendanceStatus?: AttendanceStatus;
}

export class BulkUpdateFacesDto {
  @IsArray()
  updates: {
    detectedFaceId: string;
    overrideStudentId?: string;
    attendanceStatus?: AttendanceStatus;
  }[];
}

// ============ REKOGNITION DTOs ============

export class SearchFaceDto {
  @IsString()
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsString()
  imageBase64?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  threshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxFaces?: number;
}

export class DetectFacesDto {
  @IsString()
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsString()
  imageBase64?: string;
}

// ============ RESPONSE DTOs ============

export interface BoundingBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface FaceMatch {
  studentId: string;
  studentName: string;
  rollNo: string;
  confidence: number;
  boundingBox: BoundingBox;
}

export interface DetectedFaceResult {
  id: string;
  boundingBox: BoundingBox;
  matchedStudent?: {
    id: string;
    name: string;
    rollNo: string;
    photoUrl?: string;
  };
  matchConfidence?: number;
  status: DetectedFaceStatus;
  attendanceStatus: AttendanceStatus;
}

export interface EnrollmentResult {
  studentId: string;
  success: boolean;
  faceId?: string;
  quality?: number;
  error?: string;
}

export interface SessionResult {
  id: string;
  status: SessionStatus;
  totalFacesDetected: number;
  matchedFaces: number;
  unmatchedFaces: number;
  detectedFaces: DetectedFaceResult[];
  classPhotoUrl: string;
  date: string;
}

export interface EnrollmentStats {
  total: number;
  active: number;
  pending: number;
  failed: number;
  byDepartment: {
    departmentId: string;
    departmentName: string;
    enrolled: number;
    total: number;
    percentage: number;
  }[];
}

export interface AttendanceStats {
  totalSessions: number;
  todaySessions: number;
  averageMatchRate: number;
  totalStudentsMarked: number;
  byDepartment: {
    departmentId: string;
    departmentName: string;
    sessions: number;
    averageMatchRate: number;
  }[];
}

// ============ CONFIG DTOs ============

export class FaceRecognitionConfigDto {
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(100)
  matchThreshold?: number; // Default: 90

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(100)
  enrollmentQualityThreshold?: number; // Default: 80

  @IsOptional()
  @IsBoolean()
  autoConfirmHighConfidence?: boolean; // Auto-confirm matches above 95%

  @IsOptional()
  @IsBoolean()
  requireManualReview?: boolean; // Always require manual review

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxFacesPerPhoto?: number; // Default: 50
}

export interface FaceRecognitionConfig {
  matchThreshold: number;
  enrollmentQualityThreshold: number;
  autoConfirmHighConfidence: boolean;
  requireManualReview: boolean;
  maxFacesPerPhoto: number;
  collectionId: string;
  awsRegion: string;
}
