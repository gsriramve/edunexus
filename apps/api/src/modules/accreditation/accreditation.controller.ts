import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId, UserId } from '../../common/decorators/tenant.decorator';
import { AccreditationService } from './accreditation.service';
import { FrameworkCalculatorService } from './framework-calculator.service';
import {
  Framework,
  CreateMetricDto,
  UpdateMetricDto,
  QueryMetricsDto,
  CreateValueDto,
  UpdateValueDto,
  BulkUpdateValuesDto,
  QueryValuesDto,
  CreateReportDto,
  UpdateReportDto,
  QueryReportsDto,
  CalculateFrameworkDto,
  CalculateCategoryDto,
  SeedFrameworkDto,
} from './dto/accreditation.dto';

@Controller('accreditation')
@UseGuards(RolesGuard)
export class AccreditationController {
  constructor(
    private readonly accreditationService: AccreditationService,
    private readonly calculatorService: FrameworkCalculatorService,
  ) {}

  // ============ METRICS ============

  @Post('metrics')
  @Roles('platform_owner', 'principal', 'hod')
  async createMetric(
    @TenantId() tenantId: string,
    @Body() dto: CreateMetricDto,
  ) {
    return this.accreditationService.createMetric(tenantId, dto);
  }

  @Get('metrics')
  @Roles('platform_owner', 'principal', 'hod', 'teacher')
  async getMetrics(
    @TenantId() tenantId: string,
    @Query() query: QueryMetricsDto,
  ) {
    return this.accreditationService.queryMetrics(tenantId, query);
  }

  @Get('metrics/:id')
  @Roles('platform_owner', 'principal', 'hod', 'teacher')
  async getMetric(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.accreditationService.getMetric(tenantId, id);
  }

  @Put('metrics/:id')
  @Roles('platform_owner', 'principal', 'hod')
  async updateMetric(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMetricDto,
  ) {
    return this.accreditationService.updateMetric(tenantId, id, dto);
  }

  @Delete('metrics/:id')
  @Roles('platform_owner', 'principal')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMetric(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.accreditationService.deleteMetric(tenantId, id);
  }

  // ============ VALUES ============

  @Post('values')
  @Roles('platform_owner', 'principal', 'hod')
  async createValue(
    @TenantId() tenantId: string,
    @Body() dto: CreateValueDto,
  ) {
    return this.accreditationService.createValue(tenantId, dto);
  }

  @Get('values')
  @Roles('platform_owner', 'principal', 'hod', 'teacher')
  async getValues(@TenantId() tenantId: string, @Query() query: QueryValuesDto) {
    return this.accreditationService.queryValues(tenantId, query);
  }

  @Put('values/:id')
  @Roles('platform_owner', 'principal', 'hod')
  async updateValue(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateValueDto,
  ) {
    return this.accreditationService.updateValue(tenantId, id, dto);
  }

  @Post('values/bulk')
  @Roles('platform_owner', 'principal', 'hod')
  async bulkUpdateValues(
    @TenantId() tenantId: string,
    @Body() dto: BulkUpdateValuesDto,
  ) {
    return this.accreditationService.bulkUpdateValues(tenantId, dto);
  }

  @Post('values/:id/verify')
  @Roles('platform_owner', 'principal')
  async verifyValue(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @UserId() userId: string,
  ) {
    return this.accreditationService.verifyValue(tenantId, id, userId);
  }

  // ============ REPORTS ============

  @Post('reports')
  @Roles('platform_owner', 'principal')
  async createReport(
    @TenantId() tenantId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.accreditationService.createReport(tenantId, dto);
  }

  @Get('reports')
  @Roles('platform_owner', 'principal', 'hod')
  async getReports(
    @TenantId() tenantId: string,
    @Query() query: QueryReportsDto,
  ) {
    return this.accreditationService.queryReports(tenantId, query);
  }

  @Get('reports/:id')
  @Roles('platform_owner', 'principal', 'hod')
  async getReport(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.accreditationService.getReport(tenantId, id);
  }

  @Put('reports/:id')
  @Roles('platform_owner', 'principal')
  async updateReport(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateReportDto,
  ) {
    return this.accreditationService.updateReport(tenantId, id, dto);
  }

  @Post('reports/:id/submit')
  @Roles('platform_owner', 'principal')
  async submitReport(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @UserId() userId: string,
  ) {
    return this.accreditationService.submitReport(tenantId, id, userId);
  }

  @Delete('reports/:id')
  @Roles('platform_owner', 'principal')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReport(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.accreditationService.deleteReport(tenantId, id);
  }

  // ============ ANALYTICS & DASHBOARD ============

  @Get('dashboard')
  @Roles('platform_owner', 'principal', 'hod')
  async getDashboard(
    @TenantId() tenantId: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.accreditationService.getDashboard(tenantId, academicYear);
  }

  @Get('framework/:framework/summary')
  @Roles('platform_owner', 'principal', 'hod', 'teacher')
  async getFrameworkSummary(
    @TenantId() tenantId: string,
    @Param('framework') framework: Framework,
    @Query('academicYear') academicYear: string,
  ) {
    return this.accreditationService.getFrameworkSummary(
      tenantId,
      framework,
      academicYear,
    );
  }

  @Get('framework/:framework/data-status')
  @Roles('platform_owner', 'principal', 'hod')
  async getDataCollectionStatus(
    @TenantId() tenantId: string,
    @Param('framework') framework: Framework,
    @Query('academicYear') academicYear: string,
  ) {
    return this.accreditationService.getDataCollectionStatus(
      tenantId,
      framework,
      academicYear,
    );
  }

  @Get('compare')
  @Roles('platform_owner', 'principal', 'hod')
  async compareYears(
    @TenantId() tenantId: string,
    @Query('framework') framework: Framework,
    @Query('year1') year1: string,
    @Query('year2') year2: string,
  ) {
    return this.accreditationService.compareYears(
      tenantId,
      framework,
      year1,
      year2,
    );
  }

  // ============ CALCULATION & SEEDING ============

  @Post('seed')
  @Roles('platform_owner', 'principal')
  async seedFramework(
    @TenantId() tenantId: string,
    @Body() dto: SeedFrameworkDto,
  ) {
    switch (dto.framework) {
      case Framework.NBA:
        return this.calculatorService.seedNbaMetrics(tenantId, dto.overwrite);
      case Framework.NAAC:
        return this.calculatorService.seedNaacMetrics(tenantId, dto.overwrite);
      case Framework.NIRF:
        return this.calculatorService.seedNirfMetrics(tenantId, dto.overwrite);
      default:
        throw new Error(`Unknown framework: ${dto.framework}`);
    }
  }

  @Post('seed/all')
  @Roles('platform_owner', 'principal')
  async seedAllFrameworks(
    @TenantId() tenantId: string,
    @Query('overwrite') overwrite: boolean = false,
  ) {
    const nba = await this.calculatorService.seedNbaMetrics(tenantId, overwrite);
    const naac = await this.calculatorService.seedNaacMetrics(tenantId, overwrite);
    const nirf = await this.calculatorService.seedNirfMetrics(tenantId, overwrite);

    return {
      seeded: {
        nba: nba.total,
        naac: naac.total,
        nirf: nirf.total,
        total: nba.total + naac.total + nirf.total,
      },
    };
  }

  @Post('calculate')
  @Roles('platform_owner', 'principal', 'hod')
  async calculateFramework(
    @TenantId() tenantId: string,
    @Body() dto: CalculateFrameworkDto,
  ) {
    const results = await this.calculatorService.calculateMetricsFromData(
      tenantId,
      dto.framework,
      dto.academicYear,
    );

    // Get updated summary
    const summary = await this.accreditationService.getFrameworkSummary(
      tenantId,
      dto.framework,
      dto.academicYear,
    );

    return {
      calculatedMetrics: results.calculated,
      failedMetrics: results.failed,
      errors: results.errors,
      summary,
    };
  }

  @Post('calculate/category')
  @Roles('platform_owner', 'principal', 'hod')
  async calculateCategory(
    @TenantId() tenantId: string,
    @Body() dto: CalculateCategoryDto,
  ) {
    // Calculate only metrics for the specified category
    const allResults = await this.calculatorService.calculateMetricsFromData(
      tenantId,
      dto.framework,
      dto.academicYear,
    );

    return {
      calculatedMetrics: allResults.calculated,
      failedMetrics: allResults.failed,
      category: dto.category,
    };
  }

  // ============ FRAMEWORK-SPECIFIC ENDPOINTS ============

  @Get('nba/summary')
  @Roles('platform_owner', 'principal', 'hod', 'teacher')
  async getNbaSummary(
    @TenantId() tenantId: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.accreditationService.getFrameworkSummary(
      tenantId,
      Framework.NBA,
      academicYear,
    );
  }

  @Get('naac/summary')
  @Roles('platform_owner', 'principal', 'hod', 'teacher')
  async getNaacSummary(
    @TenantId() tenantId: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.accreditationService.getFrameworkSummary(
      tenantId,
      Framework.NAAC,
      academicYear,
    );
  }

  @Get('nirf/summary')
  @Roles('platform_owner', 'principal', 'hod', 'teacher')
  async getNirfSummary(
    @TenantId() tenantId: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.accreditationService.getFrameworkSummary(
      tenantId,
      Framework.NIRF,
      academicYear,
    );
  }

  // ============ EXPORT ============

  @Get('reports/:id/export')
  @Roles('platform_owner', 'principal')
  async exportReport(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Query('format') format: 'pdf' | 'excel' = 'pdf',
  ) {
    // Get report with all data
    const report = await this.accreditationService.getReport(tenantId, id);
    const summary = await this.accreditationService.getFrameworkSummary(
      tenantId,
      report.framework as Framework,
      report.academicYear,
    );

    // For now, return data that can be used for export
    // In production, this would generate actual PDF/Excel
    return {
      report,
      summary,
      format,
      exportedAt: new Date().toISOString(),
    };
  }
}
