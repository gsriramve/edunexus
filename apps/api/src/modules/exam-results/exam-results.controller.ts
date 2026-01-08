import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ExamResultsService } from './exam-results.service';
import {
  CreateExamResultDto,
  BulkCreateExamResultDto,
  UpdateExamResultDto,
} from './dto/exam-result.dto';

@Controller('exam-results')
export class ExamResultsController {
  constructor(private readonly examResultsService: ExamResultsService) {}

  @Post()
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createDto: CreateExamResultDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.examResultsService.create(tenantId, createDto);
  }

  @Post('bulk')
  bulkCreate(
    @Headers('x-tenant-id') tenantId: string,
    @Body() bulkDto: BulkCreateExamResultDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.examResultsService.bulkCreate(tenantId, bulkDto);
  }

  @Get('exam/:examId')
  findByExam(
    @Headers('x-tenant-id') tenantId: string,
    @Param('examId') examId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.examResultsService.findByExam(tenantId, examId);
  }

  @Get('student/:studentId')
  findByStudent(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.examResultsService.findByStudent(tenantId, studentId);
  }

  @Get('student/:studentId/semester/:semester')
  getStudentSemesterResults(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
    @Param('semester') semester: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.examResultsService.getStudentSemesterResults(
      tenantId,
      studentId,
      parseInt(semester, 10),
    );
  }

  @Get('student/:studentId/cgpa')
  calculateCGPA(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.examResultsService.calculateCGPA(tenantId, studentId);
  }

  @Get('student/:studentId/predictions')
  getPredictions(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.examResultsService.getPredictions(tenantId, studentId);
  }

  @Patch(':id')
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateExamResultDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.examResultsService.update(tenantId, id, updateDto);
  }
}
