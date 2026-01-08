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
import { HodExamsService } from './hod-exams.service';
import {
  QueryExamsDto,
  ScheduleExamDto,
  UpdateExamDto,
  UpdateExamStatusDto,
} from './dto/hod-exams.dto';

@Controller('hod/exams')
export class HodExamsController {
  constructor(private readonly hodExamsService: HodExamsService) {}

  private getTenantId(headers: Record<string, string>): string {
    const tenantId = headers['x-tenant-id'];
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    return tenantId;
  }

  private getUserId(headers: Record<string, string>): string {
    const userId = headers['x-user-id'];
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return userId;
  }

  /**
   * Get exams overview
   */
  @Get()
  getExamsOverview(
    @Headers() headers: Record<string, string>,
    @Query() query: QueryExamsDto,
  ) {
    return this.hodExamsService.getExamsOverview(
      this.getTenantId(headers),
      this.getUserId(headers),
      query,
    );
  }

  /**
   * Get exam statistics
   */
  @Get('stats')
  getExamStats(@Headers() headers: Record<string, string>) {
    return this.hodExamsService.getExamStats(
      this.getTenantId(headers),
      this.getUserId(headers),
    );
  }

  /**
   * Get exam by ID
   */
  @Get(':examId')
  getExamById(
    @Headers() headers: Record<string, string>,
    @Param('examId') examId: string,
  ) {
    return this.hodExamsService.getExamById(
      this.getTenantId(headers),
      this.getUserId(headers),
      examId,
    );
  }

  /**
   * Schedule a new exam
   */
  @Post()
  scheduleExam(
    @Headers() headers: Record<string, string>,
    @Body() dto: ScheduleExamDto,
  ) {
    return this.hodExamsService.scheduleExam(
      this.getTenantId(headers),
      this.getUserId(headers),
      dto,
    );
  }

  /**
   * Update an exam
   */
  @Patch(':examId')
  updateExam(
    @Headers() headers: Record<string, string>,
    @Param('examId') examId: string,
    @Body() dto: UpdateExamDto,
  ) {
    return this.hodExamsService.updateExam(
      this.getTenantId(headers),
      this.getUserId(headers),
      examId,
      dto,
    );
  }

  /**
   * Update exam status
   */
  @Patch(':examId/status')
  updateExamStatus(
    @Headers() headers: Record<string, string>,
    @Param('examId') examId: string,
    @Body() dto: UpdateExamStatusDto,
  ) {
    return this.hodExamsService.updateExamStatus(
      this.getTenantId(headers),
      this.getUserId(headers),
      examId,
      dto,
    );
  }

  /**
   * Delete an exam
   */
  @Delete(':examId')
  deleteExam(
    @Headers() headers: Record<string, string>,
    @Param('examId') examId: string,
  ) {
    return this.hodExamsService.deleteExam(
      this.getTenantId(headers),
      this.getUserId(headers),
      examId,
    );
  }
}
