import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
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
  ReportTemplateResponse,
  ReportJobResponse,
  ScheduledReportResponse,
  ReportStatsResponse,
  ReportStatus,
  ReportFormat,
  DataSource,
  ColumnDefinition,
  AggregationDefinition,
  SYSTEM_TEMPLATES,
} from './dto/reports.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // =============================================================================
  // REPORT TEMPLATES
  // =============================================================================

  async createTemplate(
    tenantId: string,
    dto: CreateReportTemplateDto,
  ): Promise<ReportTemplateResponse> {
    const template = await this.prisma.reportTemplate.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        reportType: dto.reportType,
        dataSource: dto.dataSource,
        columns: dto.columns as any,
        filters: dto.filters as any,
        groupBy: dto.groupBy || [],
        sortBy: dto.sortBy,
        sortOrder: dto.sortOrder || 'asc',
        aggregations: dto.aggregations as any,
        chartType: dto.chartType,
        chartConfig: dto.chartConfig as any,
        orientation: dto.orientation || 'portrait',
        pageSize: dto.pageSize || 'A4',
        showHeader: dto.showHeader ?? true,
        showFooter: dto.showFooter ?? true,
        headerTemplate: dto.headerTemplate,
        footerTemplate: dto.footerTemplate,
        isSystem: false,
      },
    });

    return this.mapTemplateToResponse(template);
  }

  async findAllTemplates(
    tenantId: string,
    query: ReportTemplateQueryDto,
  ): Promise<{ templates: ReportTemplateResponse[]; total: number }> {
    const { category, dataSource, isSystem, isActive, search, limit = 50, offset = 0 } = query;

    const where: any = {
      OR: [{ tenantId }, { tenantId: null }], // Include system templates
      ...(category && { category }),
      ...(dataSource && { dataSource }),
      ...(isSystem !== undefined && { isSystem }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [templates, total] = await Promise.all([
      this.prisma.reportTemplate.findMany({
        where,
        orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
        take: limit,
        skip: offset,
      }),
      this.prisma.reportTemplate.count({ where }),
    ]);

    return {
      templates: templates.map(this.mapTemplateToResponse),
      total,
    };
  }

  async findTemplateById(tenantId: string, id: string): Promise<ReportTemplateResponse> {
    const template = await this.prisma.reportTemplate.findFirst({
      where: {
        id,
        OR: [{ tenantId }, { tenantId: null }],
      },
    });

    if (!template) {
      throw new NotFoundException('Report template not found');
    }

    return this.mapTemplateToResponse(template);
  }

  async updateTemplate(
    tenantId: string,
    id: string,
    dto: UpdateReportTemplateDto,
  ): Promise<ReportTemplateResponse> {
    const existing = await this.prisma.reportTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Report template not found');
    }

    if (existing.isSystem) {
      throw new BadRequestException('System templates cannot be modified');
    }

    const template = await this.prisma.reportTemplate.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.category && { category: dto.category }),
        ...(dto.reportType && { reportType: dto.reportType }),
        ...(dto.columns && { columns: dto.columns as any }),
        ...(dto.filters !== undefined && { filters: dto.filters as any }),
        ...(dto.groupBy && { groupBy: dto.groupBy }),
        ...(dto.sortBy !== undefined && { sortBy: dto.sortBy }),
        ...(dto.sortOrder && { sortOrder: dto.sortOrder }),
        ...(dto.aggregations !== undefined && { aggregations: dto.aggregations as any }),
        ...(dto.chartType !== undefined && { chartType: dto.chartType }),
        ...(dto.chartConfig !== undefined && { chartConfig: dto.chartConfig as any }),
        ...(dto.orientation && { orientation: dto.orientation }),
        ...(dto.pageSize && { pageSize: dto.pageSize }),
        ...(dto.showHeader !== undefined && { showHeader: dto.showHeader }),
        ...(dto.showFooter !== undefined && { showFooter: dto.showFooter }),
        ...(dto.headerTemplate !== undefined && { headerTemplate: dto.headerTemplate }),
        ...(dto.footerTemplate !== undefined && { footerTemplate: dto.footerTemplate }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    return this.mapTemplateToResponse(template);
  }

  async deleteTemplate(tenantId: string, id: string): Promise<void> {
    const existing = await this.prisma.reportTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Report template not found');
    }

    if (existing.isSystem) {
      throw new BadRequestException('System templates cannot be deleted');
    }

    await this.prisma.reportTemplate.delete({ where: { id } });
  }

  // =============================================================================
  // REPORT GENERATION
  // =============================================================================

  async generateReport(tenantId: string, dto: GenerateReportDto): Promise<ReportJobResponse> {
    // Create job record
    const job = await this.prisma.reportJob.create({
      data: {
        tenantId,
        templateId: dto.templateId,
        name: dto.name,
        description: dto.description,
        dataSource: dto.dataSource,
        columns: dto.columns as any,
        filters: dto.filters as any,
        groupBy: dto.groupBy || [],
        sortBy: dto.sortBy,
        sortOrder: dto.sortOrder || 'asc',
        aggregations: dto.aggregations as any,
        dateRange: dto.dateRange as any,
        format: dto.format || ReportFormat.PDF,
        orientation: dto.orientation || 'portrait',
        pageSize: dto.pageSize || 'A4',
        status: ReportStatus.PENDING,
      },
    });

    // Process report asynchronously
    this.processReport(tenantId, job.id).catch((err) => {
      this.logger.error(`Report generation failed for job ${job.id}`, err);
    });

    return this.mapJobToResponse(job);
  }

  async generateFromTemplate(
    tenantId: string,
    dto: GenerateFromTemplateDto,
  ): Promise<ReportJobResponse> {
    const template = await this.findTemplateById(tenantId, dto.templateId);

    return this.generateReport(tenantId, {
      templateId: dto.templateId,
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      dataSource: template.dataSource as DataSource,
      columns: template.columns,
      filters: dto.filters,
      groupBy: template.groupBy,
      sortBy: template.sortBy ?? undefined,
      sortOrder: template.sortOrder,
      aggregations: template.aggregations as AggregationDefinition[] ?? undefined,
      dateRange: dto.dateRange,
      format: dto.format || (template.orientation as ReportFormat),
      orientation: template.orientation as any,
      pageSize: template.pageSize as any,
    });
  }

  async processReport(tenantId: string, jobId: string): Promise<void> {
    const startTime = Date.now();

    try {
      // Update status to processing
      await this.prisma.reportJob.update({
        where: { id: jobId },
        data: { status: ReportStatus.PROCESSING, progress: 10 },
      });

      // Get job details
      const job = await this.prisma.reportJob.findUnique({ where: { id: jobId } });
      if (!job) throw new Error('Job not found');

      // Fetch data
      const data = await this.fetchReportData(
        tenantId,
        job.dataSource,
        job.filters as Record<string, any>,
        job.dateRange as { startDate?: string; endDate?: string },
        job.sortBy ?? undefined,
        job.sortOrder,
      );

      await this.prisma.reportJob.update({
        where: { id: jobId },
        data: { progress: 50 },
      });

      // Generate file based on format
      const columns = job.columns as unknown as ColumnDefinition[];
      const aggregations = job.aggregations as unknown as AggregationDefinition[];
      let fileBuffer: Buffer;
      let fileName: string;

      if (job.format === ReportFormat.PDF) {
        fileBuffer = await this.generatePDF(job.name, columns, data, aggregations);
        fileName = `${job.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
      } else if (job.format === ReportFormat.XLSX) {
        fileBuffer = await this.generateExcel(job.name, columns, data, aggregations);
        fileName = `${job.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.xlsx`;
      } else {
        fileBuffer = await this.generateCSV(columns, data);
        fileName = `${job.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.csv`;
      }

      await this.prisma.reportJob.update({
        where: { id: jobId },
        data: { progress: 80 },
      });

      // In production, upload to S3 and get URL
      // For now, we'll store a placeholder URL
      const fileUrl = `/reports/${fileName}`;

      // Update job as completed
      const executionTime = Date.now() - startTime;
      await this.prisma.reportJob.update({
        where: { id: jobId },
        data: {
          status: ReportStatus.COMPLETED,
          progress: 100,
          fileUrl,
          fileName,
          fileSize: fileBuffer.length,
          rowCount: data.length,
          generatedAt: new Date(),
          executionTime,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      this.logger.log(`Report ${jobId} generated successfully in ${executionTime}ms`);
    } catch (error) {
      this.logger.error(`Report generation failed for job ${jobId}`, error);
      await this.prisma.reportJob.update({
        where: { id: jobId },
        data: {
          status: ReportStatus.FAILED,
          errorMessage: error.message,
          executionTime: Date.now() - startTime,
        },
      });
    }
  }

  // =============================================================================
  // DATA FETCHING
  // =============================================================================

  private async fetchReportData(
    tenantId: string,
    dataSource: string,
    filters?: Record<string, any>,
    dateRange?: { startDate?: string; endDate?: string },
    sortBy?: string,
    sortOrder?: string,
  ): Promise<any[]> {
    const where: any = { tenantId };

    // Apply date range filter
    if (dateRange?.startDate || dateRange?.endDate) {
      where.createdAt = {};
      if (dateRange.startDate) {
        where.createdAt.gte = new Date(dateRange.startDate);
      }
      if (dateRange.endDate) {
        where.createdAt.lte = new Date(dateRange.endDate);
      }
    }

    // Apply custom filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          where[key] = value;
        }
      });
    }

    const orderBy = sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' };

    switch (dataSource) {
      case DataSource.STUDENTS:
        return this.prisma.student.findMany({
          where,
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true, code: true } },
          },
          orderBy: orderBy as any,
        });

      case DataSource.STAFF:
        return this.prisma.staff.findMany({
          where,
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true, code: true } },
          },
          orderBy: orderBy as any,
        });

      case DataSource.DEPARTMENTS:
        return this.prisma.department.findMany({
          where,
          include: {
            _count: { select: { staff: true, students: true } },
          },
          orderBy: orderBy as any,
        });

      case DataSource.ATTENDANCE:
        return this.prisma.studentAttendance.findMany({
          where,
          include: {
            student: {
              include: {
                user: { select: { name: true } },
                department: { select: { name: true } },
              },
            },
          },
          orderBy: orderBy as any,
        });

      case DataSource.FEES:
        return this.prisma.studentFee.findMany({
          where,
          include: {
            student: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
          orderBy: orderBy as any,
        });

      case DataSource.PAYMENTS:
        return this.prisma.paymentTransaction.findMany({
          where,
          include: {
            student: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
          orderBy: orderBy as any,
        });

      case DataSource.EXAMS:
        return this.prisma.exam.findMany({
          where,
          include: {
            subject: { select: { name: true, code: true } },
            _count: { select: { results: true } },
          },
          orderBy: orderBy as any,
        });

      case DataSource.EXAM_RESULTS:
        return this.prisma.examResult.findMany({
          where,
          include: {
            student: {
              include: {
                user: { select: { name: true } },
              },
            },
            exam: { select: { name: true, totalMarks: true, type: true } },
          },
          orderBy: orderBy as any,
        });

      case DataSource.TRANSPORT:
        return this.prisma.transportRoute.findMany({
          where,
          include: {
            vehicles: true,
            stops: true,
            _count: { select: { passes: true } },
          },
          orderBy: orderBy as any,
        });

      case DataSource.HOSTEL:
        return this.prisma.hostelBlock.findMany({
          where,
          include: {
            rooms: { include: { _count: { select: { allocations: true } } } },
            _count: { select: { rooms: true } },
          },
          orderBy: orderBy as any,
        });

      case DataSource.LIBRARY:
        return this.prisma.libraryBook.findMany({
          where,
          include: {
            category: { select: { name: true } },
          },
          orderBy: orderBy as any,
        });

      case DataSource.AUDIT_LOGS:
        return this.prisma.auditLog.findMany({
          where,
          orderBy: orderBy as any,
          take: 1000, // Limit for audit logs
        });

      default:
        throw new BadRequestException(`Unsupported data source: ${dataSource}`);
    }
  }

  // =============================================================================
  // FILE GENERATION
  // =============================================================================

  private async generatePDF(
    title: string,
    columns: ColumnDefinition[],
    data: any[],
    aggregations?: AggregationDefinition[],
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Title
        doc.fontSize(18).font('Helvetica-Bold').text(title, { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // Table header
        const tableTop = doc.y;
        const colWidth = (doc.page.width - 100) / columns.length;

        doc.font('Helvetica-Bold').fontSize(9);
        columns.forEach((col, i) => {
          doc.text(col.label, 50 + i * colWidth, tableTop, {
            width: colWidth - 5,
            align: 'left',
          });
        });

        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
        doc.moveDown(0.5);

        // Table rows
        doc.font('Helvetica').fontSize(8);
        let rowY = doc.y;

        data.slice(0, 100).forEach((row) => { // Limit to 100 rows for PDF
          if (rowY > doc.page.height - 100) {
            doc.addPage();
            rowY = 50;
          }

          columns.forEach((col, i) => {
            const value = this.getNestedValue(row, col.field);
            const formatted = this.formatValue(value, col.format);
            doc.text(String(formatted ?? ''), 50 + i * colWidth, rowY, {
              width: colWidth - 5,
              align: 'left',
            });
          });

          rowY += 15;
        });

        // Aggregations
        if (aggregations && aggregations.length > 0) {
          doc.moveDown(2);
          doc.font('Helvetica-Bold').fontSize(10).text('Summary:', 50);
          doc.moveDown(0.5);
          doc.font('Helvetica').fontSize(9);

          aggregations.forEach((agg) => {
            const result = this.calculateAggregation(data, agg.field, agg.function);
            doc.text(`${agg.label || agg.field}: ${this.formatValue(result, 'number')}`, 50);
          });
        }

        // Footer
        doc.fontSize(8).text(
          `Total Records: ${data.length} | Page 1`,
          50,
          doc.page.height - 50,
          { align: 'center' },
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private async generateExcel(
    title: string,
    columns: ColumnDefinition[],
    data: any[],
    aggregations?: AggregationDefinition[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'EduNexus';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Report');

    // Title row
    worksheet.mergeCells('A1', `${String.fromCharCode(64 + columns.length)}1`);
    const titleCell = worksheet.getCell('A1');
    titleCell.value = title;
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center' };

    // Generated date
    worksheet.mergeCells('A2', `${String.fromCharCode(64 + columns.length)}2`);
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Generated on: ${new Date().toLocaleString()}`;
    dateCell.alignment = { horizontal: 'center' };

    // Headers
    const headerRow = worksheet.getRow(4);
    columns.forEach((col, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = col.label;
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
      cell.border = {
        bottom: { style: 'thin' },
      };
      worksheet.getColumn(i + 1).width = col.width ? col.width / 7 : 15;
    });

    // Data rows
    data.forEach((row, rowIndex) => {
      const excelRow = worksheet.getRow(rowIndex + 5);
      columns.forEach((col, colIndex) => {
        const value = this.getNestedValue(row, col.field);
        const cell = excelRow.getCell(colIndex + 1);
        cell.value = this.formatValue(value, col.format);
      });
    });

    // Aggregations
    if (aggregations && aggregations.length > 0) {
      const aggStartRow = data.length + 7;
      worksheet.getCell(`A${aggStartRow}`).value = 'Summary';
      worksheet.getCell(`A${aggStartRow}`).font = { bold: true };

      aggregations.forEach((agg, i) => {
        const result = this.calculateAggregation(data, agg.field, agg.function);
        worksheet.getCell(`A${aggStartRow + i + 1}`).value = agg.label || agg.field;
        worksheet.getCell(`B${aggStartRow + i + 1}`).value = result;
      });
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  private async generateCSV(columns: ColumnDefinition[], data: any[]): Promise<Buffer> {
    const headers = columns.map((c) => c.label).join(',');
    const rows = data.map((row) =>
      columns
        .map((col) => {
          const value = this.getNestedValue(row, col.field);
          const formatted = this.formatValue(value, col.format);
          // Escape commas and quotes
          const str = String(formatted ?? '');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(','),
    );

    return Buffer.from([headers, ...rows].join('\n'));
  }

  // =============================================================================
  // REPORT JOBS
  // =============================================================================

  async findAllJobs(
    tenantId: string,
    query: ReportJobQueryDto,
  ): Promise<{ jobs: ReportJobResponse[]; total: number }> {
    const { templateId, status, format, createdById, startDate, endDate, limit = 20, offset = 0 } = query;

    const where: any = {
      tenantId,
      ...(templateId && { templateId }),
      ...(status && { status }),
      ...(format && { format }),
      ...(createdById && { createdById }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    const [jobs, total] = await Promise.all([
      this.prisma.reportJob.findMany({
        where,
        include: { template: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.reportJob.count({ where }),
    ]);

    return {
      jobs: jobs.map(this.mapJobToResponse),
      total,
    };
  }

  async findJobById(tenantId: string, id: string): Promise<ReportJobResponse> {
    const job = await this.prisma.reportJob.findFirst({
      where: { id, tenantId },
      include: { template: true },
    });

    if (!job) {
      throw new NotFoundException('Report job not found');
    }

    return this.mapJobToResponse(job);
  }

  async deleteJob(tenantId: string, id: string): Promise<void> {
    const job = await this.prisma.reportJob.findFirst({
      where: { id, tenantId },
    });

    if (!job) {
      throw new NotFoundException('Report job not found');
    }

    // TODO: Delete file from S3 if exists

    await this.prisma.reportJob.delete({ where: { id } });
  }

  // =============================================================================
  // SCHEDULED REPORTS
  // =============================================================================

  async createScheduledReport(
    tenantId: string,
    dto: CreateScheduledReportDto,
  ): Promise<ScheduledReportResponse> {
    // Verify template exists
    await this.findTemplateById(tenantId, dto.templateId);

    const nextRunAt = this.calculateNextRun(dto.frequency, dto.time, dto.dayOfWeek, dto.dayOfMonth);

    const scheduled = await this.prisma.scheduledReport.create({
      data: {
        tenantId,
        templateId: dto.templateId,
        name: dto.name,
        description: dto.description,
        frequency: dto.frequency,
        dayOfWeek: dto.dayOfWeek,
        dayOfMonth: dto.dayOfMonth,
        monthOfYear: dto.monthOfYear,
        time: dto.time,
        timezone: dto.timezone || 'Asia/Kolkata',
        filters: dto.filters as any,
        dateRangeType: dto.dateRangeType || 'auto',
        dateRangeValue: dto.dateRangeValue as any,
        format: dto.format || ReportFormat.PDF,
        deliveryMethod: dto.deliveryMethod || 'email',
        recipients: dto.recipients || [],
        emailSubject: dto.emailSubject,
        emailBody: dto.emailBody,
        nextRunAt,
      },
      include: { template: true },
    });

    return this.mapScheduledToResponse(scheduled);
  }

  async findAllScheduledReports(
    tenantId: string,
    query: ScheduledReportQueryDto,
  ): Promise<{ reports: ScheduledReportResponse[]; total: number }> {
    const { templateId, frequency, isActive, limit = 20, offset = 0 } = query;

    const where: any = {
      tenantId,
      ...(templateId && { templateId }),
      ...(frequency && { frequency }),
      ...(isActive !== undefined && { isActive }),
    };

    const [reports, total] = await Promise.all([
      this.prisma.scheduledReport.findMany({
        where,
        include: { template: true },
        orderBy: { nextRunAt: 'asc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.scheduledReport.count({ where }),
    ]);

    return {
      reports: reports.map(this.mapScheduledToResponse),
      total,
    };
  }

  async updateScheduledReport(
    tenantId: string,
    id: string,
    dto: UpdateScheduledReportDto,
  ): Promise<ScheduledReportResponse> {
    const existing = await this.prisma.scheduledReport.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Scheduled report not found');
    }

    const updateData: any = { ...dto };
    delete updateData.filters;
    delete updateData.dateRangeValue;

    if (dto.filters !== undefined) {
      updateData.filters = dto.filters as any;
    }
    if (dto.dateRangeValue !== undefined) {
      updateData.dateRangeValue = dto.dateRangeValue as any;
    }

    // Recalculate next run if schedule changed
    if (dto.frequency || dto.time || dto.dayOfWeek || dto.dayOfMonth) {
      updateData.nextRunAt = this.calculateNextRun(
        dto.frequency || existing.frequency,
        dto.time || existing.time,
        dto.dayOfWeek ?? existing.dayOfWeek ?? undefined,
        dto.dayOfMonth ?? existing.dayOfMonth ?? undefined,
      );
    }

    const scheduled = await this.prisma.scheduledReport.update({
      where: { id },
      data: updateData,
      include: { template: true },
    });

    return this.mapScheduledToResponse(scheduled);
  }

  async deleteScheduledReport(tenantId: string, id: string): Promise<void> {
    const existing = await this.prisma.scheduledReport.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Scheduled report not found');
    }

    await this.prisma.scheduledReport.delete({ where: { id } });
  }

  // =============================================================================
  // STATISTICS
  // =============================================================================

  async getStats(tenantId: string): Promise<ReportStatsResponse> {
    const [
      totalTemplates,
      systemTemplates,
      totalJobs,
      completedJobs,
      failedJobs,
      pendingJobs,
      scheduledReports,
      activeSchedules,
      jobsByFormat,
      recentJobs,
    ] = await Promise.all([
      this.prisma.reportTemplate.count({
        where: { OR: [{ tenantId }, { tenantId: null }] },
      }),
      this.prisma.reportTemplate.count({
        where: { isSystem: true },
      }),
      this.prisma.reportJob.count({ where: { tenantId } }),
      this.prisma.reportJob.count({ where: { tenantId, status: ReportStatus.COMPLETED } }),
      this.prisma.reportJob.count({ where: { tenantId, status: ReportStatus.FAILED } }),
      this.prisma.reportJob.count({
        where: { tenantId, status: { in: [ReportStatus.PENDING, ReportStatus.PROCESSING] } },
      }),
      this.prisma.scheduledReport.count({ where: { tenantId } }),
      this.prisma.scheduledReport.count({ where: { tenantId, isActive: true } }),
      this.prisma.reportJob.groupBy({
        by: ['format'],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.reportJob.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      totalTemplates,
      systemTemplates,
      customTemplates: totalTemplates - systemTemplates,
      totalJobs,
      completedJobs,
      failedJobs,
      pendingJobs,
      scheduledReports,
      activeSchedules,
      jobsByFormat: jobsByFormat.reduce(
        (acc, item) => {
          acc[item.format] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      jobsByCategory: {},
      recentJobs: recentJobs.map(this.mapJobToResponse),
    };
  }

  // =============================================================================
  // SEED SYSTEM TEMPLATES
  // =============================================================================

  async seedSystemTemplates(): Promise<number> {
    let created = 0;

    for (const [key, template] of Object.entries(SYSTEM_TEMPLATES)) {
      const existing = await this.prisma.reportTemplate.findFirst({
        where: { name: template.name, isSystem: true },
      });

      if (!existing) {
        await this.prisma.reportTemplate.create({
          data: {
            tenantId: null,
            name: template.name,
            description: template.description,
            category: template.category,
            reportType: template.reportType,
            dataSource: template.dataSource,
            columns: template.columns as any,
            filters: template.filters as any,
            groupBy: template.groupBy || [],
            sortBy: template.sortBy,
            sortOrder: template.sortOrder || 'asc',
            aggregations: template.aggregations as any,
            chartType: template.chartType,
            isSystem: true,
            isActive: true,
          },
        });
        created++;
      }
    }

    return created;
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private formatValue(value: any, format?: string): any {
    if (value === null || value === undefined) return '';

    switch (format) {
      case 'date':
        return value instanceof Date ? value.toLocaleDateString() : new Date(value).toLocaleDateString();
      case 'datetime':
        return value instanceof Date ? value.toLocaleString() : new Date(value).toLocaleString();
      case 'currency':
        return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      case 'percentage':
        return `${Number(value).toFixed(2)}%`;
      case 'number':
        return Number(value).toLocaleString();
      default:
        return value;
    }
  }

  private calculateAggregation(data: any[], field: string, fn: string): number {
    const values = data.map((row) => Number(this.getNestedValue(row, field)) || 0);

    switch (fn) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'avg':
        return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      case 'count':
        return values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      default:
        return 0;
    }
  }

  private calculateNextRun(
    frequency: string,
    time: string,
    dayOfWeek?: number,
    dayOfMonth?: number,
  ): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const next = new Date();

    next.setHours(hours, minutes, 0, 0);

    switch (frequency) {
      case 'daily':
        if (next <= now) next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        const targetDay = dayOfWeek ?? 0;
        const currentDay = now.getDay();
        let daysUntil = targetDay - currentDay;
        if (daysUntil < 0 || (daysUntil === 0 && next <= now)) {
          daysUntil += 7;
        }
        next.setDate(next.getDate() + daysUntil);
        break;
      case 'monthly':
        next.setDate(dayOfMonth ?? 1);
        if (next <= now) next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        next.setMonth((quarter + 1) * 3);
        next.setDate(dayOfMonth ?? 1);
        if (next <= now) next.setMonth(next.getMonth() + 3);
        break;
      case 'yearly':
        next.setMonth(0);
        next.setDate(dayOfMonth ?? 1);
        if (next <= now) next.setFullYear(next.getFullYear() + 1);
        break;
    }

    return next;
  }

  private mapTemplateToResponse(template: any): ReportTemplateResponse {
    return {
      id: template.id,
      tenantId: template.tenantId,
      name: template.name,
      description: template.description,
      category: template.category,
      reportType: template.reportType,
      dataSource: template.dataSource,
      columns: template.columns as ColumnDefinition[],
      filters: template.filters as any,
      groupBy: template.groupBy,
      sortBy: template.sortBy,
      sortOrder: template.sortOrder,
      aggregations: template.aggregations as any,
      chartType: template.chartType,
      chartConfig: template.chartConfig as any,
      orientation: template.orientation,
      pageSize: template.pageSize,
      showHeader: template.showHeader,
      showFooter: template.showFooter,
      isSystem: template.isSystem,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  private mapJobToResponse(job: any): ReportJobResponse {
    return {
      id: job.id,
      tenantId: job.tenantId,
      templateId: job.templateId,
      name: job.name,
      description: job.description,
      dataSource: job.dataSource,
      format: job.format,
      status: job.status,
      progress: job.progress,
      errorMessage: job.errorMessage,
      fileUrl: job.fileUrl,
      fileName: job.fileName,
      fileSize: job.fileSize,
      rowCount: job.rowCount,
      generatedAt: job.generatedAt,
      executionTime: job.executionTime,
      createdAt: job.createdAt,
    };
  }

  private mapScheduledToResponse(scheduled: any): ScheduledReportResponse {
    return {
      id: scheduled.id,
      tenantId: scheduled.tenantId,
      templateId: scheduled.templateId,
      name: scheduled.name,
      description: scheduled.description,
      frequency: scheduled.frequency,
      time: scheduled.time,
      timezone: scheduled.timezone,
      format: scheduled.format,
      deliveryMethod: scheduled.deliveryMethod,
      recipients: scheduled.recipients,
      isActive: scheduled.isActive,
      lastRunAt: scheduled.lastRunAt,
      nextRunAt: scheduled.nextRunAt,
      lastStatus: scheduled.lastStatus,
      runCount: scheduled.runCount,
      failureCount: scheduled.failureCount,
      template: scheduled.template ? this.mapTemplateToResponse(scheduled.template) : undefined,
    };
  }
}
