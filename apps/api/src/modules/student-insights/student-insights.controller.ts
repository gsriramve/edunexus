import { Controller, Get, Param, Query, Headers } from '@nestjs/common';
import { StudentInsightsService } from './student-insights.service';
import { QuerySubjectPerformanceDto } from './dto/student-insights.dto';

@Controller('student-insights')
export class StudentInsightsController {
  constructor(private readonly studentInsightsService: StudentInsightsService) {}

  /**
   * Get complete insights dashboard data
   */
  @Get(':studentId')
  async getInsightsDashboard(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.studentInsightsService.getInsightsDashboard(tenantId, studentId);
  }

  /**
   * Get performance statistics
   */
  @Get(':studentId/stats')
  async getPerformanceStats(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.studentInsightsService.getPerformanceStats(tenantId, studentId);
  }

  /**
   * Get subject-wise performance
   */
  @Get(':studentId/subjects')
  async getSubjectPerformance(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
    @Query() query: QuerySubjectPerformanceDto,
  ) {
    return this.studentInsightsService.getSubjectPerformance(tenantId, studentId, query);
  }

  /**
   * Get AI recommendations
   */
  @Get(':studentId/recommendations')
  async getRecommendations(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.studentInsightsService.getRecommendations(tenantId, studentId);
  }

  /**
   * Get learning patterns
   */
  @Get(':studentId/patterns')
  async getLearningPatterns(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.studentInsightsService.getLearningPatterns(tenantId, studentId);
  }

  /**
   * Get weekly progress
   */
  @Get(':studentId/progress')
  async getWeeklyProgress(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.studentInsightsService.getWeeklyProgress(tenantId, studentId);
  }
}
