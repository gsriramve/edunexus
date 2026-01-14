import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Query,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiGuidanceService } from './ai-guidance.service';
import {
  GuidanceQueryDto,
  GoalQueryDto,
  AlertQueryDto,
  CreateGuidanceDto,
  UpdateGuidanceDto,
  CreateGoalDto,
  UpdateGoalDto,
  CreateAlertDto,
  UpdateAlertDto,
  GenerateRecommendationsDto,
  GenerateMonthlyPlanDto,
  RunAlertDetectionDto,
} from './dto/ai-guidance.dto';
import { TenantId, UserId } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('ai-guidance')
@UseGuards(RolesGuard)
export class AiGuidanceController {
  constructor(private readonly aiGuidanceService: AiGuidanceService) {}

  // ============================================
  // AI Guidance Endpoints
  // ============================================

  /**
   * Get guidance list
   * Students see their own, staff see all
   */
  @Get('guidance')
  @Roles('student', 'teacher', 'hod', 'principal')
  async getGuidance(
    @TenantId() tenantId: string,
    @Query() query: GuidanceQueryDto,
  ) {
    return this.aiGuidanceService.getGuidance(tenantId, query);
  }

  /**
   * Get my guidance (for students)
   */
  @Get('my-guidance')
  @Roles('student')
  async getMyGuidance(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Query() query: GuidanceQueryDto,
  ) {
    // For students, we need to get their studentId from userId
    // For now, pass userId as studentId (should be resolved in service)
    return this.aiGuidanceService.getGuidance(tenantId, { ...query, studentId: userId });
  }

  /**
   * Get single guidance by ID
   */
  @Get('guidance/:id')
  @Roles('student', 'teacher', 'hod', 'principal')
  async getGuidanceById(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.aiGuidanceService.getGuidanceById(tenantId, id);
  }

  /**
   * Create guidance manually (admin/staff)
   */
  @Post('guidance')
  @Roles('teacher', 'hod', 'principal')
  async createGuidance(
    @TenantId() tenantId: string,
    @Body() dto: CreateGuidanceDto,
  ) {
    return this.aiGuidanceService.createGuidance(tenantId, dto);
  }

  /**
   * Update guidance (status, feedback)
   */
  @Put('guidance/:id')
  @Roles('student', 'teacher', 'hod', 'principal')
  async updateGuidance(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGuidanceDto,
    @UserId() userId: string,
  ) {
    return this.aiGuidanceService.updateGuidance(tenantId, id, dto, userId);
  }

  /**
   * Mark guidance as viewed
   */
  @Patch('guidance/:id/view')
  @Roles('student', 'teacher', 'hod', 'principal')
  @HttpCode(HttpStatus.OK)
  async markGuidanceViewed(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.aiGuidanceService.markGuidanceViewed(tenantId, id);
  }

  /**
   * Generate recommendations for a student
   */
  @Post('generate-recommendations')
  @Roles('teacher', 'hod', 'principal')
  @HttpCode(HttpStatus.OK)
  async generateRecommendations(
    @TenantId() tenantId: string,
    @Body() dto: GenerateRecommendationsDto,
  ) {
    return this.aiGuidanceService.generateRecommendations(tenantId, dto);
  }

  /**
   * Generate monthly plan for a student
   */
  @Post('generate-monthly-plan')
  @Roles('student', 'teacher', 'hod', 'principal')
  @HttpCode(HttpStatus.OK)
  async generateMonthlyPlan(
    @TenantId() tenantId: string,
    @Body() dto: GenerateMonthlyPlanDto,
  ) {
    return this.aiGuidanceService.generateMonthlyPlan(tenantId, dto);
  }

  // ============================================
  // Student Goals Endpoints
  // ============================================

  /**
   * Get goals list
   */
  @Get('goals')
  @Roles('student', 'teacher', 'hod', 'principal')
  async getGoals(
    @TenantId() tenantId: string,
    @Query() query: GoalQueryDto,
  ) {
    return this.aiGuidanceService.getGoals(tenantId, query);
  }

  /**
   * Get my goals (for students)
   */
  @Get('my-goals')
  @Roles('student')
  async getMyGoals(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Query() query: GoalQueryDto,
  ) {
    return this.aiGuidanceService.getGoals(tenantId, { ...query, studentId: userId });
  }

  /**
   * Get single goal
   */
  @Get('goals/:id')
  @Roles('student', 'teacher', 'hod', 'principal')
  async getGoalById(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.aiGuidanceService.getGoalById(tenantId, id);
  }

  /**
   * Create goal
   */
  @Post('goals')
  @Roles('student', 'teacher', 'hod', 'principal')
  async createGoal(
    @TenantId() tenantId: string,
    @Body() dto: CreateGoalDto,
    @UserId() userId: string,
  ) {
    return this.aiGuidanceService.createGoal(tenantId, dto, userId);
  }

  /**
   * Update goal
   */
  @Put('goals/:id')
  @Roles('student', 'teacher', 'hod', 'principal')
  async updateGoal(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.aiGuidanceService.updateGoal(tenantId, id, dto);
  }

  /**
   * Delete goal
   */
  @Delete('goals/:id')
  @Roles('student', 'teacher', 'hod', 'principal')
  async deleteGoal(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.aiGuidanceService.deleteGoal(tenantId, id);
  }

  /**
   * Get AI-suggested goals
   */
  @Get('suggest-goals/:studentId')
  @Roles('student', 'teacher', 'hod', 'principal')
  async suggestGoals(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Query('count') count?: number,
  ) {
    return this.aiGuidanceService.suggestGoals(tenantId, studentId, count || 5);
  }

  // ============================================
  // Disengagement Alerts Endpoints
  // ============================================

  /**
   * Get alerts list
   */
  @Get('alerts')
  @Roles('teacher', 'hod', 'principal')
  async getAlerts(
    @TenantId() tenantId: string,
    @Query() query: AlertQueryDto,
  ) {
    return this.aiGuidanceService.getAlerts(tenantId, query);
  }

  /**
   * Get single alert
   */
  @Get('alerts/:id')
  @Roles('teacher', 'hod', 'principal')
  async getAlertById(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.aiGuidanceService.getAlertById(tenantId, id);
  }

  /**
   * Create alert manually
   */
  @Post('alerts')
  @Roles('teacher', 'hod', 'principal')
  async createAlert(
    @TenantId() tenantId: string,
    @Body() dto: CreateAlertDto,
  ) {
    return this.aiGuidanceService.createAlert(tenantId, dto);
  }

  /**
   * Update alert status
   */
  @Put('alerts/:id')
  @Roles('teacher', 'hod', 'principal')
  async updateAlert(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAlertDto,
    @UserId() userId: string,
  ) {
    return this.aiGuidanceService.updateAlert(tenantId, id, dto, userId);
  }

  /**
   * Acknowledge alert
   */
  @Patch('alerts/:id/acknowledge')
  @Roles('teacher', 'hod', 'principal')
  @HttpCode(HttpStatus.OK)
  async acknowledgeAlert(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @UserId() userId: string,
  ) {
    return this.aiGuidanceService.acknowledgeAlert(tenantId, id, userId);
  }

  /**
   * Resolve alert
   */
  @Patch('alerts/:id/resolve')
  @Roles('teacher', 'hod', 'principal')
  @HttpCode(HttpStatus.OK)
  async resolveAlert(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: { resolution: string },
    @UserId() userId: string,
  ) {
    return this.aiGuidanceService.resolveAlert(tenantId, id, body.resolution, userId);
  }

  /**
   * Run alert detection
   */
  @Post('run-detection')
  @Roles('hod', 'principal')
  @HttpCode(HttpStatus.OK)
  async runAlertDetection(
    @TenantId() tenantId: string,
    @Body() dto: RunAlertDetectionDto,
  ) {
    return this.aiGuidanceService.runAlertDetection(tenantId, dto);
  }

  // ============================================
  // Dashboard & Stats Endpoints
  // ============================================

  /**
   * Get student guidance dashboard
   */
  @Get('dashboard/student/:studentId')
  @Roles('student', 'teacher', 'hod', 'principal')
  async getStudentDashboard(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.aiGuidanceService.getStudentDashboard(tenantId, studentId);
  }

  /**
   * Get my dashboard (for students)
   */
  @Get('my-dashboard')
  @Roles('student')
  async getMyDashboard(
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    return this.aiGuidanceService.getStudentDashboard(tenantId, userId);
  }

  /**
   * Get guidance stats
   */
  @Get('stats/guidance')
  @Roles('hod', 'principal')
  async getGuidanceStats(@TenantId() tenantId: string) {
    return this.aiGuidanceService.getGuidanceStats(tenantId);
  }

  /**
   * Get alert stats
   */
  @Get('stats/alerts')
  @Roles('teacher', 'hod', 'principal')
  async getAlertStats(@TenantId() tenantId: string) {
    return this.aiGuidanceService.getAlertStats(tenantId);
  }
}
