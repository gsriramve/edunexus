import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

// Query DTOs
export class QuerySubjectPerformanceDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  semester?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}

// Response DTOs
export class PerformanceStatsDto {
  performanceScore: number;
  attendanceHealth: number;
  studyHours: number;
  rankPrediction: number;
  totalStudents: number;
  cgpa: number;
  sgpa: number;
  trend: 'up' | 'down' | 'stable';
}

export class SubjectPerformanceDto {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  marks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  attendance: number;
  trend: 'up' | 'down' | 'stable';
}

export class AIRecommendationDto {
  id: string;
  type: 'focus' | 'timing' | 'goal' | 'resource' | 'attendance';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  subjectId?: string;
}

export class LearningPatternDto {
  peakHours: string[];
  averageSessionDuration: number;
  consistencyScore: number;
  strongSubjects: string[];
  weakSubjects: string[];
  improvementAreas: string[];
}

export class WeeklyProgressDto {
  week: string;
  studyHours: number;
  tasksCompleted: number;
  attendanceRate: number;
}

export class StudentInsightsResponseDto {
  stats: PerformanceStatsDto;
  subjectPerformance: SubjectPerformanceDto[];
  recommendations: AIRecommendationDto[];
  learningPatterns: LearningPatternDto;
  weeklyProgress: WeeklyProgressDto[];
}
