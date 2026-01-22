'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuthContext, getApiBaseUrl } from '@/lib/api';

// ============================================
// Types
// ============================================

export type InsightSeverity = 'info' | 'warning' | 'critical';
export type TrendDirection = 'up' | 'down' | 'stable';

export interface TrendIndicator {
  value: number;
  previousValue: number;
  direction: TrendDirection;
  changePercent: number;
  timeframe: string;
}

export interface ActionRecommendation {
  id: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  deadline?: string;
  context?: string;
}

export interface InsightMetadata {
  generatedAt: string;
  dataCompleteness: number;
  confidenceScore: number;
  dataSourcesUsed: string[];
}

// Parent: Early Warning
export interface EarlyWarningSignal {
  type: string;
  label: string;
  currentValue: number;
  previousValue: number;
  changePercent: number;
  severity: InsightSeverity;
  description: string;
}

export interface EarlyWarningResponse {
  studentId: string;
  studentName: string;
  hasWarning: boolean;
  overallRiskLevel: InsightSeverity;
  riskScore: number;
  patternMatchPercent: number;
  signals: EarlyWarningSignal[];
  summary: string;
  recommendations: ActionRecommendation[];
  historicalContext: string;
  metadata: InsightMetadata;
}

// Teacher: Daily Focus
export interface AtRiskStudent {
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
    baseline: number;
    deviation: number;
    context: string;
  }[];
  recommendedAction: string;
  lastInteraction?: string;
  streakInfo?: string;
}

export interface DailyFocusResponse {
  date: string;
  teacherId: string;
  priorityStudents: AtRiskStudent[];
  totalStudentsMonitored: number;
  studentsNeedingAttention: number;
  quickStats: {
    criticalCount: number;
    warningCount: number;
    improvedCount: number;
  };
  aiSummary: string;
  metadata: InsightMetadata;
}

// Principal: Institutional Pulse
export interface DepartmentHealth {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  healthScore: number;
  trend: TrendDirection;
  trendDelta: number;
  studentCount: number;
  atRiskCount: number;
  avgAttendance: number;
  avgSGI: number;
  feedbackScore?: number;
  topConcerns: string[];
}

export interface RootCause {
  factor: string;
  impact: 'high' | 'medium' | 'low';
  affectedCount: number;
  description: string;
  suggestedAction: string;
}

export interface InstitutionalPulseResponse {
  institutionId: string;
  institutionName: string;
  overallScore: number;
  trend: TrendIndicator;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  departmentHealth: DepartmentHealth[];
  keyMetrics: {
    totalStudents: number;
    avgAttendance: number;
    avgSGI: number;
    atRiskStudents: number;
    atRiskPercent: number;
    criticalAlerts: number;
  };
  rootCauses: RootCause[];
  aiAnalysis: string;
  recommendations: ActionRecommendation[];
  historicalScores?: { date: string; score: number }[];
  metadata: InsightMetadata;
}

// HOD: Silent Strugglers
export interface SilentStruggler {
  studentId: string;
  studentName: string;
  rollNo: string;
  semester: number;
  attendance: number;
  gradesTrend: TrendDirection;
  recentExamScores: { exam: string; score: number; change: number }[];
  possibleCauses: string[];
  correlatedFactors: { factor: string; correlation: string }[];
  recommendedIntervention: string;
  daysInPattern: number;
}

export interface SilentStrugglersResponse {
  departmentId: string;
  departmentName: string;
  totalIdentified: number;
  students: SilentStruggler[];
  commonPatterns: { pattern: string; count: number; subjects: string[] }[];
  aiInsight: string;
  metadata: InsightMetadata;
}

// Admin: Fee Risk
export interface FeeRiskStudent {
  studentId: string;
  studentName: string;
  rollNo: string;
  department: string;
  currentDue: number;
  defaultProbability: number;
  riskLevel: InsightSeverity;
  riskSignals: { signal: string; weight: number; description: string }[];
  paymentHistory: {
    avgDaysLate: number;
    missedPayments: number;
    partialPayments: number;
  };
  recommendedAction: string;
  bestContactMethod?: string;
  bestContactTime?: string;
}

export interface FeeRiskResponse {
  totalStudentsAnalyzed: number;
  atRiskCount: number;
  totalAtRiskAmount: number;
  students: FeeRiskStudent[];
  collectionInsights: {
    bestDay: string;
    bestChannel: string;
    avgResponseRate: number;
  };
  aiSummary: string;
  metadata: InsightMetadata;
}

// Platform: Tenant Health
export interface TenantHealth {
  tenantId: string;
  tenantName: string;
  churnRisk: number;
  riskLevel: InsightSeverity;
  activeUsers: number;
  featuresUsed: number;
  loginTrend: number;
  mrr: number;
  plan: string;
  createdAt: string;
  riskSignals: { description: string; weight: number }[];
  recommendedAction: string;
}

export interface TenantHealthMetric {
  tenantId: string;
  tenantName: string;
  healthScore: number;
  churnRisk: number;
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
  accountAge: number;
  contractEndDate?: string;
}

export interface TenantHealthResponse {
  totalTenants: number;
  healthyCount: number;
  atRiskCount: number;
  totalMRR: number;
  tenants: TenantHealth[];
  successPatterns?: { pattern: string; adoptionRate: number; impact: string }[];
  expansionOpportunities?: {
    tenantId: string;
    tenantName: string;
    opportunity: string;
    likelihood: number;
  }[];
  aiSummary: string;
  metadata: InsightMetadata;
}

// ============================================
// API Client
// ============================================

async function insightsApi<T>(
  endpoint: string,
  tenantId: string,
): Promise<T> {
  const authContext = getAuthContext();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-tenant-id': tenantId,
  };

  if (authContext) {
    if (authContext.userId) headers['x-user-id'] = authContext.userId;
    if (authContext.role) headers['x-user-role'] = authContext.role;
    if (authContext.tenantId) headers['x-user-tenant-id'] = authContext.tenantId;
  }

  const response = await fetch(`${getApiBaseUrl()}/api/insights${endpoint}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }

  return response.json();
}

// ============================================
// Query Keys
// ============================================

export const insightKeys = {
  all: ['insights'] as const,
  parentEarlyWarning: (tenantId: string, studentId: string) =>
    [...insightKeys.all, 'parent', 'early-warning', tenantId, studentId] as const,
  teacherDailyFocus: (tenantId: string, subjectId?: string) =>
    [...insightKeys.all, 'teacher', 'daily-focus', tenantId, subjectId] as const,
  principalPulse: (tenantId: string, departmentId?: string) =>
    [...insightKeys.all, 'principal', 'pulse', tenantId, departmentId] as const,
  hodSilentStrugglers: (tenantId: string, departmentId: string) =>
    [...insightKeys.all, 'hod', 'silent-strugglers', tenantId, departmentId] as const,
  adminFeeRisk: (tenantId: string, departmentId?: string) =>
    [...insightKeys.all, 'admin', 'fee-risk', tenantId, departmentId] as const,
  platformTenantHealth: () =>
    [...insightKeys.all, 'platform', 'tenant-health'] as const,
};

// ============================================
// Hooks
// ============================================

/**
 * Parent: Get early warning alert for a child
 */
export function useParentEarlyWarning(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: insightKeys.parentEarlyWarning(tenantId, studentId),
    queryFn: () =>
      insightsApi<EarlyWarningResponse>(
        `/parent/early-warning/${studentId}`,
        tenantId
      ),
    enabled: !!tenantId && !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Teacher: Get daily focus list of at-risk students
 */
export function useTeacherDailyFocus(tenantId: string, subjectId?: string, limit: number = 10) {
  const queryParams = new URLSearchParams();
  if (subjectId) queryParams.set('subjectId', subjectId);
  if (limit) queryParams.set('limit', String(limit));

  return useQuery({
    queryKey: insightKeys.teacherDailyFocus(tenantId, subjectId),
    queryFn: () =>
      insightsApi<DailyFocusResponse>(
        `/teacher/daily-focus?${queryParams}`,
        tenantId
      ),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Principal: Get institutional pulse score
 */
export function usePrincipalPulse(tenantId: string, departmentId?: string, includeHistory: boolean = false) {
  const queryParams = new URLSearchParams();
  if (departmentId) queryParams.set('departmentId', departmentId);
  if (includeHistory) queryParams.set('includeHistory', 'true');

  return useQuery({
    queryKey: insightKeys.principalPulse(tenantId, departmentId),
    queryFn: () =>
      insightsApi<InstitutionalPulseResponse>(
        `/principal/pulse?${queryParams}`,
        tenantId
      ),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * HOD: Get silent strugglers in department
 */
export function useHODSilentStrugglers(
  tenantId: string,
  departmentId: string,
  limit: number = 20,
  subjectId?: string
) {
  const queryParams = new URLSearchParams();
  if (limit) queryParams.set('limit', String(limit));
  if (subjectId) queryParams.set('subjectId', subjectId);

  return useQuery({
    queryKey: insightKeys.hodSilentStrugglers(tenantId, departmentId),
    queryFn: () =>
      insightsApi<SilentStrugglersResponse>(
        `/hod/silent-strugglers/${departmentId}?${queryParams}`,
        tenantId
      ),
    enabled: !!tenantId && !!departmentId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Admin: Get fee default risk predictions
 */
export function useAdminFeeRisk(
  tenantId: string,
  minRiskScore: number = 50,
  limit: number = 20,
  departmentId?: string
) {
  const queryParams = new URLSearchParams();
  queryParams.set('minRiskScore', String(minRiskScore));
  queryParams.set('limit', String(limit));
  if (departmentId) queryParams.set('departmentId', departmentId);

  return useQuery({
    queryKey: insightKeys.adminFeeRisk(tenantId, departmentId),
    queryFn: () =>
      insightsApi<FeeRiskResponse>(
        `/admin/fee-risk?${queryParams}`,
        tenantId
      ),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Platform Owner: Get tenant health overview
 */
export function usePlatformTenantHealth(limit: number = 10) {
  return useQuery({
    queryKey: insightKeys.platformTenantHealth(),
    queryFn: () =>
      insightsApi<TenantHealthResponse>(
        `/platform/tenant-health`,
        'platform' // Platform endpoints don't need tenant ID
      ),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// Phase 3 Types
// ============================================

// Student: Career Path
export interface CareerPath {
  role: string;
  matchPercentage: number;
  avgSalary: number;
  alumniCount: number;
  companies?: string[];
}

export interface SkillGap {
  skill: string;
  importance: string;
  hoursToLearn: number;
}

export interface AlumniOutcome {
  alumniId: string;
  name: string;
  graduationYear: number;
  currentRole: string;
  company: string;
  similarityScore: number;
  salaryRange?: { min: number; max: number };
  careerPath?: { role: string; company: string; year: number }[];
  keySkills?: string[];
  advice?: string;
}

export interface CareerRecommendation {
  title: string;
  description: string;
  impact?: string;
}

export interface CareerPathResponse {
  careerReadiness: number;
  topCareerPaths: CareerPath[];
  skillGaps: SkillGap[];
  alumniLikeYou: AlumniOutcome[];
  recommendations: CareerRecommendation[];
  aiInsight: string;
  metadata: InsightMetadata;
}

// Alumni: Impact Story
export interface MenteeOutcome {
  menteeName: string;
  status: 'placed' | 'in_progress' | 'graduated';
  company?: string;
  role?: string;
  feedback?: string;
  interactionCount: number;
}

export interface AlumniContribution {
  type: string;
  count: number;
  impact: string;
}

export interface AlumniTestimonial {
  from: string;
  text: string;
  date: string;
}

export interface ImpactStoryResponse {
  alumniId: string;
  alumniName: string;
  graduationYear: number;
  currentRole: string;
  company: string;
  totalMentees: number;
  placedMentees: number;
  placementRate: number;
  batchAverage: number;
  menteeOutcomes: MenteeOutcome[];
  contributions: AlumniContribution[];
  testimonials: AlumniTestimonial[];
  networkStats: {
    batchConnections: number;
    hiringCompanies: number;
    referralsMade: number;
  };
  rank: number;
  totalAlumni: number;
  aiNarrative: string;
  metadata: InsightMetadata;
}

// Lab Assistant: Equipment Risk
export interface EquipmentRiskFactor {
  factor: string;
  weight: number;
  description: string;
}

export interface EquipmentAtRisk {
  equipmentId: string;
  name: string;
  labName: string;
  station: string;
  failureProbability: number;
  riskLevel: InsightSeverity;
  riskFactors: EquipmentRiskFactor[];
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

export interface LabEfficiency {
  labId: string;
  labName: string;
  utilization: number;
  recommendation?: string;
}

export interface EquipmentRiskResponse {
  labId?: string;
  totalEquipment: number;
  atRiskCount: number;
  equipmentAtRisk: EquipmentAtRisk[];
  labEfficiency: LabEfficiency[];
  aiSummary: string;
  metadata: InsightMetadata;
}

// ============================================
// Phase 3 Query Keys
// ============================================

export const insightKeysPhase3 = {
  studentCareerPath: (tenantId: string, studentId: string) =>
    ['insights', 'student', 'career-path', tenantId, studentId] as const,
  alumniImpactStory: (tenantId: string, alumniId: string) =>
    ['insights', 'alumni', 'impact-story', tenantId, alumniId] as const,
  labEquipmentRisk: (tenantId: string, labId?: string) =>
    ['insights', 'lab-assistant', 'equipment-risk', tenantId, labId] as const,
};

// ============================================
// Phase 3 Hooks
// ============================================

/**
 * Student: Get career path visualization
 */
export function useStudentCareerPath(tenantId: string, studentId: string) {
  return useQuery({
    queryKey: insightKeysPhase3.studentCareerPath(tenantId, studentId),
    queryFn: () =>
      insightsApi<CareerPathResponse>(
        `/student/career-path/${studentId}`,
        tenantId
      ),
    enabled: !!tenantId && !!studentId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Alumni: Get impact story
 */
export function useAlumniImpactStory(tenantId: string, alumniId: string) {
  return useQuery({
    queryKey: insightKeysPhase3.alumniImpactStory(tenantId, alumniId),
    queryFn: () =>
      insightsApi<ImpactStoryResponse>(
        `/alumni/impact-story/${alumniId}`,
        tenantId
      ),
    enabled: !!tenantId && !!alumniId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Lab Assistant: Get equipment failure risk predictions
 */
export function useLabEquipmentRisk(
  tenantId: string,
  labId?: string,
  minRiskScore: number = 50
) {
  const queryParams = new URLSearchParams();
  if (labId) queryParams.set('labId', labId);
  queryParams.set('minRiskScore', String(minRiskScore));

  return useQuery({
    queryKey: insightKeysPhase3.labEquipmentRisk(tenantId, labId),
    queryFn: () =>
      insightsApi<EquipmentRiskResponse>(
        `/lab-assistant/equipment-risk?${queryParams}`,
        tenantId
      ),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });
}
