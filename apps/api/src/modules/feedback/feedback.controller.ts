import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Query,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import {
  CreateFeedbackCycleDto,
  UpdateFeedbackCycleDto,
  FeedbackCycleQueryDto,
  SubmitFeedbackDto,
  FeedbackEntryQueryDto,
  FeedbackSummaryQueryDto,
  AssignFeedbackDto,
  ProcessCycleDto,
} from './dto/feedback.dto';
import { TenantId, UserId } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('feedback')
@UseGuards(RolesGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // ============================================
  // Feedback Cycle Endpoints
  // ============================================

  /**
   * Create a new feedback cycle
   * Accessible by: hod, principal
   */
  @Post('cycles')
  @Roles('hod', 'principal')
  async createCycle(
    @TenantId() tenantId: string,
    @Body() dto: CreateFeedbackCycleDto,
  ) {
    return this.feedbackService.createCycle(tenantId, dto);
  }

  /**
   * Get feedback cycles
   * Accessible by: teacher, hod, principal
   */
  @Get('cycles')
  @Roles('teacher', 'hod', 'principal')
  async getCycles(
    @TenantId() tenantId: string,
    @Query() query: FeedbackCycleQueryDto,
  ) {
    return this.feedbackService.getCycles(tenantId, query);
  }

  /**
   * Get a single feedback cycle
   */
  @Get('cycles/:cycleId')
  @Roles('teacher', 'hod', 'principal')
  async getCycle(
    @TenantId() tenantId: string,
    @Param('cycleId') cycleId: string,
  ) {
    return this.feedbackService.getCycle(tenantId, cycleId);
  }

  /**
   * Update a feedback cycle
   */
  @Put('cycles/:cycleId')
  @Roles('hod', 'principal')
  async updateCycle(
    @TenantId() tenantId: string,
    @Param('cycleId') cycleId: string,
    @Body() dto: UpdateFeedbackCycleDto,
  ) {
    return this.feedbackService.updateCycle(tenantId, cycleId, dto);
  }

  /**
   * Activate a feedback cycle
   */
  @Patch('cycles/:cycleId/activate')
  @Roles('hod', 'principal')
  @HttpCode(HttpStatus.OK)
  async activateCycle(
    @TenantId() tenantId: string,
    @Param('cycleId') cycleId: string,
  ) {
    return this.feedbackService.activateCycle(tenantId, cycleId);
  }

  /**
   * Close a feedback cycle
   */
  @Patch('cycles/:cycleId/close')
  @Roles('hod', 'principal')
  @HttpCode(HttpStatus.OK)
  async closeCycle(
    @TenantId() tenantId: string,
    @Param('cycleId') cycleId: string,
  ) {
    return this.feedbackService.closeCycle(tenantId, cycleId);
  }

  /**
   * Process a closed cycle (generate summaries)
   */
  @Post('cycles/:cycleId/process')
  @Roles('hod', 'principal')
  @HttpCode(HttpStatus.OK)
  async processCycle(
    @TenantId() tenantId: string,
    @Param('cycleId') cycleId: string,
    @Body() dto: Partial<ProcessCycleDto>,
  ) {
    return this.feedbackService.processCycle(tenantId, {
      cycleId,
      generateSummaries: dto.generateSummaries ?? true,
      calculateNormalization: dto.calculateNormalization ?? true,
    });
  }

  // ============================================
  // Feedback Assignment Endpoints
  // ============================================

  /**
   * Assign feedback (create feedback requests)
   */
  @Post('assign')
  @Roles('hod', 'principal')
  async assignFeedback(
    @TenantId() tenantId: string,
    @Body() dto: AssignFeedbackDto,
  ) {
    return this.feedbackService.assignFeedback(tenantId, dto);
  }

  // ============================================
  // Feedback Entry Endpoints
  // ============================================

  /**
   * Submit feedback for a student
   * Accessible by: teacher, student (for peer/self)
   */
  @Post('cycles/:cycleId/submit')
  @Roles('teacher', 'hod', 'principal', 'student')
  @HttpCode(HttpStatus.OK)
  async submitFeedback(
    @TenantId() tenantId: string,
    @Param('cycleId') cycleId: string,
    @Body() dto: SubmitFeedbackDto,
    @UserId() userId: string,
  ) {
    return this.feedbackService.submitFeedback(tenantId, cycleId, dto, userId);
  }

  /**
   * Get feedback entries
   */
  @Get('entries')
  @Roles('teacher', 'hod', 'principal')
  async getEntries(
    @TenantId() tenantId: string,
    @Query() query: FeedbackEntryQueryDto,
  ) {
    return this.feedbackService.getEntries(tenantId, query);
  }

  /**
   * Get entries for a specific cycle
   */
  @Get('cycles/:cycleId/entries')
  @Roles('teacher', 'hod', 'principal')
  async getCycleEntries(
    @TenantId() tenantId: string,
    @Param('cycleId') cycleId: string,
    @Query() query: FeedbackEntryQueryDto,
  ) {
    return this.feedbackService.getEntries(tenantId, { ...query, cycleId });
  }

  /**
   * Get pending feedback for the current user
   */
  @Get('pending')
  @Roles('teacher', 'hod', 'principal', 'student')
  async getPendingFeedback(
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    return this.feedbackService.getPendingFeedback(tenantId, userId);
  }

  // ============================================
  // Feedback Summary Endpoints
  // ============================================

  /**
   * Get feedback summaries
   */
  @Get('summaries')
  @Roles('teacher', 'hod', 'principal')
  async getSummaries(
    @TenantId() tenantId: string,
    @Query() query: FeedbackSummaryQueryDto,
  ) {
    return this.feedbackService.getSummaries(tenantId, query);
  }

  /**
   * Get feedback summary for a student
   */
  @Get('summaries/student/:studentId')
  @Roles('student', 'teacher', 'hod', 'principal')
  async getStudentSummary(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Query('cycleId') cycleId?: string,
  ) {
    return this.feedbackService.getStudentSummary(tenantId, studentId, cycleId);
  }

  /**
   * Get my feedback summary (for students)
   */
  @Get('my-summary')
  @Roles('student')
  async getMySummary(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Query('cycleId') cycleId?: string,
  ) {
    // Need to get studentId from userId
    // For now, assume userId can be used as evaluatorId to look up student
    return this.feedbackService.getStudentSummary(tenantId, userId, cycleId);
  }

  // ============================================
  // Statistics Endpoints
  // ============================================

  /**
   * Get feedback statistics
   */
  @Get('stats')
  @Roles('teacher', 'hod', 'principal')
  async getStats(@TenantId() tenantId: string) {
    return this.feedbackService.getStats(tenantId);
  }

  /**
   * Get evaluator bias report
   */
  @Get('bias-report')
  @Roles('hod', 'principal')
  async getBiasReport(@TenantId() tenantId: string) {
    return this.feedbackService.getBiasReport(tenantId);
  }

  // ============================================
  // Dashboard Endpoints
  // ============================================

  /**
   * Get feedback dashboard data
   * Combined stats for HoD/Principal view
   */
  @Get('dashboard')
  @Roles('hod', 'principal')
  async getDashboard(
    @TenantId() tenantId: string,
    @Query('departmentId') departmentId?: string,
  ) {
    const [stats, cycles, summaries] = await Promise.all([
      this.feedbackService.getStats(tenantId),
      this.feedbackService.getCycles(tenantId, { limit: 5 }),
      this.feedbackService.getSummaries(tenantId, { departmentId }),
    ]);

    // Calculate department averages
    const departmentAverages = summaries.reduce((acc, s) => {
      const dept = s.studentName || 'Unknown';
      if (!acc[dept]) {
        acc[dept] = { total: 0, count: 0 };
      }
      if (s.overallScore) {
        acc[dept].total += s.overallScore;
        acc[dept].count++;
      }
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return {
      stats,
      recentCycles: cycles.data,
      summaryCount: summaries.length,
      averageOverallScore: summaries.length > 0
        ? Math.round(
            (summaries
              .map(s => s.overallScore)
              .filter((s): s is number => s !== null)
              .reduce((a, b) => a + b, 0) / summaries.length) * 100
          ) / 100
        : null,
    };
  }
}
