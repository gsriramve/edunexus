import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsObject,
  IsDateString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { EnrollmentStatus } from '@prisma/client';

/**
 * DTO for Admin to initiate a new student enrollment
 */
export class InitiateEnrollmentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^[6-9]\d{9}$/, { message: 'Mobile number must be a valid 10-digit Indian mobile number' })
  mobileNumber: string;

  @IsString()
  departmentId: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Academic year must be in format YYYY-YY (e.g., 2025-26)' })
  academicYear: string;
}

/**
 * DTO for querying enrollments
 */
export class EnrollmentQueryDto {
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  academicYear?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * DTO for student to update their profile during onboarding
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsObject()
  personalDetails?: {
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    bloodGroup?: string;
    nationality?: string;
    religion?: string;
    category?: string;
    aadharNumber?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
      country?: string;
    };
    permanentAddress?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
      country?: string;
    };
    emergencyContact?: {
      name?: string;
      relation?: string;
      phone?: string;
    };
    fatherName?: string;
    fatherOccupation?: string;
    fatherPhone?: string;
    motherName?: string;
    motherOccupation?: string;
    motherPhone?: string;
    guardianName?: string;
    guardianPhone?: string;
  };

  @IsOptional()
  @IsObject()
  academicDetails?: {
    previousInstitution?: string;
    previousBoard?: string;
    passingYear?: string;
    percentage?: number;
    grade?: string;
    rollNumber?: string;
    subjects?: string[];
    achievements?: string[];
    certificates?: Array<{
      name: string;
      url: string;
      uploadedAt: string;
    }>;
  };

  @IsOptional()
  @IsObject()
  documents?: {
    photo?: { url: string; uploadedAt: string };
    aadharCard?: { url: string; uploadedAt: string };
    birthCertificate?: { url: string; uploadedAt: string };
    marksheet10th?: { url: string; uploadedAt: string };
    marksheet12th?: { url: string; uploadedAt: string };
    transferCertificate?: { url: string; uploadedAt: string };
    migrationCertificate?: { url: string; uploadedAt: string };
    communityCertificate?: { url: string; uploadedAt: string };
    incomeCertificate?: { url: string; uploadedAt: string };
    other?: Array<{ name: string; url: string; uploadedAt: string }>;
  };
}

/**
 * DTO for Admin to review and approve enrollment
 */
export class AdminReviewDto {
  @IsEnum(['ADMIN_APPROVED', 'CHANGES_REQUESTED', 'REJECTED'] as const)
  action: 'ADMIN_APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED';

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

/**
 * DTO for HOD/Principal to approve enrollment
 */
export class ApprovalDto {
  @IsEnum(['approve', 'reject'] as const)
  action: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

/**
 * DTO for student signup with token
 */
export class StudentSignupDto {
  @IsString()
  clerkUserId: string;

  @IsOptional()
  @IsString()
  name?: string;
}

/**
 * Response DTO for enrollment verification
 */
export interface EnrollmentVerificationResponse {
  valid: boolean;
  enrollment: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    departmentName: string;
    academicYear: string;
    status: EnrollmentStatus;
  };
  tenant: {
    id: string;
    name: string;
    displayName: string;
    logo?: string;
  };
}

/**
 * Response DTO for enrollment with relations
 */
export interface EnrollmentResponse {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  departmentId: string;
  department?: {
    id: string;
    name: string;
    code: string;
  };
  academicYear: string;
  status: EnrollmentStatus;
  section?: string;
  rollNumber?: string;
  officialEmail?: string;
  personalDetails?: Record<string, unknown>;
  academicDetails?: Record<string, unknown>;
  documents?: Record<string, unknown>;
  submittedAt?: Date;
  adminReviewedAt?: Date;
  adminNotes?: string;
  hodApprovedAt?: Date;
  hodNotes?: string;
  principalApprovedAt?: Date;
  principalNotes?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
