import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QuerySkillGapsDto {
  @IsOptional()
  @IsString()
  batch?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

// Response types
export interface SkillGap {
  skill: string;
  category: string;
  gap: number;
  students: number;
}

export interface SkillCategory {
  category: string;
  avgScore: number;
  studentCount: number;
}

export interface IndustryDemand {
  skill: string;
  demand: number;
  supply: number;
}

export interface PlacementReadiness {
  ready: number;
  almostReady: number;
  needsWork: number;
  atRisk: number;
}

export interface SkillGapsResponse {
  topGaps: SkillGap[];
  byCategory: SkillCategory[];
  industryDemand: IndustryDemand[];
  placementReadiness: PlacementReadiness;
}
