import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
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
  @MinLength(10)
  @MaxLength(15)
  registrationNo: string;

  @IsUUID()
  departmentId: string;

  @IsNumber()
  @Min(2020)
  @Max(2030)
  batchYear: number;

  @IsNumber()
  @Min(1)
  @Max(8)
  currentSemester: number;

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

  // Parent/Guardian info
  @IsString()
  @IsOptional()
  @MaxLength(100)
  fatherName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  motherName?: string;

  @IsString()
  @IsOptional()
  parentPhone?: string;

  @IsEmail()
  @IsOptional()
  parentEmail?: string;

  // Address
  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  pincode?: string;
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
  currentSemester?: number;

  @IsEnum(StudentStatus)
  @IsOptional()
  status?: StudentStatus;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  pincode?: string;

  @IsString()
  @IsOptional()
  parentPhone?: string;

  @IsEmail()
  @IsOptional()
  parentEmail?: string;
}

export class StudentQueryDto {
  @IsOptional()
  search?: string;

  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsNumber()
  @IsOptional()
  batchYear?: number;

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
