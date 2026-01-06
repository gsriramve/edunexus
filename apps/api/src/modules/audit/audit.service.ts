import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateAuditLogDto,
  AuditLogQueryDto,
  AuditLogSummaryQueryDto,
  UpdateAuditSettingsDto,
  AuditLogResponse,
  AuditLogListResponse,
  AuditLogStats,
  AuditLogSummaryResponse,
  AuditSettingsResponse,
  EntityActivityResponse,
  UserActivityResponse,
  AuditAction,
  AuditCategory,
  AuditStatus,
} from './dto/audit.dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  // =============================================================================
  // CORE LOGGING
  // =============================================================================

  async log(tenantId: string, dto: CreateAuditLogDto): Promise<AuditLogResponse | null> {
    try {
      // Check if this action should be logged based on settings
      const settings = await this.getSettings(tenantId);

      if (!this.shouldLog(dto, settings)) {
        return null;
      }

      const auditLog = await this.prisma.auditLog.create({
        data: {
          tenantId,
          userId: dto.userId,
          userEmail: dto.userEmail,
          userName: dto.userName,
          userRole: dto.userRole,
          action: dto.action,
          category: dto.category,
          entityType: dto.entityType,
          entityId: dto.entityId,
          entityName: dto.entityName,
          oldValue: dto.oldValue as any,
          newValue: dto.newValue as any,
          changedFields: dto.changedFields || [],
          ipAddress: dto.ipAddress,
          userAgent: dto.userAgent,
          requestMethod: dto.requestMethod,
          requestPath: dto.requestPath,
          requestId: dto.requestId,
          status: dto.status || AuditStatus.SUCCESS,
          errorMessage: dto.errorMessage,
          duration: dto.duration,
          metadata: dto.metadata as any,
        },
      });

      // Update daily summary asynchronously
      this.updateDailySummary(tenantId, dto.action, dto.status || AuditStatus.SUCCESS, dto.userId)
        .catch(err => this.logger.error('Failed to update daily summary', err));

      return this.mapToResponse(auditLog);
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
      // Don't throw - audit logging should not break the main flow
      return null;
    }
  }

  async logBatch(tenantId: string, logs: CreateAuditLogDto[]): Promise<number> {
    try {
      const settings = await this.getSettings(tenantId);
      const filteredLogs = logs.filter(log => this.shouldLog(log, settings));

      if (filteredLogs.length === 0) return 0;

      const result = await this.prisma.auditLog.createMany({
        data: filteredLogs.map(log => ({
          tenantId,
          userId: log.userId,
          userEmail: log.userEmail,
          userName: log.userName,
          userRole: log.userRole,
          action: log.action,
          category: log.category,
          entityType: log.entityType,
          entityId: log.entityId,
          entityName: log.entityName,
          oldValue: log.oldValue as any,
          newValue: log.newValue as any,
          changedFields: log.changedFields || [],
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          requestMethod: log.requestMethod,
          requestPath: log.requestPath,
          requestId: log.requestId,
          status: log.status || AuditStatus.SUCCESS,
          errorMessage: log.errorMessage,
          duration: log.duration,
          metadata: log.metadata as any,
        })),
      });

      return result.count;
    } catch (error) {
      this.logger.error('Failed to create batch audit logs', error);
      return 0;
    }
  }

  // Helper method for easier logging from other services
  async logAction(
    tenantId: string,
    action: AuditAction,
    category: AuditCategory,
    options: {
      userId?: string;
      userEmail?: string;
      userName?: string;
      userRole?: string;
      entityType?: string;
      entityId?: string;
      entityName?: string;
      oldValue?: Record<string, any>;
      newValue?: Record<string, any>;
      metadata?: Record<string, any>;
      ipAddress?: string;
      requestPath?: string;
      status?: AuditStatus;
      errorMessage?: string;
    } = {},
  ): Promise<void> {
    const changedFields = this.calculateChangedFields(options.oldValue, options.newValue);

    await this.log(tenantId, {
      ...options,
      action,
      category,
      changedFields,
    });
  }

  // =============================================================================
  // QUERY METHODS
  // =============================================================================

  async findAll(tenantId: string, query: AuditLogQueryDto): Promise<AuditLogListResponse> {
    const {
      userId,
      action,
      category,
      entityType,
      entityId,
      status,
      startDate,
      endDate,
      search,
      limit = 20,
      offset = 0,
      sortBy = 'timestamp',
      sortOrder = 'desc',
    } = query;

    const where: any = { tenantId };

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (category) where.category = category;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { userName: { contains: search, mode: 'insensitive' } },
        { userEmail: { contains: search, mode: 'insensitive' } },
        { entityName: { contains: search, mode: 'insensitive' } },
        { entityType: { contains: search, mode: 'insensitive' } },
        { requestPath: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs: logs.map(this.mapToResponse),
      total,
      limit,
      offset,
    };
  }

  async findById(tenantId: string, id: string): Promise<AuditLogResponse | null> {
    const log = await this.prisma.auditLog.findFirst({
      where: { id, tenantId },
    });

    return log ? this.mapToResponse(log) : null;
  }

  async getEntityActivity(
    tenantId: string,
    entityType: string,
    entityId: string,
    limit = 50,
  ): Promise<EntityActivityResponse> {
    const [logs, total, firstLog] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId, entityType, entityId },
        orderBy: { timestamp: 'desc' },
        take: limit,
      }),
      this.prisma.auditLog.count({
        where: { tenantId, entityType, entityId },
      }),
      this.prisma.auditLog.findFirst({
        where: { tenantId, entityType, entityId },
        orderBy: { timestamp: 'asc' },
      }),
    ]);

    return {
      entityType,
      entityId,
      entityName: firstLog?.entityName ?? undefined,
      logs: logs.map(this.mapToResponse),
      total,
    };
  }

  async getUserActivity(
    tenantId: string,
    userId: string,
    limit = 50,
  ): Promise<UserActivityResponse> {
    const [logs, total, actionCounts, userInfo] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId, userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
      }),
      this.prisma.auditLog.count({
        where: { tenantId, userId },
      }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where: { tenantId, userId },
        _count: true,
      }),
      this.prisma.auditLog.findFirst({
        where: { tenantId, userId },
        orderBy: { timestamp: 'desc' },
        select: { userName: true, userEmail: true },
      }),
    ]);

    return {
      userId,
      userName: userInfo?.userName ?? undefined,
      userEmail: userInfo?.userEmail ?? undefined,
      logs: logs.map(this.mapToResponse),
      total,
      actionCounts: actionCounts.reduce((acc, item) => {
        acc[item.action] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // =============================================================================
  // STATISTICS
  // =============================================================================

  async getStats(tenantId: string): Promise<AuditLogStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalLogs,
      todayLogs,
      successLogs,
      failureLogs,
      uniqueUsersResult,
      actionCounts,
      categoryCounts,
      entityTypeCounts,
      recentActivity,
    ] = await Promise.all([
      this.prisma.auditLog.count({ where: { tenantId } }),
      this.prisma.auditLog.count({
        where: { tenantId, timestamp: { gte: today } },
      }),
      this.prisma.auditLog.count({
        where: { tenantId, status: 'success' },
      }),
      this.prisma.auditLog.count({
        where: { tenantId, status: 'failure' },
      }),
      this.prisma.auditLog.findMany({
        where: { tenantId, userId: { not: null } },
        distinct: ['userId'],
        select: { userId: true },
      }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.auditLog.groupBy({
        by: ['category'],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.auditLog.groupBy({
        by: ['entityType'],
        where: { tenantId, entityType: { not: null } },
        _count: true,
      }),
      this.prisma.auditLog.findMany({
        where: { tenantId },
        orderBy: { timestamp: 'desc' },
        take: 10,
      }),
    ]);

    return {
      totalLogs,
      todayLogs,
      successLogs,
      failureLogs,
      uniqueUsers: uniqueUsersResult.length,
      actionCounts: actionCounts.reduce((acc, item) => {
        acc[item.action] = item._count;
        return acc;
      }, {} as Record<string, number>),
      categoryCounts: categoryCounts.reduce((acc, item) => {
        acc[item.category] = item._count;
        return acc;
      }, {} as Record<string, number>),
      entityTypeCounts: entityTypeCounts.reduce((acc, item) => {
        if (item.entityType) {
          acc[item.entityType] = item._count;
        }
        return acc;
      }, {} as Record<string, number>),
      recentActivity: recentActivity.map(this.mapToResponse),
    };
  }

  async getSummaries(
    tenantId: string,
    query: AuditLogSummaryQueryDto,
  ): Promise<AuditLogSummaryResponse[]> {
    const { startDate, endDate, days = 30 } = query;

    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      dateFilter = { gte: start, lte: end };
    }

    const summaries = await this.prisma.auditLogSummary.findMany({
      where: {
        tenantId,
        date: dateFilter,
      },
      orderBy: { date: 'asc' },
    });

    return summaries.map(s => ({
      date: s.date,
      createCount: s.createCount,
      updateCount: s.updateCount,
      deleteCount: s.deleteCount,
      viewCount: s.viewCount,
      loginCount: s.loginCount,
      logoutCount: s.logoutCount,
      exportCount: s.exportCount,
      importCount: s.importCount,
      otherCount: s.otherCount,
      successCount: s.successCount,
      failureCount: s.failureCount,
      uniqueUsers: s.uniqueUsers,
      topEntities: s.topEntities as any,
    }));
  }

  // =============================================================================
  // SETTINGS
  // =============================================================================

  async getSettings(tenantId: string): Promise<AuditSettingsResponse> {
    let settings = await this.prisma.auditLogSettings.findUnique({
      where: { tenantId },
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await this.prisma.auditLogSettings.create({
        data: { tenantId },
      });
    }

    return {
      id: settings.id,
      tenantId: settings.tenantId,
      retentionDays: settings.retentionDays,
      logReads: settings.logReads,
      logAuthentication: settings.logAuthentication,
      logDataChanges: settings.logDataChanges,
      logExports: settings.logExports,
      logImports: settings.logImports,
      logSystemEvents: settings.logSystemEvents,
      excludedEntityTypes: settings.excludedEntityTypes,
      excludedActions: settings.excludedActions,
    };
  }

  async updateSettings(
    tenantId: string,
    dto: UpdateAuditSettingsDto,
  ): Promise<AuditSettingsResponse> {
    const settings = await this.prisma.auditLogSettings.upsert({
      where: { tenantId },
      update: {
        ...dto,
      },
      create: {
        tenantId,
        ...dto,
      },
    });

    return {
      id: settings.id,
      tenantId: settings.tenantId,
      retentionDays: settings.retentionDays,
      logReads: settings.logReads,
      logAuthentication: settings.logAuthentication,
      logDataChanges: settings.logDataChanges,
      logExports: settings.logExports,
      logImports: settings.logImports,
      logSystemEvents: settings.logSystemEvents,
      excludedEntityTypes: settings.excludedEntityTypes,
      excludedActions: settings.excludedActions,
    };
  }

  // =============================================================================
  // MAINTENANCE
  // =============================================================================

  async cleanupOldLogs(tenantId: string): Promise<number> {
    const settings = await this.getSettings(tenantId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - settings.retentionDays);

    const result = await this.prisma.auditLog.deleteMany({
      where: {
        tenantId,
        timestamp: { lt: cutoffDate },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old audit logs for tenant ${tenantId}`);
    return result.count;
  }

  async exportLogs(
    tenantId: string,
    query: AuditLogQueryDto,
  ): Promise<AuditLogResponse[]> {
    const result = await this.findAll(tenantId, {
      ...query,
      limit: 10000, // Max export limit
      offset: 0,
    });
    return result.logs;
  }

  // =============================================================================
  // PRIVATE HELPERS
  // =============================================================================

  private shouldLog(dto: CreateAuditLogDto, settings: AuditSettingsResponse): boolean {
    // Check excluded actions
    if (settings.excludedActions.includes(dto.action)) {
      return false;
    }

    // Check excluded entity types
    if (dto.entityType && settings.excludedEntityTypes.includes(dto.entityType)) {
      return false;
    }

    // Check category-specific settings
    const action = dto.action;

    if (action === AuditAction.VIEW && !settings.logReads) {
      return false;
    }

    if ((action === AuditAction.LOGIN || action === AuditAction.LOGOUT) && !settings.logAuthentication) {
      return false;
    }

    if ((action === AuditAction.CREATE || action === AuditAction.UPDATE || action === AuditAction.DELETE) && !settings.logDataChanges) {
      return false;
    }

    if (action === AuditAction.EXPORT && !settings.logExports) {
      return false;
    }

    if (action === AuditAction.IMPORT && !settings.logImports) {
      return false;
    }

    return true;
  }

  private calculateChangedFields(
    oldValue?: Record<string, any>,
    newValue?: Record<string, any>,
  ): string[] {
    if (!oldValue || !newValue) return [];

    const changedFields: string[] = [];
    const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);

    for (const key of allKeys) {
      if (JSON.stringify(oldValue[key]) !== JSON.stringify(newValue[key])) {
        changedFields.push(key);
      }
    }

    return changedFields;
  }

  private async updateDailySummary(
    tenantId: string,
    action: string,
    status: string,
    userId?: string,
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updateData: any = {};

    // Increment action count
    switch (action) {
      case AuditAction.CREATE:
        updateData.createCount = { increment: 1 };
        break;
      case AuditAction.UPDATE:
        updateData.updateCount = { increment: 1 };
        break;
      case AuditAction.DELETE:
        updateData.deleteCount = { increment: 1 };
        break;
      case AuditAction.VIEW:
        updateData.viewCount = { increment: 1 };
        break;
      case AuditAction.LOGIN:
        updateData.loginCount = { increment: 1 };
        break;
      case AuditAction.LOGOUT:
        updateData.logoutCount = { increment: 1 };
        break;
      case AuditAction.EXPORT:
        updateData.exportCount = { increment: 1 };
        break;
      case AuditAction.IMPORT:
        updateData.importCount = { increment: 1 };
        break;
      default:
        updateData.otherCount = { increment: 1 };
    }

    // Increment status count
    if (status === AuditStatus.SUCCESS) {
      updateData.successCount = { increment: 1 };
    } else if (status === AuditStatus.FAILURE) {
      updateData.failureCount = { increment: 1 };
    }

    await this.prisma.auditLogSummary.upsert({
      where: {
        tenantId_date: { tenantId, date: today },
      },
      update: updateData,
      create: {
        tenantId,
        date: today,
        createCount: action === AuditAction.CREATE ? 1 : 0,
        updateCount: action === AuditAction.UPDATE ? 1 : 0,
        deleteCount: action === AuditAction.DELETE ? 1 : 0,
        viewCount: action === AuditAction.VIEW ? 1 : 0,
        loginCount: action === AuditAction.LOGIN ? 1 : 0,
        logoutCount: action === AuditAction.LOGOUT ? 1 : 0,
        exportCount: action === AuditAction.EXPORT ? 1 : 0,
        importCount: action === AuditAction.IMPORT ? 1 : 0,
        otherCount: !['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT'].includes(action) ? 1 : 0,
        successCount: status === AuditStatus.SUCCESS ? 1 : 0,
        failureCount: status === AuditStatus.FAILURE ? 1 : 0,
        uniqueUsers: userId ? 1 : 0,
      },
    });
  }

  private mapToResponse(log: any): AuditLogResponse {
    return {
      id: log.id,
      tenantId: log.tenantId,
      userId: log.userId,
      userEmail: log.userEmail,
      userName: log.userName,
      userRole: log.userRole,
      action: log.action,
      category: log.category,
      entityType: log.entityType,
      entityId: log.entityId,
      entityName: log.entityName,
      oldValue: log.oldValue as Record<string, any>,
      newValue: log.newValue as Record<string, any>,
      changedFields: log.changedFields,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      requestMethod: log.requestMethod,
      requestPath: log.requestPath,
      requestId: log.requestId,
      status: log.status,
      errorMessage: log.errorMessage,
      duration: log.duration,
      metadata: log.metadata as Record<string, any>,
      timestamp: log.timestamp,
    };
  }
}
