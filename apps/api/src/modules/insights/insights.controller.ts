import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InsightsService } from './insights.service';
import {
  EarlyWarningQueryDto,
  DailyFocusQueryDto,
  PulseQueryDto,
  SilentStrugglersQueryDto,
  FeeRiskQueryDto,
  TenantHealthQueryDto,
  CareerPathQueryDto,
  ImpactStoryQueryDto,
  EquipmentRiskQueryDto,
} from './dto/insights.dto';
import { TenantId, UserId } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('insights')
@UseGuards(RolesGuard)
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  // ============================================
  // Parent Endpoints
  // ============================================

  /**
   * Get early warning alert for a child (parent-friendly view)
   */
  @Get('parent/early-warning/:studentId')
  @Roles('parent')
  async getParentEarlyWarning(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.insightsService.getParentEarlyWarning(tenantId, studentId);
  }

  // ============================================
  // Teacher Endpoints
  // ============================================

  /**
   * Get daily focus list (students at risk) for a teacher
   */
  @Get('teacher/daily-focus')
  @Roles('teacher')
  async getTeacherDailyFocus(
    @TenantId() tenantId: string,
    @UserId() teacherId: string,
    @Query() query: DailyFocusQueryDto,
  ) {
    return this.insightsService.getTeacherDailyFocus(
      tenantId,
      teacherId,
      query.subjectId,
      query.limit || 10,
    );
  }

  // ============================================
  // Principal Endpoints
  // ============================================

  /**
   * Get institutional pulse score
   */
  @Get('principal/pulse')
  @Roles('principal')
  async getPrincipalPulse(
    @TenantId() tenantId: string,
    @Query() query: PulseQueryDto,
  ) {
    return this.insightsService.getPrincipalPulse(
      tenantId,
      query.departmentId,
      query.includeHistory || false,
    );
  }

  // ============================================
  // HOD Endpoints
  // ============================================

  /**
   * Get silent strugglers in department
   */
  @Get('hod/silent-strugglers/:departmentId')
  @Roles('hod')
  async getHODSilentStrugglers(
    @TenantId() tenantId: string,
    @Param('departmentId') departmentId: string,
    @Query() query: SilentStrugglersQueryDto,
  ) {
    return this.insightsService.getHODSilentStrugglers(
      tenantId,
      departmentId,
      query.limit || 20,
      query.subjectId,
    );
  }

  // ============================================
  // Admin Staff Endpoints
  // ============================================

  /**
   * Get fee default risk predictions
   */
  @Get('admin/fee-risk')
  @Roles('admin_staff')
  async getAdminFeeRisk(
    @TenantId() tenantId: string,
    @Query() query: FeeRiskQueryDto,
  ) {
    return this.insightsService.getAdminFeeRisk(
      tenantId,
      query.minRiskScore || 50,
      query.limit || 20,
      query.departmentId,
    );
  }

  // ============================================
  // Platform Owner Endpoints
  // ============================================

  /**
   * Get tenant health overview (platform owner only)
   */
  @Get('platform/tenant-health')
  @Roles('platform_owner')
  async getPlatformTenantHealth(@Query() query: TenantHealthQueryDto) {
    return this.insightsService.getPlatformTenantHealth(
      query.tenantId,
      query.includeChurnRisk ?? true,
    );
  }

  // ============================================
  // Student Endpoints
  // ============================================

  /**
   * Get career path visualization for a student
   */
  @Get('student/career-path/:studentId')
  @Roles('student')
  async getStudentCareerPath(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.insightsService.getStudentCareerPath(tenantId, studentId);
  }

  // ============================================
  // Alumni Endpoints
  // ============================================

  /**
   * Get impact story for an alumni
   */
  @Get('alumni/impact-story/:alumniId')
  @Roles('alumni')
  async getAlumniImpactStory(
    @TenantId() tenantId: string,
    @Param('alumniId') alumniId: string,
  ) {
    return this.insightsService.getAlumniImpactStory(tenantId, alumniId);
  }

  // ============================================
  // Lab Assistant Endpoints
  // ============================================

  /**
   * Get equipment failure risk predictions
   */
  @Get('lab-assistant/equipment-risk')
  @Roles('lab_assistant')
  async getLabEquipmentRisk(
    @TenantId() tenantId: string,
    @Query() query: EquipmentRiskQueryDto,
  ) {
    return this.insightsService.getLabEquipmentRisk(
      tenantId,
      query.labId,
      query.minRiskScore || 50,
    );
  }
}
