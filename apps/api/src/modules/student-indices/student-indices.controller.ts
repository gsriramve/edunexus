import {
  Controller,
  Get,
  Post,
  Put,
  Query,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { StudentIndicesService } from './student-indices.service';
import {
  SgiQueryDto,
  CriQueryDto,
  BulkCalculateSgiDto,
  BulkCalculateCriDto,
  UpdateIndexConfigDto,
} from './dto/student-indices.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('student-indices')
@UseGuards(RolesGuard)
export class StudentIndicesController {
  constructor(private readonly studentIndicesService: StudentIndicesService) {}

  // ============================================
  // SGI Endpoints
  // ============================================

  /**
   * Get SGI for a specific student by ID
   */
  @Get('sgi/:studentId')
  @Roles('student', 'teacher', 'hod', 'principal')
  async getSgi(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Query() query: SgiQueryDto,
  ) {
    return this.studentIndicesService.getSgi(tenantId, studentId, query);
  }

  /**
   * Calculate SGI for a single student
   * Accessible by: hod, principal (manual trigger)
   */
  @Post('sgi/calculate/:studentId')
  @Roles('hod', 'principal')
  @HttpCode(HttpStatus.OK)
  async calculateSgi(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.studentIndicesService.calculateSgi(tenantId, studentId, month, year);
  }

  /**
   * Bulk calculate SGI for a department or batch
   * Accessible by: hod, principal
   */
  @Post('sgi/bulk-calculate')
  @Roles('hod', 'principal')
  @HttpCode(HttpStatus.OK)
  async bulkCalculateSgi(
    @TenantId() tenantId: string,
    @Body() dto: BulkCalculateSgiDto,
  ) {
    return this.studentIndicesService.bulkCalculateSgi(tenantId, dto);
  }

  /**
   * Get SGI statistics for the institution
   * Accessible by: hod, principal
   */
  @Get('sgi-stats')
  @Roles('hod', 'principal')
  async getSgiStats(
    @TenantId() tenantId: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.studentIndicesService.getSgiStats(tenantId, departmentId);
  }

  // ============================================
  // CRI Endpoints
  // ============================================

  /**
   * Get CRI for a specific student by ID
   */
  @Get('cri/:studentId')
  @Roles('student', 'teacher', 'hod', 'principal')
  async getCri(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Query() query: CriQueryDto,
  ) {
    return this.studentIndicesService.getCri(tenantId, studentId, query);
  }

  /**
   * Calculate CRI for a single student
   * Accessible by: hod, principal (manual trigger)
   */
  @Post('cri/calculate/:studentId')
  @Roles('hod', 'principal')
  @HttpCode(HttpStatus.OK)
  async calculateCri(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.studentIndicesService.calculateCri(tenantId, studentId);
  }

  /**
   * Bulk calculate CRI for a department or batch
   * Accessible by: hod, principal
   */
  @Post('cri/bulk-calculate')
  @Roles('hod', 'principal')
  @HttpCode(HttpStatus.OK)
  async bulkCalculateCri(
    @TenantId() tenantId: string,
    @Body() dto: BulkCalculateCriDto,
  ) {
    return this.studentIndicesService.bulkCalculateCri(tenantId, dto);
  }

  /**
   * Get CRI statistics for the institution
   * Accessible by: hod, principal
   */
  @Get('cri-stats')
  @Roles('hod', 'principal')
  async getCriStats(
    @TenantId() tenantId: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.studentIndicesService.getCriStats(tenantId, departmentId);
  }

  // ============================================
  // Configuration Endpoints
  // ============================================

  /**
   * Get index configuration for the tenant
   * Accessible by: hod, principal
   */
  @Get('config')
  @Roles('hod', 'principal')
  async getConfig(@TenantId() tenantId: string) {
    return this.studentIndicesService.getConfig(tenantId);
  }

  /**
   * Update index configuration
   * Accessible by: principal only
   */
  @Put('config')
  @Roles('principal')
  async updateConfig(
    @TenantId() tenantId: string,
    @Body() dto: UpdateIndexConfigDto,
  ) {
    return this.studentIndicesService.updateConfig(tenantId, dto);
  }

  // ============================================
  // Alert Endpoints
  // ============================================

  /**
   * Get students with low SGI scores (alerts)
   * Accessible by: teacher, hod, principal
   */
  @Get('alerts/sgi')
  @Roles('teacher', 'hod', 'principal')
  async getSgiAlerts(
    @TenantId() tenantId: string,
    @Query('departmentId') departmentId?: string,
    @Query('threshold') threshold?: number,
  ) {
    return this.studentIndicesService.getSgiAlerts(tenantId, departmentId, threshold);
  }

  /**
   * Get students with low CRI scores (alerts)
   * Accessible by: teacher, hod, principal
   */
  @Get('alerts/cri')
  @Roles('teacher', 'hod', 'principal')
  async getCriAlerts(
    @TenantId() tenantId: string,
    @Query('departmentId') departmentId?: string,
    @Query('threshold') threshold?: number,
  ) {
    return this.studentIndicesService.getCriAlerts(tenantId, departmentId, threshold);
  }

  // ============================================
  // Dashboard Endpoints
  // ============================================

  /**
   * Get combined dashboard data for a student
   * Returns both SGI and CRI with insights
   */
  @Get('dashboard/:studentId')
  @Roles('student', 'teacher', 'hod', 'principal')
  async getStudentDashboard(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    const [sgiData, criData] = await Promise.all([
      this.studentIndicesService.getSgi(tenantId, studentId, { limit: 12 }).catch(() => null),
      this.studentIndicesService.getCri(tenantId, studentId, { latestOnly: true }).catch(() => null),
    ]);

    // Extract data from responses
    const latestSgi = sgiData && 'history' in sgiData ? sgiData.latest : sgiData;
    const latestCri = criData && 'history' in criData ? criData.latest : criData;

    return {
      studentId,
      sgi: {
        current: latestSgi,
        history: sgiData && 'history' in sgiData ? sgiData.history : [],
        trend: latestSgi?.sgiTrend || 'stable',
      },
      cri: {
        current: latestCri,
        placementProbability: latestCri?.placementProbability || 0,
        salaryBand: latestCri?.salaryBand || 'N/A',
      },
      insights: this.generateCombinedInsights(latestSgi, latestCri),
      lastUpdated: new Date(),
    };
  }

  /**
   * Get department overview with SGI/CRI distribution
   */
  @Get('department/:departmentId')
  @Roles('hod', 'principal')
  async getDepartmentOverview(
    @TenantId() tenantId: string,
    @Param('departmentId') departmentId: string,
  ) {
    const [sgiStats, criStats, sgiAlerts, criAlerts] = await Promise.all([
      this.studentIndicesService.getSgiStats(tenantId, departmentId),
      this.studentIndicesService.getCriStats(tenantId, departmentId),
      this.studentIndicesService.getSgiAlerts(tenantId, departmentId),
      this.studentIndicesService.getCriAlerts(tenantId, departmentId),
    ]);

    return {
      departmentId,
      sgi: sgiStats,
      cri: criStats,
      alerts: {
        sgi: sgiAlerts,
        cri: criAlerts,
      },
      lastUpdated: new Date(),
    };
  }

  /**
   * Generate combined insights from SGI and CRI data
   */
  private generateCombinedInsights(sgi: any, cri: any): string[] {
    const insights: string[] = [];

    if (!sgi && !cri) {
      insights.push('No data available yet. Indices will be calculated once sufficient data is collected.');
      return insights;
    }

    if (sgi) {
      if (sgi.sgiScore >= 80) {
        insights.push('Excellent overall growth trajectory. Keep up the great work!');
      } else if (sgi.sgiScore >= 60) {
        insights.push('Good progress overall. Focus on identified improvement areas.');
      } else if (sgi.sgiScore >= 40) {
        insights.push('Growth is below expectations. Consider seeking guidance from your mentor.');
      } else {
        insights.push('Urgent attention needed. Please connect with your academic advisor immediately.');
      }

      if (sgi.sgiTrend === 'improving') {
        insights.push('Your growth index is trending upward - positive momentum!');
      } else if (sgi.sgiTrend === 'declining') {
        insights.push('Your growth index has been declining. Review recent changes in your routine.');
      }
    }

    if (cri) {
      if (cri.placementProbability >= 80) {
        insights.push('High placement probability. You are well-prepared for campus recruitment.');
      } else if (cri.placementProbability >= 50) {
        insights.push('Moderate placement readiness. Focus on skill gaps to improve chances.');
      } else {
        insights.push('Placement readiness needs improvement. Start working on the action plan.');
      }

      if (cri.skillGaps && Array.isArray(cri.skillGaps) && cri.skillGaps.length > 0) {
        const topGap = cri.skillGaps[0];
        insights.push(`Priority skill gap: ${topGap.skill}. Consider focusing on this area.`);
      }
    }

    return insights;
  }
}
