import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  MinLength,
  MaxLength,
  IsPhoneNumber,
} from 'class-validator';

export enum StaffRole {
  PRINCIPAL = 'principal',
  HOD = 'hod',
  ADMIN_STAFF = 'admin_staff',
  TEACHER = 'teacher',
  LAB_ASSISTANT = 'lab_assistant',
}

export enum StaffStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  RESIGNED = 'resigned',
}

export class CreateStaffDto {
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
  @IsPhoneNumber('IN')
  phone?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  employeeId: string;

  @IsEnum(StaffRole)
  role: StaffRole;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  designation: string;

  @IsUUID()
  departmentId: string;

  @IsDateString()
  joiningDate: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  qualification?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  specialization?: string;

  @IsOptional()
  experience?: number; // Years of experience
}

export class UpdateStaffDto {
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
  @IsPhoneNumber('IN')
  phone?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  designation?: string;

  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsEnum(StaffStatus)
  @IsOptional()
  status?: StaffStatus;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  qualification?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  specialization?: string;

  @IsOptional()
  experience?: number;
}

export class StaffQueryDto {
  @IsOptional()
  search?: string;

  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsEnum(StaffRole)
  @IsOptional()
  role?: StaffRole;

  @IsEnum(StaffStatus)
  @IsOptional()
  status?: StaffStatus;

  @IsOptional()
  limit?: number;

  @IsOptional()
  offset?: number;
}
