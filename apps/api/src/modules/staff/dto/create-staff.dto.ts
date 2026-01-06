import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';

export enum StaffRole {
  PRINCIPAL = 'principal',
  HOD = 'hod',
  ADMIN_STAFF = 'admin_staff',
  TEACHER = 'teacher',
  LAB_ASSISTANT = 'lab_assistant',
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

  @IsString()
  departmentId: string;

  @IsDateString()
  joiningDate: string;
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
  phone?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  designation?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;
}

export class StaffQueryDto {
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsEnum(StaffRole)
  @IsOptional()
  role?: StaffRole;

  @IsString()
  @IsOptional()
  status?: 'active' | 'inactive';

  @IsOptional()
  limit?: number;

  @IsOptional()
  offset?: number;
}
