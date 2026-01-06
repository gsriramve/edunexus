import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import { Readable } from 'stream';
import {
  CreateImportJobDto,
  UpdateImportJobDto,
  ImportJobQueryDto,
  CreateExportJobDto,
  ExportJobQueryDto,
  CreateImportTemplateDto,
  UpdateImportTemplateDto,
  ImportTemplateQueryDto,
  EntityType,
  ImportStatus,
  ExportStatus,
  EntityFieldInfo,
  ImportValidationResult,
  ImportStats,
  ColumnMappingDto,
} from './dto/import-export.dto';

@Injectable()
export class ImportExportService {
  constructor(private prisma: PrismaService) {}

  // =============================================================================
  // ENTITY FIELD DEFINITIONS
  // =============================================================================

  private entityFields: Record<string, EntityFieldInfo[]> = {
    students: [
      { name: 'rollNo', type: 'string', required: true, description: 'Roll number', example: 'CSE2021001' },
      { name: 'firstName', type: 'string', required: true, description: 'First name', example: 'John' },
      { name: 'lastName', type: 'string', required: true, description: 'Last name', example: 'Doe' },
      { name: 'email', type: 'string', required: true, description: 'Email address', example: 'john@example.com' },
      { name: 'phone', type: 'string', required: false, description: 'Phone number', example: '9876543210' },
      { name: 'dateOfBirth', type: 'date', required: false, description: 'Date of birth', example: '2000-01-15' },
      { name: 'gender', type: 'string', required: false, description: 'Gender', example: 'male' },
      { name: 'department', type: 'string', required: true, description: 'Department code', example: 'CSE' },
      { name: 'course', type: 'string', required: true, description: 'Course code', example: 'BTECH' },
      { name: 'batchYear', type: 'number', required: true, description: 'Batch year', example: '2021' },
      { name: 'semester', type: 'number', required: false, description: 'Current semester', example: '6' },
      { name: 'section', type: 'string', required: false, description: 'Section', example: 'A' },
      { name: 'address', type: 'string', required: false, description: 'Address', example: '123 Main St' },
      { name: 'city', type: 'string', required: false, description: 'City', example: 'Mumbai' },
      { name: 'state', type: 'string', required: false, description: 'State', example: 'Maharashtra' },
      { name: 'pincode', type: 'string', required: false, description: 'Pincode', example: '400001' },
      { name: 'guardianName', type: 'string', required: false, description: 'Guardian name', example: 'Jane Doe' },
      { name: 'guardianPhone', type: 'string', required: false, description: 'Guardian phone', example: '9876543211' },
    ],
    staff: [
      { name: 'employeeId', type: 'string', required: true, description: 'Employee ID', example: 'EMP001' },
      { name: 'firstName', type: 'string', required: true, description: 'First name', example: 'Jane' },
      { name: 'lastName', type: 'string', required: true, description: 'Last name', example: 'Smith' },
      { name: 'email', type: 'string', required: true, description: 'Email address', example: 'jane@example.com' },
      { name: 'phone', type: 'string', required: false, description: 'Phone number', example: '9876543210' },
      { name: 'designation', type: 'string', required: true, description: 'Designation', example: 'Professor' },
      { name: 'department', type: 'string', required: true, description: 'Department code', example: 'CSE' },
      { name: 'dateOfJoining', type: 'date', required: false, description: 'Date of joining', example: '2020-06-01' },
      { name: 'qualification', type: 'string', required: false, description: 'Qualification', example: 'Ph.D' },
      { name: 'specialization', type: 'string', required: false, description: 'Specialization', example: 'Machine Learning' },
    ],
    fees: [
      { name: 'rollNo', type: 'string', required: true, description: 'Student roll number', example: 'CSE2021001' },
      { name: 'feeType', type: 'string', required: true, description: 'Fee type', example: 'tuition' },
      { name: 'amount', type: 'number', required: true, description: 'Amount', example: '50000' },
      { name: 'dueDate', type: 'date', required: true, description: 'Due date', example: '2026-03-31' },
      { name: 'semester', type: 'number', required: false, description: 'Semester', example: '6' },
      { name: 'academicYear', type: 'string', required: false, description: 'Academic year', example: '2025-26' },
    ],
    attendance: [
      { name: 'rollNo', type: 'string', required: true, description: 'Student roll number', example: 'CSE2021001' },
      { name: 'date', type: 'date', required: true, description: 'Attendance date', example: '2026-01-06' },
      { name: 'subject', type: 'string', required: true, description: 'Subject code', example: 'CS601' },
      { name: 'status', type: 'string', required: true, description: 'Status (present/absent/late)', example: 'present' },
      { name: 'session', type: 'string', required: false, description: 'Session', example: 'morning' },
    ],
    marks: [
      { name: 'rollNo', type: 'string', required: true, description: 'Student roll number', example: 'CSE2021001' },
      { name: 'subject', type: 'string', required: true, description: 'Subject code', example: 'CS601' },
      { name: 'examType', type: 'string', required: true, description: 'Exam type', example: 'internal' },
      { name: 'marks', type: 'number', required: true, description: 'Marks obtained', example: '85' },
      { name: 'totalMarks', type: 'number', required: false, description: 'Total marks', example: '100' },
      { name: 'remarks', type: 'string', required: false, description: 'Remarks', example: 'Good performance' },
    ],
    library_books: [
      { name: 'isbn', type: 'string', required: true, description: 'ISBN', example: '978-0-13-468599-1' },
      { name: 'title', type: 'string', required: true, description: 'Book title', example: 'Introduction to Algorithms' },
      { name: 'author', type: 'string', required: true, description: 'Author', example: 'Thomas H. Cormen' },
      { name: 'publisher', type: 'string', required: false, description: 'Publisher', example: 'MIT Press' },
      { name: 'category', type: 'string', required: false, description: 'Category', example: 'Computer Science' },
      { name: 'totalCopies', type: 'number', required: true, description: 'Total copies', example: '5' },
      { name: 'location', type: 'string', required: false, description: 'Shelf location', example: 'A-101' },
    ],
  };

  getEntityFields(entityType: string): EntityFieldInfo[] {
    return this.entityFields[entityType] || [];
  }

  // =============================================================================
  // IMPORT JOBS
  // =============================================================================

  async createImportJob(tenantId: string, dto: CreateImportJobDto) {
    return this.prisma.importJob.create({
      data: {
        tenantId,
        entityType: dto.entityType,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        fileSize: dto.fileSize,
        mapping: dto.mapping as any,
        options: dto.options as any,
        createdById: dto.createdById,
        status: ImportStatus.PENDING,
      },
    });
  }

  async findAllImportJobs(tenantId: string, query: ImportJobQueryDto) {
    const { entityType, status, createdById, limit = 20, offset = 0 } = query;

    const where: any = { tenantId };
    if (entityType) where.entityType = entityType;
    if (status) where.status = status;
    if (createdById) where.createdById = createdById;

    const [jobs, total] = await Promise.all([
      this.prisma.importJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.importJob.count({ where }),
    ]);

    return { jobs, total, limit, offset };
  }

  async findImportJobById(tenantId: string, id: string) {
    const job = await this.prisma.importJob.findFirst({
      where: { id, tenantId },
    });

    if (!job) {
      throw new NotFoundException('Import job not found');
    }

    return job;
  }

  async updateImportJob(tenantId: string, id: string, dto: UpdateImportJobDto) {
    await this.findImportJobById(tenantId, id);

    return this.prisma.importJob.update({
      where: { id },
      data: {
        mapping: dto.mapping as any,
        options: dto.options as any,
        status: dto.status,
      },
    });
  }

  async cancelImportJob(tenantId: string, id: string) {
    const job = await this.findImportJobById(tenantId, id);

    if (job.status !== ImportStatus.PENDING && job.status !== ImportStatus.VALIDATING) {
      throw new BadRequestException('Can only cancel pending or validating jobs');
    }

    return this.prisma.importJob.update({
      where: { id },
      data: { status: ImportStatus.CANCELLED },
    });
  }

  async deleteImportJob(tenantId: string, id: string) {
    await this.findImportJobById(tenantId, id);
    await this.prisma.importJob.delete({ where: { id } });
  }

  // =============================================================================
  // EXCEL PARSING & VALIDATION
  // =============================================================================

  async parseExcelFile(buffer: Buffer): Promise<{ headers: string[]; rows: any[][]; totalRows: number }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestException('No worksheet found in the Excel file');
    }

    const headers: string[] = [];
    const rows: any[][] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // Header row
        row.eachCell((cell) => {
          headers.push(String(cell.value || '').trim());
        });
      } else {
        // Data rows
        const rowData: any[] = [];
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          rowData[colNumber - 1] = cell.value;
        });
        rows.push(rowData);
      }
    });

    return { headers, rows, totalRows: rows.length };
  }

  async validateImportData(
    tenantId: string,
    jobId: string,
    buffer: Buffer,
  ): Promise<ImportValidationResult> {
    const job = await this.findImportJobById(tenantId, jobId);
    const fields = this.getEntityFields(job.entityType);
    const mapping = (job.mapping as unknown as ColumnMappingDto[]) || [];

    // Update job status
    await this.prisma.importJob.update({
      where: { id: jobId },
      data: { status: ImportStatus.VALIDATING },
    });

    const { headers, rows, totalRows } = await this.parseExcelFile(buffer);
    const errors: Array<{ row: number; field: string; value: any; error: string }> = [];
    const preview: Array<Record<string, any>> = [];
    let validRows = 0;

    // Create header to field mapping
    const headerMap = new Map<number, string>();
    mapping.forEach((m) => {
      const colIndex = headers.findIndex((h) => h.toLowerCase() === m.sourceColumn.toLowerCase());
      if (colIndex >= 0) {
        headerMap.set(colIndex, m.targetField);
      }
    });

    // If no mapping provided, try auto-mapping
    if (mapping.length === 0) {
      headers.forEach((header, index) => {
        const field = fields.find((f) =>
          f.name.toLowerCase() === header.toLowerCase() ||
          f.name.toLowerCase().replace(/([A-Z])/g, ' $1').trim().toLowerCase() === header.toLowerCase()
        );
        if (field) {
          headerMap.set(index, field.name);
        }
      });
    }

    // Validate each row
    rows.forEach((row, rowIndex) => {
      const rowData: Record<string, any> = {};
      let rowValid = true;

      // Map values
      headerMap.forEach((fieldName, colIndex) => {
        rowData[fieldName] = row[colIndex];
      });

      // Check required fields
      fields.forEach((field) => {
        if (field.required && !rowData[field.name]) {
          errors.push({
            row: rowIndex + 2, // +2 for 1-based index and header row
            field: field.name,
            value: rowData[field.name],
            error: `${field.name} is required`,
          });
          rowValid = false;
        }

        // Type validation
        if (rowData[field.name] !== undefined && rowData[field.name] !== null) {
          if (field.type === 'number' && isNaN(Number(rowData[field.name]))) {
            errors.push({
              row: rowIndex + 2,
              field: field.name,
              value: rowData[field.name],
              error: `${field.name} must be a number`,
            });
            rowValid = false;
          }
          if (field.type === 'date') {
            const dateValue = new Date(rowData[field.name]);
            if (isNaN(dateValue.getTime())) {
              errors.push({
                row: rowIndex + 2,
                field: field.name,
                value: rowData[field.name],
                error: `${field.name} must be a valid date`,
              });
              rowValid = false;
            }
          }
        }
      });

      if (rowValid) validRows++;
      if (rowIndex < 5) preview.push(rowData); // Only first 5 rows for preview
    });

    // Update job with validation results
    await this.prisma.importJob.update({
      where: { id: jobId },
      data: {
        totalRows,
        errorLog: errors.slice(0, 100) as any, // Limit errors stored
        status: errors.length === 0 ? ImportStatus.PENDING : ImportStatus.VALIDATING,
      },
    });

    return {
      valid: errors.length === 0,
      totalRows,
      validRows,
      invalidRows: totalRows - validRows,
      errors: errors.slice(0, 50), // Return first 50 errors
      preview,
    };
  }

  async processImportJob(tenantId: string, jobId: string, buffer: Buffer) {
    const job = await this.findImportJobById(tenantId, jobId);

    if (job.status !== ImportStatus.PENDING && job.status !== ImportStatus.VALIDATING) {
      throw new BadRequestException('Job is not ready for processing');
    }

    // Update status to processing
    await this.prisma.importJob.update({
      where: { id: jobId },
      data: { status: ImportStatus.PROCESSING, startedAt: new Date() },
    });

    try {
      const { headers, rows } = await this.parseExcelFile(buffer);
      const fields = this.getEntityFields(job.entityType);
      const mapping = (job.mapping as unknown as ColumnMappingDto[]) || [];
      const options = (job.options as any) || {};

      // Create header to field mapping
      const headerMap = new Map<number, string>();
      if (mapping.length > 0) {
        mapping.forEach((m) => {
          const colIndex = headers.findIndex((h) => h.toLowerCase() === m.sourceColumn.toLowerCase());
          if (colIndex >= 0) {
            headerMap.set(colIndex, m.targetField);
          }
        });
      } else {
        headers.forEach((header, index) => {
          const field = fields.find((f) =>
            f.name.toLowerCase() === header.toLowerCase()
          );
          if (field) {
            headerMap.set(index, field.name);
          }
        });
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: any[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowData: Record<string, any> = {};

        headerMap.forEach((fieldName, colIndex) => {
          let value = row[colIndex];

          // Transform values
          const fieldDef = fields.find((f) => f.name === fieldName);
          if (fieldDef) {
            if (fieldDef.type === 'number' && value !== undefined && value !== null) {
              value = Number(value);
            }
            if (fieldDef.type === 'date' && value !== undefined && value !== null) {
              value = new Date(value);
            }
          }

          rowData[fieldName] = value;
        });

        try {
          // Import based on entity type
          await this.importRecord(tenantId, job.entityType, rowData, options);
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push({
            row: i + 2,
            error: error.message,
          });
        }

        // Update progress
        if ((i + 1) % 100 === 0) {
          await this.prisma.importJob.update({
            where: { id: jobId },
            data: { processedRows: i + 1, successCount, errorCount },
          });
        }
      }

      // Finalize
      await this.prisma.importJob.update({
        where: { id: jobId },
        data: {
          processedRows: rows.length,
          successCount,
          errorCount,
          errorLog: errors.slice(0, 100) as any,
          status: errorCount === 0 ? ImportStatus.COMPLETED : ImportStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      return { success: true, successCount, errorCount };
    } catch (error) {
      await this.prisma.importJob.update({
        where: { id: jobId },
        data: {
          status: ImportStatus.FAILED,
          errorLog: [{ error: error.message }] as any,
          completedAt: new Date(),
        },
      });
      throw error;
    }
  }

  private async importRecord(tenantId: string, entityType: string, data: Record<string, any>, options: any) {
    switch (entityType) {
      case EntityType.STUDENTS:
        return this.importStudent(tenantId, data, options);
      case EntityType.STAFF:
        return this.importStaff(tenantId, data, options);
      case EntityType.FEES:
        return this.importFee(tenantId, data, options);
      default:
        throw new BadRequestException(`Import not supported for entity type: ${entityType}`);
    }
  }

  private async importStudent(tenantId: string, data: Record<string, any>, options: any) {
    // TODO: Implement proper student import with User creation
    // Student model requires userId relation which needs User to be created first
    throw new Error('Student import requires User creation - not yet fully implemented. Please use the Students module to add students.');
  }

  private async importStaff(tenantId: string, data: Record<string, any>, options: any) {
    // TODO: Implement proper staff import with User creation
    // Staff model requires userId relation which needs User to be created first
    throw new Error('Staff import requires User creation - not yet fully implemented. Please use the Staff module to add staff.');
  }

  private async importFee(tenantId: string, data: Record<string, any>, options: any) {
    const student = await this.prisma.student.findFirst({
      where: { tenantId, rollNo: data.rollNo },
    });
    if (!student) {
      throw new Error(`Student not found: ${data.rollNo}`);
    }

    return this.prisma.studentFee.create({
      data: {
        tenantId,
        studentId: student.id,
        feeType: data.feeType,
        amount: Number(data.amount),
        dueDate: new Date(data.dueDate),
        status: 'pending',
      },
    });
  }

  // =============================================================================
  // EXPORT JOBS
  // =============================================================================

  async createExportJob(tenantId: string, dto: CreateExportJobDto) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = dto.fileName || `${dto.entityType}_export_${timestamp}.${dto.format || 'xlsx'}`;

    return this.prisma.exportJob.create({
      data: {
        tenantId,
        entityType: dto.entityType,
        fileName,
        format: dto.format || 'xlsx',
        filters: dto.filters as any,
        columns: dto.columns as any,
        createdById: dto.createdById,
        status: ExportStatus.PENDING,
      },
    });
  }

  async findAllExportJobs(tenantId: string, query: ExportJobQueryDto) {
    const { entityType, status, createdById, limit = 20, offset = 0 } = query;

    const where: any = { tenantId };
    if (entityType) where.entityType = entityType;
    if (status) where.status = status;
    if (createdById) where.createdById = createdById;

    const [jobs, total] = await Promise.all([
      this.prisma.exportJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.exportJob.count({ where }),
    ]);

    return { jobs, total, limit, offset };
  }

  async findExportJobById(tenantId: string, id: string) {
    const job = await this.prisma.exportJob.findFirst({
      where: { id, tenantId },
    });

    if (!job) {
      throw new NotFoundException('Export job not found');
    }

    return job;
  }

  async processExportJob(tenantId: string, jobId: string): Promise<Buffer> {
    const job = await this.findExportJobById(tenantId, jobId);

    await this.prisma.exportJob.update({
      where: { id: jobId },
      data: { status: ExportStatus.PROCESSING, startedAt: new Date() },
    });

    try {
      const data = await this.getExportData(tenantId, job.entityType, job.filters as any, job.columns as any);
      const buffer = await this.generateExcelFile(job.entityType, data, job.format);

      await this.prisma.exportJob.update({
        where: { id: jobId },
        data: {
          status: ExportStatus.COMPLETED,
          totalRecords: data.length,
          fileSize: buffer.length,
          completedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      return buffer;
    } catch (error) {
      await this.prisma.exportJob.update({
        where: { id: jobId },
        data: { status: ExportStatus.FAILED, completedAt: new Date() },
      });
      throw error;
    }
  }

  private async getExportData(tenantId: string, entityType: string, filters: any, columns: string[]): Promise<any[]> {
    switch (entityType) {
      case EntityType.STUDENTS:
        return this.exportStudents(tenantId, filters);
      case EntityType.STAFF:
        return this.exportStaff(tenantId, filters);
      case EntityType.FEES:
        return this.exportFees(tenantId, filters);
      default:
        throw new BadRequestException(`Export not supported for entity type: ${entityType}`);
    }
  }

  private async exportStudents(tenantId: string, filters: any) {
    const where: any = { tenantId };
    if (filters?.departmentId) where.departmentId = filters.departmentId;
    if (filters?.status) where.status = filters.status;

    const students = await this.prisma.student.findMany({
      where,
      include: {
        department: true,
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: { rollNo: 'asc' },
    });

    return students.map((s) => ({
      rollNo: s.rollNo,
      name: s.user?.name || '',
      email: s.user?.email || '',
      dateOfBirth: s.user?.profile?.dob?.toISOString().split('T')[0] || '',
      gender: s.user?.profile?.gender || '',
      department: s.department?.name || '',
      batch: s.batch,
      semester: s.semester,
      section: s.section || '',
      status: s.status,
      admissionDate: s.admissionDate?.toISOString().split('T')[0] || '',
    }));
  }

  private async exportStaff(tenantId: string, filters: any) {
    const where: any = { tenantId };
    if (filters?.departmentId) where.departmentId = filters.departmentId;

    const staff = await this.prisma.staff.findMany({
      where,
      include: {
        department: true,
        user: true,
      },
      orderBy: { employeeId: 'asc' },
    });

    return staff.map((s) => ({
      employeeId: s.employeeId,
      name: s.user?.name || '',
      email: s.user?.email || '',
      role: s.user?.role || '',
      designation: s.designation,
      department: s.department?.name || '',
      joiningDate: s.joiningDate?.toISOString().split('T')[0] || '',
      status: s.user?.status || '',
    }));
  }

  private async exportFees(tenantId: string, filters: any) {
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;

    const fees = await this.prisma.studentFee.findMany({
      where,
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { dueDate: 'desc' },
    });

    return fees.map((f) => ({
      rollNo: f.student?.rollNo || '',
      studentName: f.student?.user?.name || '',
      feeType: f.feeType,
      amount: Number(f.amount),
      dueDate: f.dueDate?.toISOString().split('T')[0] || '',
      paidDate: f.paidDate?.toISOString().split('T')[0] || '',
      status: f.status,
    }));
  }

  private async generateExcelFile(entityType: string, data: any[], format: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(entityType);

    if (data.length === 0) {
      const fields = this.getEntityFields(entityType);
      worksheet.columns = fields.map((f) => ({ header: f.name, key: f.name, width: 15 }));
    } else {
      const columns = Object.keys(data[0]);
      worksheet.columns = columns.map((col) => ({
        header: col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1'),
        key: col,
        width: 15,
      }));
      worksheet.addRows(data);
    }

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    if (format === 'csv') {
      const buffer = await workbook.csv.writeBuffer();
      return Buffer.from(buffer);
    } else {
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    }
  }

  async incrementDownloadCount(tenantId: string, id: string) {
    await this.findExportJobById(tenantId, id);
    return this.prisma.exportJob.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
  }

  // =============================================================================
  // IMPORT TEMPLATES
  // =============================================================================

  async createImportTemplate(tenantId: string, dto: CreateImportTemplateDto) {
    return this.prisma.importTemplate.create({
      data: {
        tenantId,
        name: dto.name,
        entityType: dto.entityType,
        mapping: dto.mapping as any,
        options: dto.options as any,
        isDefault: dto.isDefault || false,
        createdById: dto.createdById,
      },
    });
  }

  async findAllImportTemplates(tenantId: string, query: ImportTemplateQueryDto) {
    const { entityType, limit = 50, offset = 0 } = query;

    const where: any = { tenantId };
    if (entityType) where.entityType = entityType;

    const [templates, total] = await Promise.all([
      this.prisma.importTemplate.findMany({
        where,
        orderBy: { name: 'asc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.importTemplate.count({ where }),
    ]);

    return { templates, total, limit, offset };
  }

  async findImportTemplateById(tenantId: string, id: string) {
    const template = await this.prisma.importTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!template) {
      throw new NotFoundException('Import template not found');
    }

    return template;
  }

  async updateImportTemplate(tenantId: string, id: string, dto: UpdateImportTemplateDto) {
    await this.findImportTemplateById(tenantId, id);

    return this.prisma.importTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        mapping: dto.mapping as any,
        options: dto.options as any,
        isDefault: dto.isDefault,
      },
    });
  }

  async deleteImportTemplate(tenantId: string, id: string) {
    await this.findImportTemplateById(tenantId, id);
    await this.prisma.importTemplate.delete({ where: { id } });
  }

  // =============================================================================
  // SAMPLE TEMPLATE GENERATION
  // =============================================================================

  async generateSampleTemplate(entityType: string): Promise<Buffer> {
    const fields = this.getEntityFields(entityType);
    if (fields.length === 0) {
      throw new BadRequestException(`Unknown entity type: ${entityType}`);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    const instructionsSheet = workbook.addWorksheet('Instructions');

    // Data sheet
    worksheet.columns = fields.map((f) => ({
      header: f.name,
      key: f.name,
      width: 20,
    }));

    // Add example row
    const exampleRow: Record<string, any> = {};
    fields.forEach((f) => {
      exampleRow[f.name] = f.example || '';
    });
    worksheet.addRow(exampleRow);

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Instructions sheet
    instructionsSheet.columns = [
      { header: 'Field Name', key: 'name', width: 20 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Required', key: 'required', width: 10 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Example', key: 'example', width: 25 },
    ];

    instructionsSheet.addRows(fields);
    instructionsSheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  // =============================================================================
  // STATISTICS
  // =============================================================================

  async getStats(tenantId: string): Promise<ImportStats> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      pendingJobs,
      processingJobs,
      completedJobs,
      failedJobs,
      totalImports,
      totalExports,
      recentImports,
      recentExports,
    ] = await Promise.all([
      this.prisma.importJob.count({ where: { tenantId, status: ImportStatus.PENDING } }),
      this.prisma.importJob.count({ where: { tenantId, status: ImportStatus.PROCESSING } }),
      this.prisma.importJob.count({ where: { tenantId, status: ImportStatus.COMPLETED } }),
      this.prisma.importJob.count({ where: { tenantId, status: ImportStatus.FAILED } }),
      this.prisma.importJob.count({ where: { tenantId } }),
      this.prisma.exportJob.count({ where: { tenantId } }),
      this.prisma.importJob.count({ where: { tenantId, createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.exportJob.count({ where: { tenantId, createdAt: { gte: sevenDaysAgo } } }),
    ]);

    return {
      pendingJobs,
      processingJobs,
      completedJobs,
      failedJobs,
      totalImports,
      totalExports,
      recentImports,
      recentExports,
    };
  }
}
