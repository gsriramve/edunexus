import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import {
  CreateReportTemplateDto,
  UpdateReportTemplateDto,
  ReportTemplateQueryDto,
  GenerateReportDto,
  GenerateFromTemplateDto,
  ReportJobQueryDto,
  CreateScheduledReportDto,
  UpdateScheduledReportDto,
  ScheduledReportQueryDto,
} from './dto/reports.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  private getTenantId(headers: Record<string, string>): string {
    const tenantId = headers['x-tenant-id'];
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    return tenantId;
  }

  // =============================================================================
  // STATISTICS
  // =============================================================================

  @Get('stats')
  getStats(@Headers() headers: Record<string, string>) {
    return this.reportsService.getStats(this.getTenantId(headers));
  }

  // =============================================================================
  // REPORT TEMPLATES
  // =============================================================================

  @Post('templates')
  createTemplate(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateReportTemplateDto,
  ) {
    return this.reportsService.createTemplate(this.getTenantId(headers), dto);
  }

  @Get('templates')
  findAllTemplates(
    @Headers() headers: Record<string, string>,
    @Query() query: ReportTemplateQueryDto,
  ) {
    return this.reportsService.findAllTemplates(this.getTenantId(headers), query);
  }

  @Get('templates/:id')
  findTemplateById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.reportsService.findTemplateById(this.getTenantId(headers), id);
  }

  @Patch('templates/:id')
  updateTemplate(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: UpdateReportTemplateDto,
  ) {
    return this.reportsService.updateTemplate(this.getTenantId(headers), id, dto);
  }

  @Delete('templates/:id')
  deleteTemplate(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.reportsService.deleteTemplate(this.getTenantId(headers), id);
  }

  // =============================================================================
  // REPORT GENERATION
  // =============================================================================

  @Post('generate')
  generateReport(
    @Headers() headers: Record<string, string>,
    @Body() dto: GenerateReportDto,
  ) {
    return this.reportsService.generateReport(this.getTenantId(headers), dto);
  }

  @Post('generate/from-template')
  generateFromTemplate(
    @Headers() headers: Record<string, string>,
    @Body() dto: GenerateFromTemplateDto,
  ) {
    return this.reportsService.generateFromTemplate(this.getTenantId(headers), dto);
  }

  // =============================================================================
  // REPORT JOBS
  // =============================================================================

  @Get('jobs')
  findAllJobs(
    @Headers() headers: Record<string, string>,
    @Query() query: ReportJobQueryDto,
  ) {
    return this.reportsService.findAllJobs(this.getTenantId(headers), query);
  }

  @Get('jobs/:id')
  findJobById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.reportsService.findJobById(this.getTenantId(headers), id);
  }

  @Delete('jobs/:id')
  deleteJob(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.reportsService.deleteJob(this.getTenantId(headers), id);
  }

  // =============================================================================
  // SCHEDULED REPORTS
  // =============================================================================

  @Post('scheduled')
  createScheduledReport(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateScheduledReportDto,
  ) {
    return this.reportsService.createScheduledReport(this.getTenantId(headers), dto);
  }

  @Get('scheduled')
  findAllScheduledReports(
    @Headers() headers: Record<string, string>,
    @Query() query: ScheduledReportQueryDto,
  ) {
    return this.reportsService.findAllScheduledReports(this.getTenantId(headers), query);
  }

  @Get('scheduled/:id')
  findScheduledReportById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    // TODO: Implement findScheduledReportById
    throw new BadRequestException('Not implemented');
  }

  @Patch('scheduled/:id')
  updateScheduledReport(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() dto: UpdateScheduledReportDto,
  ) {
    return this.reportsService.updateScheduledReport(this.getTenantId(headers), id, dto);
  }

  @Delete('scheduled/:id')
  deleteScheduledReport(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.reportsService.deleteScheduledReport(this.getTenantId(headers), id);
  }

  // =============================================================================
  // SEED SYSTEM TEMPLATES
  // =============================================================================

  @Post('seed-templates')
  seedSystemTemplates() {
    return this.reportsService.seedSystemTemplates();
  }

  // =============================================================================
  // QUICK REPORT ENDPOINTS
  // =============================================================================

  @Get('quick/students')
  async quickStudentReport(
    @Headers() headers: Record<string, string>,
    @Query('departmentId') departmentId?: string,
    @Query('semester') semester?: string,
    @Query('format') format?: string,
  ) {
    const tenantId = this.getTenantId(headers);
    return this.reportsService.generateReport(tenantId, {
      name: 'Student List Report',
      dataSource: 'students' as any,
      columns: [
        { field: 'rollNo', label: 'Roll No', width: 80 },
        { field: 'user.firstName', label: 'First Name', width: 100 },
        { field: 'user.lastName', label: 'Last Name', width: 100 },
        { field: 'user.email', label: 'Email', width: 150 },
        { field: 'department.name', label: 'Department', width: 120 },
        { field: 'semester', label: 'Semester', width: 60 },
        { field: 'status', label: 'Status', width: 80 },
      ],
      filters: {
        ...(departmentId && { departmentId }),
        ...(semester && { semester: Number(semester) }),
      },
      format: (format as any) || 'pdf',
    });
  }

  @Get('quick/fees')
  async quickFeeReport(
    @Headers() headers: Record<string, string>,
    @Query('status') status?: string,
    @Query('feeType') feeType?: string,
    @Query('format') format?: string,
  ) {
    const tenantId = this.getTenantId(headers);
    return this.reportsService.generateReport(tenantId, {
      name: 'Fee Collection Report',
      dataSource: 'fees' as any,
      columns: [
        { field: 'student.rollNo', label: 'Roll No', width: 80 },
        { field: 'student.user.firstName', label: 'Name', width: 150 },
        { field: 'feeType', label: 'Fee Type', width: 100 },
        { field: 'amount', label: 'Amount', width: 100, format: 'currency' },
        { field: 'paidAmount', label: 'Paid', width: 100, format: 'currency' },
        { field: 'dueDate', label: 'Due Date', width: 100, format: 'date' },
        { field: 'status', label: 'Status', width: 80 },
      ],
      filters: {
        ...(status && { status }),
        ...(feeType && { feeType }),
      },
      format: (format as any) || 'pdf',
    });
  }

  @Get('quick/attendance')
  async quickAttendanceReport(
    @Headers() headers: Record<string, string>,
    @Query('departmentId') departmentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format?: string,
  ) {
    const tenantId = this.getTenantId(headers);
    return this.reportsService.generateReport(tenantId, {
      name: 'Attendance Report',
      dataSource: 'attendance' as any,
      columns: [
        { field: 'student.rollNo', label: 'Roll No', width: 80 },
        { field: 'student.user.firstName', label: 'Name', width: 150 },
        { field: 'student.department.name', label: 'Department', width: 120 },
        { field: 'date', label: 'Date', width: 100, format: 'date' },
        { field: 'status', label: 'Status', width: 80 },
      ],
      filters: {
        ...(departmentId && { 'student.departmentId': departmentId }),
      },
      dateRange: {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      },
      format: (format as any) || 'pdf',
    });
  }

  @Get('quick/exam-results')
  async quickExamResultsReport(
    @Headers() headers: Record<string, string>,
    @Query('examId') examId?: string,
    @Query('format') format?: string,
  ) {
    const tenantId = this.getTenantId(headers);
    return this.reportsService.generateReport(tenantId, {
      name: 'Exam Results Report',
      dataSource: 'exam_results' as any,
      columns: [
        { field: 'student.rollNo', label: 'Roll No', width: 80 },
        { field: 'student.user.firstName', label: 'Name', width: 150 },
        { field: 'exam.name', label: 'Exam', width: 150 },
        { field: 'marks', label: 'Marks', width: 60 },
        { field: 'exam.totalMarks', label: 'Total', width: 60 },
        { field: 'grade', label: 'Grade', width: 60 },
      ],
      filters: {
        ...(examId && { examId }),
      },
      format: (format as any) || 'pdf',
    });
  }
}
