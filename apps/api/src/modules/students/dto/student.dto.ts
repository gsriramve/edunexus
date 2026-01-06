import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  GRADUATED = 'graduated',
  DROPPED = 'dropped',
  SUSPENDED = 'suspended',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export class CreateStudentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(20)
  rollNo: string;

  @IsString()
  departmentId: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  batch: string; // e.g., "2021-2025"

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(8)
  semester?: number;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  section?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  bloodGroup?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  nationality?: string;
}

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(8)
  semester?: number;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  section?: string;

  @IsEnum(StudentStatus)
  @IsOptional()
  status?: StudentStatus;
}

export class StudentQueryDto {
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  batch?: string;

  @IsNumber()
  @IsOptional()
  semester?: number;

  @IsEnum(StudentStatus)
  @IsOptional()
  status?: StudentStatus;

  @IsOptional()
  limit?: number;

  @IsOptional()
  offset?: number;
}

export class StudentDashboardDto {
  studentId: string;
  name: string;
  rollNo: string;
  department: string;
  semester: number;
  cgpa: number;
  attendancePercentage: number;
  pendingFees: number;
  upcomingExams: number;
  notifications: number;
}
