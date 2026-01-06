import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import {
  CreateAuditLogDto,
  AuditLogQueryDto,
  AuditLogSummaryQueryDto,
  UpdateAuditSettingsDto,
} from './dto/audit.dto';
import { SkipAudit } from './audit.interceptor';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  private getTenantId(headers: Record<string, string>): string {
    const tenantId = headers['x-tenant-id'];
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    return tenantId;
  }

  // =============================================================================
  // AUDIT LOGS
  // =============================================================================

  @Post('log')
  @SkipAudit()
  createLog(
    @Headers() headers: Record<string, string>,
    @Body() dto: CreateAuditLogDto,
  ) {
    return this.auditService.log(this.getTenantId(headers), dto);
  }

  @Get('logs')
  @SkipAudit()
  findAllLogs(
    @Headers() headers: Record<string, string>,
    @Query() query: AuditLogQueryDto,
  ) {
    return this.auditService.findAll(this.getTenantId(headers), query);
  }

  @Get('logs/:id')
  @SkipAudit()
  findLogById(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    return this.auditService.findById(this.getTenantId(headers), id);
  }

  // =============================================================================
  // STATISTICS & SUMMARIES
  // =============================================================================

  @Get('stats')
  @SkipAudit()
  getStats(@Headers() headers: Record<string, string>) {
    return this.auditService.getStats(this.getTenantId(headers));
  }

  @Get('summaries')
  @SkipAudit()
  getSummaries(
    @Headers() headers: Record<string, string>,
    @Query() query: AuditLogSummaryQueryDto,
  ) {
    return this.auditService.getSummaries(this.getTenantId(headers), query);
  }

  // =============================================================================
  // ENTITY & USER ACTIVITY
  // =============================================================================

  @Get('entity/:entityType/:entityId')
  @SkipAudit()
  getEntityActivity(
    @Headers() headers: Record<string, string>,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.getEntityActivity(
      this.getTenantId(headers),
      entityType,
      entityId,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('user/:userId')
  @SkipAudit()
  getUserActivity(
    @Headers() headers: Record<string, string>,
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.getUserActivity(
      this.getTenantId(headers),
      userId,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  // =============================================================================
  // SETTINGS
  // =============================================================================

  @Get('settings')
  @SkipAudit()
  getSettings(@Headers() headers: Record<string, string>) {
    return this.auditService.getSettings(this.getTenantId(headers));
  }

  @Patch('settings')
  @SkipAudit()
  updateSettings(
    @Headers() headers: Record<string, string>,
    @Body() dto: UpdateAuditSettingsDto,
  ) {
    return this.auditService.updateSettings(this.getTenantId(headers), dto);
  }

  // =============================================================================
  // EXPORT & MAINTENANCE
  // =============================================================================

  @Get('export')
  @SkipAudit()
  exportLogs(
    @Headers() headers: Record<string, string>,
    @Query() query: AuditLogQueryDto,
  ) {
    return this.auditService.exportLogs(this.getTenantId(headers), query);
  }

  @Post('cleanup')
  @SkipAudit()
  cleanupOldLogs(@Headers() headers: Record<string, string>) {
    return this.auditService.cleanupOldLogs(this.getTenantId(headers));
  }

  // =============================================================================
  // QUICK FILTERS (convenience endpoints)
  // =============================================================================

  @Get('recent')
  @SkipAudit()
  getRecentLogs(
    @Headers() headers: Record<string, string>,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.findAll(this.getTenantId(headers), {
      limit: limit ? parseInt(limit, 10) : 20,
      sortBy: 'timestamp',
      sortOrder: 'desc',
    });
  }

  @Get('failures')
  @SkipAudit()
  getFailures(
    @Headers() headers: Record<string, string>,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.findAll(this.getTenantId(headers), {
      status: 'failure' as any,
      limit: limit ? parseInt(limit, 10) : 20,
      sortBy: 'timestamp',
      sortOrder: 'desc',
    });
  }

  @Get('logins')
  @SkipAudit()
  getLogins(
    @Headers() headers: Record<string, string>,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.findAll(this.getTenantId(headers), {
      action: 'LOGIN' as any,
      limit: limit ? parseInt(limit, 10) : 20,
      sortBy: 'timestamp',
      sortOrder: 'desc',
    });
  }

  @Get('data-changes')
  @SkipAudit()
  getDataChanges(
    @Headers() headers: Record<string, string>,
    @Query() query: AuditLogQueryDto,
  ) {
    // Filter to only show CREATE, UPDATE, DELETE actions
    return this.auditService.findAll(this.getTenantId(headers), {
      ...query,
      // This will be handled in the service with OR conditions if needed
    });
  }
}
