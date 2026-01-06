/**
 * EduNexus Shared Types
 *
 * Common TypeScript types used across frontend and backend.
 */

// =============================================================================
// USER & AUTH TYPES
// =============================================================================

export type UserRole =
  | "platform_owner"
  | "principal"
  | "hod"
  | "admin_staff"
  | "teacher"
  | "lab_assistant"
  | "student"
  | "parent";

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  status: "active" | "inactive" | "suspended";
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends User {
  accessToken: string;
  refreshToken?: string;
}

// =============================================================================
// TENANT TYPES
// =============================================================================

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  displayName: string;
  logo?: string;
  theme: TenantTheme;
  config: TenantConfig;
  status: "active" | "suspended" | "trial";
  onboardedAt: string;
}

export interface TenantTheme {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

export interface TenantConfig {
  features: string[];
  modules: string[];
  [key: string]: unknown;
}

// =============================================================================
// STUDENT TYPES
// =============================================================================

export interface Student {
  id: string;
  tenantId: string;
  userId: string;
  rollNo: string;
  batch: string;
  departmentId: string;
  semester: number;
  section?: string;
  status: "active" | "graduated" | "dropped" | "suspended";
  admissionDate: string;
}

export interface StudentWithUser extends Student {
  user: User;
}

// =============================================================================
// ACADEMIC TYPES
// =============================================================================

export interface Department {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  hodId?: string;
}

export interface Course {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  departmentId: string;
  credits: number;
  durationYears: number;
}

export interface Subject {
  id: string;
  tenantId: string;
  courseId: string;
  name: string;
  code: string;
  semester: number;
  credits: number;
  isLab: boolean;
  syllabus?: string;
}

// =============================================================================
// ATTENDANCE TYPES
// =============================================================================

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface Attendance {
  id: string;
  tenantId: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
}

// =============================================================================
// FEE TYPES
// =============================================================================

export type FeeStatus = "pending" | "paid" | "partial" | "overdue";

export interface Fee {
  id: string;
  tenantId: string;
  studentId: string;
  feeType: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  paidAmount?: number;
  status: FeeStatus;
}

// =============================================================================
// EXAM TYPES
// =============================================================================

export type ExamType = "internal" | "external" | "practical" | "assignment";

export interface Exam {
  id: string;
  tenantId: string;
  subjectId: string;
  name: string;
  type: ExamType;
  date: string;
  totalMarks: number;
}

export interface ExamResult {
  id: string;
  tenantId: string;
  examId: string;
  studentId: string;
  marks: number;
  grade?: string;
  remarks?: string;
}

// =============================================================================
// AI/ML TYPES
// =============================================================================

export interface ScorePredictionInput {
  studentId: string;
  subjectId: string;
  pastScores: number[];
  attendancePercentage: number;
  assignmentScores?: number[];
  studyHours?: number;
  practiceScores?: number[];
}

export interface ScorePrediction {
  studentId: string;
  subjectId: string;
  predictedScore: number;
  confidence: number;
  weakTopics: string[];
  improvementSuggestions: string[];
}

export interface PlacementPredictionInput {
  studentId: string;
  cgpa: number;
  branch: string;
  backlogs: number;
  codingScore?: number;
  aptitudeScore?: number;
  communicationScore?: number;
  internshipCount: number;
  projectCount: number;
  certificationCount: number;
  skills: string[];
}

export interface PlacementPrediction {
  studentId: string;
  placementProbability: number;
  salaryBand: string;
  expectedSalaryMin: number;
  expectedSalaryMax: number;
  topCompanies: string[];
  skillGaps: string[];
  recommendations: string[];
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiMeta {
  page?: number;
  perPage?: number;
  total?: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: Required<Pick<ApiMeta, "page" | "perPage" | "total" | "totalPages">>;
}
