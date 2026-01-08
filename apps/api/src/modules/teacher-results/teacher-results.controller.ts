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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TeacherResultsService } from './teacher-results.service';
import {
  QueryExamsDto,
  CreateExamDto,
  SaveResultsDto,
  UpdateResultDto,
} from './dto/teacher-results.dto';

@Controller('teacher-results')
export class TeacherResultsController {
  constructor(private readonly resultsService: TeacherResultsService) {}

  /**
   * Get exams and subjects for the teacher
   * GET /api/teacher-results/exams
   */
  @Get('exams')
  getTeacherExams(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryExamsDto,
  ) {
    return this.resultsService.getTeacherExams(tenantId, userId, query);
  }

  /**
   * Get results for a specific exam
   * GET /api/teacher-results/exams/:examId/results
   */
  @Get('exams/:examId/results')
  getExamResults(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('examId') examId: string,
  ) {
    return this.resultsService.getExamResults(tenantId, userId, examId);
  }

  /**
   * Create a new exam
   * POST /api/teacher-results/exams
   */
  @Post('exams')
  @HttpCode(HttpStatus.CREATED)
  createExam(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateExamDto,
  ) {
    return this.resultsService.createExam(tenantId, userId, dto);
  }

  /**
   * Save results for an exam
   * POST /api/teacher-results/results
   */
  @Post('results')
  @HttpCode(HttpStatus.OK)
  saveResults(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: SaveResultsDto,
  ) {
    return this.resultsService.saveResults(tenantId, userId, dto);
  }

  /**
   * Update a single result
   * PATCH /api/teacher-results/results/:resultId
   */
  @Patch('results/:resultId')
  updateResult(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('resultId') resultId: string,
    @Body() dto: UpdateResultDto,
  ) {
    return this.resultsService.updateResult(tenantId, userId, resultId, dto);
  }

  /**
   * Delete an exam
   * DELETE /api/teacher-results/exams/:examId
   */
  @Delete('exams/:examId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteExam(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('examId') examId: string,
  ) {
    return this.resultsService.deleteExam(tenantId, userId, examId);
  }
}
