import { IsOptional, IsString, IsNumber, Min, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

// Query DTOs
export class QueryDrivesDto {
  @IsOptional()
  @IsString()
  status?: 'all' | 'open' | 'upcoming' | 'closed';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class QueryApplicationsDto {
  @IsOptional()
  @IsString()
  status?: 'all' | 'applied' | 'shortlisted' | 'rejected' | 'selected';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}

// Request DTOs
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  portfolio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}

export class ApplyToDriveDto {
  @IsString()
  driveId: string;
}

// Response DTOs
export class PlacementStatsDto {
  probability: number;
  expectedSalary: string;
  eligibleDrives: number;
  appliedCount: number;
  shortlistedCount: number;
}

export class PlacementDriveDto {
  id: string;
  company: string;
  role: string;
  package: string;
  date: string;
  eligibility: string;
  status: string;
  description?: string;
  location?: string;
}

export class JobApplicationDto {
  id: string;
  company: string;
  role: string;
  appliedDate: string;
  status: string;
  nextRound: string;
  package?: string;
}

export class SkillGapDto {
  skill: string;
  level: number;
  required: number;
}

export class CareerProfileDto {
  id: string;
  resumeUrl?: string;
  linkedin?: string;
  portfolio?: string;
  skills: string[];
}

export class StudentCareerResponseDto {
  profile: CareerProfileDto | null;
  stats: PlacementStatsDto;
  upcomingDrives: PlacementDriveDto[];
  applications: JobApplicationDto[];
  skillGaps: SkillGapDto[];
}
