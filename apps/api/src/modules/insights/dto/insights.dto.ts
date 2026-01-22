import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
  Min,
  Max,
} from 'class-validator';

// ============================================
// Enums
// ============================================

export enum InsightSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export enum InsightType {
  EARLY_WARNING = 'early_warning',
  DAILY_FOCUS = 'daily_focus',
  PULSE_SCORE = 'pulse_score',
  SILENT_STRUGGLER = 'silent_struggler',
  FEE_RISK = 'fee_risk',
  CHURN_RISK = 'churn_risk',
  CAREER_PATH = 'career_path',
  IMPACT_STORY = 'impact_story',
  EQUIPMENT_RISK = 'equipment_risk',
}

export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable',
}

// ============================================
// Shared Response DTOs
// ============================================

export class TrendIndicatorDto {
  value: number;
  previousValue: number;
  direction: TrendDirection;
  changePercent: number;
  timeframe: string;
}

export class ActionRecommendationDto {
  id: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  deadline?: string;
  context?: string;
}

export class InsightMetadataDto {
  generatedAt: string;
  dataCompleteness: number;
  confidenceScore: number;
  dataSourcesUsed: string[];
}

// ============================================
// Parent: Early Warning Alert DTOs
// ============================================

export class EarlyWarningQueryDto {
  @IsString()
  studentId: string;
}

export class EarlyWarningSignalDto {
  type: string;
  label: string;
  currentValue: number;
  previousValue: number;
  changePercent: number;
  severity: InsightSeverity;
  description: string;
}

export class EarlyWarningResponseDto {
  studentId: string;
  studentName: string;
  hasWarning: boolean;
  overallRiskLevel: InsightSeverity;
  riskScore: number; // 0-100
  patternMatchPercent: number; // How often this pattern led to issues historically
  signals: EarlyWarningSignalDto[];
  summary: string;
  recommendations: ActionRecommendationDto[];
  historicalContext: string;
  metadata: InsightMetadataDto;
}

// ============================================
// Teacher: Daily Focus (Students at Risk) DTOs
// ============================================

export class DailyFocusQueryDto {
  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class AtRiskStudentDto {
  studentId: string;
  studentName: string;
  rollNo: string;
  photo?: string;
  riskType: 'attendance' | 'grades' | 'engagement' | 'behavioral';
  severity: InsightSeverity;
  primaryConcern: string;
  signals: {
    metric: string;
    current: number;
    baseline: number; // Student's own baseline
    deviation: number;
    context: string;
  }[];
  recommendedAction: string;
  lastInteraction?: string;
  streakInfo?: string; // e.g., "3 consecutive absences"
}

export class DailyFocusResponseDto {
  date: string;
  teacherId: string;
  priorityStudents: AtRiskStudentDto[];
  totalStudentsMonitored: number;
  studentsNeedingAttention: number;
  quickStats: {
    criticalCount: number;
    warningCount: number;
    improvedCount: number;
  };
  aiSummary: string;
  metadata: InsightMetadataDto;
}

// ============================================
// Principal: Institutional Pulse DTOs
// ============================================

export class PulseQueryDto {
  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsBoolean()
  includeHistory?: boolean;
}

export class DepartmentHealthDto {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  healthScore: number; // 0-100
  trend: TrendDirection;
  trendDelta: number;
  studentCount: number;
  atRiskCount: number;
  avgAttendance: number;
  avgSGI: number;
  feedbackScore?: number;
  topConcerns: string[];
}

export class RootCauseDto {
  factor: string;
  impact: 'high' | 'medium' | 'low';
  affectedCount: number;
  description: string;
  suggestedAction: string;
}

export class InstitutionalPulseResponseDto {
  institutionId: string;
  institutionName: string;
  overallScore: number; // 0-100, weighted average
  trend: TrendIndicatorDto;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  departmentHealth: DepartmentHealthDto[];
  keyMetrics: {
    totalStudents: number;
    avgAttendance: number;
    avgSGI: number;
    atRiskStudents: number;
    atRiskPercent: number;
    criticalAlerts: number;
  };
  rootCauses: RootCauseDto[];
  aiAnalysis: string;
  recommendations: ActionRecommendationDto[];
  historicalScores?: { date: string; score: number }[];
  metadata: InsightMetadataDto;
}

// ============================================
// HOD: Silent Strugglers DTOs
// ============================================

export class SilentStrugglersQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  subjectId?: string;
}

export class SilentStrugglerDto {
  studentId: string;
  studentName: string;
  rollNo: string;
  semester: number;
  attendance: number; // > 75% but...
  gradesTrend: TrendDirection;
  recentExamScores: { exam: string; score: number; change: number }[];
  possibleCauses: string[];
  correlatedFactors: {
    factor: string;
    correlation: string;
  }[];
  recommendedIntervention: string;
  daysInPattern: number;
}

export class SilentStrugglersResponseDto {
  departmentId: string;
  departmentName: string;
  totalIdentified: number;
  students: SilentStrugglerDto[];
  commonPatterns: {
    pattern: string;
    count: number;
    subjects: string[];
  }[];
  aiInsight: string;
  metadata: InsightMetadataDto;
}

// ============================================
// Admin: Fee Default Predictor DTOs
// ============================================

export class FeeRiskQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minRiskScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  departmentId?: string;
}

export class FeeRiskStudentDto {
  studentId: string;
  studentName: string;
  rollNo: string;
  department: string;
  currentDue: number;
  defaultProbability: number; // 0-100
  riskLevel: InsightSeverity;
  riskSignals: {
    signal: string;
    weight: number;
    description: string;
  }[];
  paymentHistory: {
    avgDaysLate: number;
    missedPayments: number;
    partialPayments: number;
  };
  recommendedAction: string;
  bestContactMethod?: string;
  bestContactTime?: string;
}

export class FeeRiskResponseDto {
  totalStudentsAnalyzed: number;
  atRiskCount: number;
  totalAtRiskAmount: number;
  students: FeeRiskStudentDto[];
  collectionInsights: {
    bestDay: string;
    bestChannel: string;
    avgResponseRate: number;
  };
  aiSummary: string;
  metadata: InsightMetadataDto;
}

// ============================================
// Platform Owner: Tenant Health DTOs
// ============================================

export class TenantHealthQueryDto {
  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsBoolean()
  includeChurnRisk?: boolean;
}

export class TenantHealthMetricDto {
  tenantId: string;
  tenantName: string;
  healthScore: number;
  churnRisk: number; // 0-100
  riskLevel: InsightSeverity;
  metrics: {
    activeUsers: number;
    loginFrequency: number;
    featuresUsed: number;
    totalFeatures: number;
    dataImportsLast30Days: number;
    supportTickets: number;
    nps?: number;
  };
  riskFactors: string[];
  opportunities: string[];
  recommendedAction: string;
  accountAge: number; // days
  contractEndDate?: string;
}

export class TenantHealthResponseDto {
  totalTenants: number;
  healthyTenants: number;
  atRiskTenants: number;
  tenants: TenantHealthMetricDto[];
  successPatterns: {
    pattern: string;
    adoptionRate: number;
    impact: string;
  }[];
  expansionOpportunities: {
    tenantId: string;
    tenantName: string;
    opportunity: string;
    likelihood: number;
  }[];
  aiSummary: string;
  metadata: InsightMetadataDto;
}

// ============================================
// Student: Career Path Visualizer DTOs
// ============================================

export class CareerPathQueryDto {
  @IsString()
  studentId: string;
}

export class CareerOutcomeDto {
  company: string;
  role: string;
  salaryRange: string;
  percentage: number;
  alumniCount: number;
}

export class SkillGapDto {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  certificationSuggestion?: string;
  estimatedHours: number;
}

export class CareerPathResponseDto {
  studentId: string;
  studentName: string;
  currentCRI: number;
  predictedPlacementRate: number;
  topOutcomes: CareerOutcomeDto[];
  skillGaps: SkillGapDto[];
  similarAlumniProfiles: {
    name: string;
    batchYear: number;
    currentRole: string;
    company: string;
    pathTaken: string;
  }[];
  opportunities: {
    type: 'internship' | 'job' | 'certification';
    title: string;
    company?: string;
    matchScore: number;
    deadline?: string;
    missingSkills: string[];
  }[];
  aiAdvice: string;
  metadata: InsightMetadataDto;
}

// ============================================
// Alumni: Impact Story DTOs
// ============================================

export class ImpactStoryQueryDto {
  @IsString()
  alumniId: string;
}

export class MenteeOutcomeDto {
  menteeName: string;
  status: 'placed' | 'in_progress' | 'graduated';
  company?: string;
  role?: string;
  feedback?: string;
  interactionCount: number;
}

export class ImpactStoryResponseDto {
  alumniId: string;
  alumniName: string;
  totalMentees: number;
  placedMentees: number;
  placementRate: number;
  batchAverage: number;
  menteeOutcomes: MenteeOutcomeDto[];
  contributions: {
    type: string;
    count: number;
    impact: string;
  }[];
  testimonials: {
    from: string;
    text: string;
    date: string;
  }[];
  networkStats: {
    batchConnections: number;
    hiringCompanies: number;
    referralsMade: number;
  };
  rank: number;
  totalAlumni: number;
  aiNarrative: string;
  metadata: InsightMetadataDto;
}

// ============================================
// Lab Assistant: Equipment Risk DTOs
// ============================================

export class EquipmentRiskQueryDto {
  @IsOptional()
  @IsString()
  labId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minRiskScore?: number;
}

export class EquipmentRiskDto {
  equipmentId: string;
  name: string;
  labName: string;
  station: string;
  failureProbability: number;
  riskLevel: InsightSeverity;
  riskFactors: {
    factor: string;
    weight: number;
    description: string;
  }[];
  usageStats: {
    hoursUsed: number;
    avgHoursPerMonth: number;
    usageVsAverage: number;
  };
  maintenanceHistory: {
    totalIssues: number;
    lastMaintenanceDate?: string;
    daysSinceLastMaintenance: number;
  };
  recommendedAction: string;
  estimatedReplacementCost?: number;
}

export class EquipmentRiskResponseDto {
  labId?: string;
  totalEquipment: number;
  atRiskCount: number;
  equipmentAtRisk: EquipmentRiskDto[];
  labEfficiency: {
    labId: string;
    labName: string;
    utilization: number;
    recommendation?: string;
  }[];
  aiSummary: string;
  metadata: InsightMetadataDto;
}
