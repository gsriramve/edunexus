import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsInt,
  IsEnum,
  IsObject,
  IsDateString,
  Min,
  Max,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

// =============================================================================
// ENUMS
// =============================================================================

export enum ReportCategory {
  ACADEMIC = 'academic',
  FINANCIAL = 'financial',
  ATTENDANCE = 'attendance',
  EXAM = 'exam',
  STUDENT = 'student',
  STAFF = 'staff',
  TRANSPORT = 'transport',
  HOSTEL = 'hostel',
  LIBRARY = 'library',
  SPORTS = 'sports',
  COMMUNICATION = 'communication',
  AUDIT = 'audit',
}

export enum ReportType {
  SUMMARY = 'summary',
  DETAILED = 'detailed',
  COMPARISON = 'comparison',
  TREND = 'trend',
}

export enum DataSource {
  STUDENTS = 'students',
  STAFF = 'staff',
  DEPARTMENTS = 'departments',
  ATTENDANCE = 'attendance',
  FEES = 'fees',
  PAYMENTS = 'payments',
  EXAMS = 'exams',
  EXAM_RESULTS = 'exam_results',
  TRANSPORT = 'transport',
  HOSTEL = 'hostel',
  LIBRARY = 'library',
  SPORTS_TEAMS = 'sports_teams',
  CLUBS = 'clubs',
  ANNOUNCEMENTS = 'announcements',
  AUDIT_LOGS = 'audit_logs',
}

export enum ReportFormat {
  PDF = 'pdf',
  XLSX = 'xlsx',
  CSV = 'csv',
}

export enum ReportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  DOUGHNUT = 'doughnut',
  AREA = 'area',
  NONE = 'none',
}

export enum Orientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape',
}

export enum PageSize {
  A4 = 'A4',
  A3 = 'A3',
  LETTER = 'Letter',
  LEGAL = 'Legal',
}

export enum Frequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum AggregationFunction {
  SUM = 'sum',
  AVG = 'avg',
  COUNT = 'count',
  MIN = 'min',
  MAX = 'max',
}

// =============================================================================
// NESTED TYPES
// =============================================================================

export class ColumnDefinition {
  @IsString()
  field: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsInt()
  width?: number;

  @IsOptional()
  @IsString()
  format?: string; // date, currency, percentage, number

  @IsOptional()
  @IsString()
  align?: string; // left, center, right
}

export class FilterOption {
  @IsString()
  field: string;

  @IsString()
  label: string;

  @IsString()
  type: string; // text, select, date, dateRange, number

  @IsOptional()
  @IsArray()
  options?: { value: string; label: string }[];

  @IsOptional()
  required?: boolean;
}

export class AggregationDefinition {
  @IsString()
  field: string;

  @IsEnum(AggregationFunction)
  function: AggregationFunction;

  @IsOptional()
  @IsString()
  label?: string;
}

export class DateRangeDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

// =============================================================================
// REPORT TEMPLATE DTOs
// =============================================================================

export class CreateReportTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ReportCategory)
  category: ReportCategory;

  @IsEnum(ReportType)
  reportType: ReportType;

  @IsEnum(DataSource)
  dataSource: DataSource;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnDefinition)
  @ArrayMinSize(1)
  columns: ColumnDefinition[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterOption)
  filters?: FilterOption[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupBy?: string[];

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AggregationDefinition)
  aggregations?: AggregationDefinition[];

  @IsOptional()
  @IsEnum(ChartType)
  chartType?: ChartType;

  @IsOptional()
  @IsObject()
  chartConfig?: Record<string, any>;

  @IsOptional()
  @IsEnum(Orientation)
  orientation?: Orientation;

  @IsOptional()
  @IsEnum(PageSize)
  pageSize?: PageSize;

  @IsOptional()
  @IsBoolean()
  showHeader?: boolean;

  @IsOptional()
  @IsBoolean()
  showFooter?: boolean;

  @IsOptional()
  @IsString()
  headerTemplate?: string;

  @IsOptional()
  @IsString()
  footerTemplate?: string;
}

export class UpdateReportTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ReportCategory)
  category?: ReportCategory;

  @IsOptional()
  @IsEnum(ReportType)
  reportType?: ReportType;

  @IsOptional()
  @IsArray()
  columns?: ColumnDefinition[];

  @IsOptional()
  @IsArray()
  filters?: FilterOption[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupBy?: string[];

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: string;

  @IsOptional()
  @IsArray()
  aggregations?: AggregationDefinition[];

  @IsOptional()
  @IsEnum(ChartType)
  chartType?: ChartType;

  @IsOptional()
  @IsObject()
  chartConfig?: Record<string, any>;

  @IsOptional()
  @IsEnum(Orientation)
  orientation?: Orientation;

  @IsOptional()
  @IsEnum(PageSize)
  pageSize?: PageSize;

  @IsOptional()
  @IsBoolean()
  showHeader?: boolean;

  @IsOptional()
  @IsBoolean()
  showFooter?: boolean;

  @IsOptional()
  @IsString()
  headerTemplate?: string;

  @IsOptional()
  @IsString()
  footerTemplate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ReportTemplateQueryDto {
  @IsOptional()
  @IsEnum(ReportCategory)
  category?: ReportCategory;

  @IsOptional()
  @IsEnum(DataSource)
  dataSource?: DataSource;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

// =============================================================================
// REPORT JOB DTOs
// =============================================================================

export class GenerateReportDto {
  @IsOptional()
  @IsString()
  templateId?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DataSource)
  dataSource: DataSource;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnDefinition)
  columns: ColumnDefinition[];

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupBy?: string[];

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: string;

  @IsOptional()
  @IsArray()
  aggregations?: AggregationDefinition[];

  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat = ReportFormat.PDF;

  @IsOptional()
  @IsEnum(Orientation)
  orientation?: Orientation;

  @IsOptional()
  @IsEnum(PageSize)
  pageSize?: PageSize;
}

export class GenerateFromTemplateDto {
  @IsString()
  templateId: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;
}

export class ReportJobQueryDto {
  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @IsOptional()
  @IsString()
  createdById?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

// =============================================================================
// SCHEDULED REPORT DTOs
// =============================================================================

export class CreateScheduledReportDto {
  @IsString()
  templateId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(Frequency)
  frequency: Frequency;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  dayOfMonth?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  monthOfYear?: number;

  @IsString()
  time: string; // HH:mm

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @IsString()
  dateRangeType?: string;

  @IsOptional()
  @IsObject()
  dateRangeValue?: Record<string, any>;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @IsOptional()
  @IsString()
  deliveryMethod?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];

  @IsOptional()
  @IsString()
  emailSubject?: string;

  @IsOptional()
  @IsString()
  emailBody?: string;
}

export class UpdateScheduledReportDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Frequency)
  frequency?: Frequency;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dayOfWeek?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dayOfMonth?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  monthOfYear?: number;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @IsString()
  dateRangeType?: string;

  @IsOptional()
  @IsObject()
  dateRangeValue?: Record<string, any>;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @IsOptional()
  @IsString()
  deliveryMethod?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];

  @IsOptional()
  @IsString()
  emailSubject?: string;

  @IsOptional()
  @IsString()
  emailBody?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ScheduledReportQueryDto {
  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsEnum(Frequency)
  frequency?: Frequency;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

export interface ReportTemplateResponse {
  id: string;
  tenantId: string | null;
  name: string;
  description: string | null;
  category: string;
  reportType: string;
  dataSource: string;
  columns: ColumnDefinition[];
  filters: FilterOption[] | null;
  groupBy: string[];
  sortBy: string | null;
  sortOrder: string;
  aggregations: AggregationDefinition[] | null;
  chartType: string | null;
  chartConfig: Record<string, any> | null;
  orientation: string;
  pageSize: string;
  showHeader: boolean;
  showFooter: boolean;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportJobResponse {
  id: string;
  tenantId: string;
  templateId: string | null;
  name: string;
  description: string | null;
  dataSource: string;
  format: string;
  status: string;
  progress: number;
  errorMessage: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  rowCount: number | null;
  generatedAt: Date | null;
  executionTime: number | null;
  createdAt: Date;
}

export interface ScheduledReportResponse {
  id: string;
  tenantId: string;
  templateId: string;
  name: string;
  description: string | null;
  frequency: string;
  time: string;
  timezone: string;
  format: string;
  deliveryMethod: string;
  recipients: string[];
  isActive: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  lastStatus: string | null;
  runCount: number;
  failureCount: number;
  template?: ReportTemplateResponse;
}

export interface ReportStatsResponse {
  totalTemplates: number;
  systemTemplates: number;
  customTemplates: number;
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  pendingJobs: number;
  scheduledReports: number;
  activeSchedules: number;
  jobsByFormat: Record<string, number>;
  jobsByCategory: Record<string, number>;
  recentJobs: ReportJobResponse[];
}

// =============================================================================
// PREDEFINED REPORT TEMPLATES
// =============================================================================

export const SYSTEM_TEMPLATES = {
  STUDENT_LIST: {
    name: 'Student List Report',
    description: 'Complete list of students with enrollment details',
    category: ReportCategory.STUDENT,
    reportType: ReportType.DETAILED,
    dataSource: DataSource.STUDENTS,
    columns: [
      { field: 'rollNo', label: 'Roll No', width: 80 },
      { field: 'user.name', label: 'Name', width: 150 },
      { field: 'user.email', label: 'Email', width: 150 },
      { field: 'department.name', label: 'Department', width: 120 },
      { field: 'semester', label: 'Semester', width: 60 },
      { field: 'section', label: 'Section', width: 60 },
      { field: 'status', label: 'Status', width: 80 },
    ],
    filters: [
      { field: 'departmentId', label: 'Department', type: 'select' },
      { field: 'semester', label: 'Semester', type: 'select' },
      { field: 'status', label: 'Status', type: 'select' },
    ],
    groupBy: [] as string[],
    sortBy: 'rollNo',
    sortOrder: 'asc',
    aggregations: null,
    chartType: null,
  },
  ATTENDANCE_SUMMARY: {
    name: 'Attendance Summary Report',
    description: 'Student attendance summary by department and semester',
    category: ReportCategory.ATTENDANCE,
    reportType: ReportType.SUMMARY,
    dataSource: DataSource.ATTENDANCE,
    columns: [
      { field: 'student.rollNo', label: 'Roll No', width: 80 },
      { field: 'student.user.name', label: 'Name', width: 150 },
      { field: 'date', label: 'Date', width: 100, format: 'date' },
      { field: 'status', label: 'Status', width: 80 },
    ],
    filters: [
      { field: 'departmentId', label: 'Department', type: 'select' },
      { field: 'semester', label: 'Semester', type: 'select' },
      { field: 'dateRange', label: 'Date Range', type: 'dateRange' },
    ],
    groupBy: ['departmentId'] as string[],
    sortBy: 'date',
    sortOrder: 'desc',
    aggregations: [
      { field: 'status', function: AggregationFunction.COUNT, label: 'Total Records' },
    ],
    chartType: ChartType.BAR,
  },
  FEE_COLLECTION: {
    name: 'Fee Collection Report',
    description: 'Fee collection status and outstanding dues',
    category: ReportCategory.FINANCIAL,
    reportType: ReportType.SUMMARY,
    dataSource: DataSource.FEES,
    columns: [
      { field: 'student.rollNo', label: 'Roll No', width: 80 },
      { field: 'student.user.name', label: 'Name', width: 150 },
      { field: 'feeType', label: 'Fee Type', width: 100 },
      { field: 'amount', label: 'Amount', width: 100, format: 'currency' },
      { field: 'paidAmount', label: 'Paid', width: 100, format: 'currency' },
      { field: 'dueDate', label: 'Due Date', width: 100, format: 'date' },
      { field: 'status', label: 'Status', width: 80 },
    ],
    filters: [
      { field: 'feeType', label: 'Fee Type', type: 'select' },
      { field: 'status', label: 'Status', type: 'select' },
      { field: 'dateRange', label: 'Date Range', type: 'dateRange' },
    ],
    groupBy: [] as string[],
    sortBy: 'dueDate',
    sortOrder: 'desc',
    aggregations: [
      { field: 'amount', function: AggregationFunction.SUM, label: 'Total Due' },
      { field: 'paidAmount', function: AggregationFunction.SUM, label: 'Total Collected' },
    ],
    chartType: ChartType.PIE,
  },
  EXAM_RESULTS: {
    name: 'Exam Results Report',
    description: 'Student exam results with grades and statistics',
    category: ReportCategory.EXAM,
    reportType: ReportType.DETAILED,
    dataSource: DataSource.EXAM_RESULTS,
    columns: [
      { field: 'student.rollNo', label: 'Roll No', width: 80 },
      { field: 'student.user.name', label: 'Name', width: 150 },
      { field: 'exam.name', label: 'Exam', width: 150 },
      { field: 'marks', label: 'Marks', width: 60 },
      { field: 'exam.totalMarks', label: 'Total', width: 60 },
      { field: 'grade', label: 'Grade', width: 60 },
    ],
    filters: [
      { field: 'examId', label: 'Exam', type: 'select' },
      { field: 'departmentId', label: 'Department', type: 'select' },
    ],
    groupBy: [] as string[],
    sortBy: 'marks',
    sortOrder: 'desc',
    aggregations: [
      { field: 'marks', function: AggregationFunction.AVG, label: 'Class Average' },
      { field: 'marks', function: AggregationFunction.MAX, label: 'Highest Marks' },
      { field: 'marks', function: AggregationFunction.MIN, label: 'Lowest Marks' },
    ],
    chartType: ChartType.BAR,
  },
  STAFF_LIST: {
    name: 'Staff List Report',
    description: 'Complete staff directory with department details',
    category: ReportCategory.STAFF,
    reportType: ReportType.DETAILED,
    dataSource: DataSource.STAFF,
    columns: [
      { field: 'employeeId', label: 'Employee ID', width: 100 },
      { field: 'user.name', label: 'Name', width: 150 },
      { field: 'user.email', label: 'Email', width: 150 },
      { field: 'designation', label: 'Designation', width: 120 },
      { field: 'department.name', label: 'Department', width: 120 },
      { field: 'joiningDate', label: 'Joining Date', width: 100, format: 'date' },
    ],
    filters: [
      { field: 'departmentId', label: 'Department', type: 'select' },
      { field: 'designation', label: 'Designation', type: 'select' },
    ],
    groupBy: ['departmentId'] as string[],
    sortBy: 'employeeId',
    sortOrder: 'asc',
    aggregations: null,
    chartType: null,
  },
};
