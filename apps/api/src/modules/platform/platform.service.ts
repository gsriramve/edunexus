import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvitationsService } from '../invitations/invitations.service';
import { Prisma } from '@prisma/client';
import {
  CreateTenantDto,
  InvitePrincipalDto,
  ExtendTrialDto,
  TenantQueryDto,
  AuditLogQueryDto,
  PlatformAction,
  TargetType,
} from './dto/platform.dto';

@Injectable()
export class PlatformService {
  constructor(
    private prisma: PrismaService,
    private invitationsService: InvitationsService,
  ) {}

  /**
   * Log a platform-level action for audit trail
   */
  private async logAction(
    action: PlatformAction,
    targetType: TargetType,
    targetId: string,
    performedBy: string,
    performedByEmail: string,
    performedByName: string,
    details?: Prisma.InputJsonValue,
    tenantId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    await this.prisma.platformAuditLog.create({
      data: {
        action,
        targetType,
        targetId,
        performedBy,
        performedByEmail,
        performedByName,
        details: details ?? Prisma.JsonNull,
        tenantId,
        ipAddress,
        userAgent,
      },
    });
  }

  /**
   * List all tenants with optional filters
   */
  async listTenants(query: TenantQueryDto) {
    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { displayName: { contains: query.search, mode: 'insensitive' } },
        { domain: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 50;

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          subscription: true,
        },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    // Get principal info for each tenant
    const tenantsWithPrincipal = await Promise.all(
      tenants.map(async (tenant) => {
        const principal = await this.prisma.user.findFirst({
          where: { tenantId: tenant.id, role: 'principal' },
          select: { id: true, email: true, name: true, status: true },
        });

        const pendingInvitation = await this.prisma.invitation.findFirst({
          where: { tenantId: tenant.id, role: 'principal', status: 'pending' },
          select: { id: true, email: true, expiresAt: true },
        });

        // Calculate trial days remaining
        let trialDaysRemaining: number | null = null;
        if (tenant.status === 'trial' && tenant.trialEndsAt) {
          const now = new Date();
          const diff = tenant.trialEndsAt.getTime() - now.getTime();
          trialDaysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        }

        return {
          ...tenant,
          principal,
          pendingInvitation,
          trialDaysRemaining,
        };
      }),
    );

    return {
      tenants: tenantsWithPrincipal,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single tenant by ID
   */
  async getTenant(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        subscription: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const principal = await this.prisma.user.findFirst({
      where: { tenantId: id, role: 'principal' },
    });

    const pendingInvitation = await this.prisma.invitation.findFirst({
      where: { tenantId: id, role: 'principal', status: 'pending' },
    });

    const stats = await this.getTenantStats(id);

    return {
      ...tenant,
      principal,
      pendingInvitation,
      stats,
    };
  }

  /**
   * Get statistics for a tenant
   */
  async getTenantStats(tenantId: string) {
    const [userCount, studentCount, staffCount, departmentCount] = await Promise.all([
      this.prisma.user.count({ where: { tenantId } }),
      this.prisma.student.count({ where: { tenantId } }),
      this.prisma.staff.count({ where: { tenantId } }),
      this.prisma.department.count({ where: { tenantId } }),
    ]);

    return {
      userCount,
      studentCount,
      staffCount,
      departmentCount,
    };
  }

  /**
   * Create a new tenant with optional principal invitation
   */
  async createTenant(
    dto: CreateTenantDto,
    performedBy: string,
    performedByEmail: string,
    performedByName: string,
  ) {
    // Check if domain already exists
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { domain: dto.domain },
    });

    if (existingTenant) {
      throw new ConflictException('A tenant with this domain already exists');
    }

    // Calculate trial end date (default 15 days)
    const trialDays = dto.trialDays || 15;
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

    // Create tenant
    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.name,
        domain: dto.domain,
        displayName: dto.displayName,
        logo: dto.logo,
        status: 'trial',
        trialEndsAt,
      },
    });

    // Log the action
    await this.logAction(
      PlatformAction.TENANT_CREATED,
      TargetType.TENANT,
      tenant.id,
      performedBy,
      performedByEmail,
      performedByName,
      {
        name: dto.name,
        domain: dto.domain,
        trialDays,
      },
      tenant.id,
    );

    // If principal email provided, send invitation
    if (dto.principalEmail) {
      await this.invitePrincipal(
        tenant.id,
        {
          email: dto.principalEmail,
          name: dto.principalName,
          message: `You have been invited to manage ${dto.displayName} on EduNexus.`,
        },
        performedBy,
        performedByEmail,
        performedByName,
      );
    }

    return tenant;
  }

  /**
   * Invite a principal to a tenant
   */
  async invitePrincipal(
    tenantId: string,
    dto: InvitePrincipalDto,
    performedBy: string,
    performedByEmail: string,
    performedByName: string,
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if principal already exists
    const existingPrincipal = await this.prisma.user.findFirst({
      where: { tenantId, role: 'principal' },
    });

    if (existingPrincipal) {
      throw new ConflictException('This tenant already has a principal');
    }

    // Create invitation
    const invitation = await this.invitationsService.create(
      tenantId,
      {
        email: dto.email,
        role: 'principal',
        message: dto.message || `You have been invited to manage ${tenant.displayName} on EduNexus.`,
      },
      performedBy,
      performedByName,
    );

    // Log the action
    await this.logAction(
      PlatformAction.INVITATION_SENT,
      TargetType.INVITATION,
      invitation.id,
      performedBy,
      performedByEmail,
      performedByName,
      {
        email: dto.email,
        tenantName: tenant.name,
        role: 'principal',
      },
      tenantId,
    );

    // TODO: Send invitation email via notifications service

    return invitation;
  }

  /**
   * Resend an invitation
   */
  async resendInvitation(
    invitationId: string,
    performedBy: string,
    performedByEmail: string,
    performedByName: string,
    message?: string,
  ) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const updatedInvitation = await this.invitationsService.resend(
      invitation.tenantId,
      invitationId,
      message,
    );

    // Log the action
    await this.logAction(
      PlatformAction.INVITATION_RESENT,
      TargetType.INVITATION,
      invitationId,
      performedBy,
      performedByEmail,
      performedByName,
      {
        email: invitation.email,
      },
      invitation.tenantId,
    );

    return updatedInvitation;
  }

  /**
   * Cancel an invitation
   */
  async cancelInvitation(
    invitationId: string,
    performedBy: string,
    performedByEmail: string,
    performedByName: string,
  ) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const cancelledInvitation = await this.invitationsService.cancel(
      invitation.tenantId,
      invitationId,
    );

    // Log the action
    await this.logAction(
      PlatformAction.INVITATION_CANCELLED,
      TargetType.INVITATION,
      invitationId,
      performedBy,
      performedByEmail,
      performedByName,
      {
        email: invitation.email,
      },
      invitation.tenantId,
    );

    return cancelledInvitation;
  }

  /**
   * Extend a tenant's trial period
   */
  async extendTrial(
    tenantId: string,
    dto: ExtendTrialDto,
    performedBy: string,
    performedByEmail: string,
    performedByName: string,
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.status !== 'trial') {
      throw new BadRequestException('Can only extend trial for tenants in trial status');
    }

    const days = dto.days || 15;
    const currentEndDate = tenant.trialEndsAt || new Date();
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + days);

    const updatedTenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        trialEndsAt: newEndDate,
      },
    });

    // Log the action
    await this.logAction(
      PlatformAction.TRIAL_EXTENDED,
      TargetType.TENANT,
      tenantId,
      performedBy,
      performedByEmail,
      performedByName,
      {
        previousEndDate: currentEndDate.toISOString(),
        newEndDate: newEndDate.toISOString(),
        daysAdded: days,
      },
      tenantId,
    );

    return updatedTenant;
  }

  /**
   * Activate a tenant (convert from trial to active)
   */
  async activateTenant(
    tenantId: string,
    performedBy: string,
    performedByEmail: string,
    performedByName: string,
    reason?: string,
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.status === 'active') {
      throw new BadRequestException('Tenant is already active');
    }

    const updatedTenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        status: 'active',
        activatedAt: new Date(),
        trialEndsAt: null,
        suspendedAt: null,
      },
    });

    // Log the action
    await this.logAction(
      PlatformAction.TENANT_ACTIVATED,
      TargetType.TENANT,
      tenantId,
      performedBy,
      performedByEmail,
      performedByName,
      {
        previousStatus: tenant.status,
        reason,
      },
      tenantId,
    );

    return updatedTenant;
  }

  /**
   * Suspend a tenant (block access)
   */
  async suspendTenant(
    tenantId: string,
    performedBy: string,
    performedByEmail: string,
    performedByName: string,
    reason?: string,
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.status === 'suspended') {
      throw new BadRequestException('Tenant is already suspended');
    }

    const updatedTenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        status: 'suspended',
        suspendedAt: new Date(),
      },
    });

    // Log the action
    await this.logAction(
      PlatformAction.TENANT_SUSPENDED,
      TargetType.TENANT,
      tenantId,
      performedBy,
      performedByEmail,
      performedByName,
      {
        previousStatus: tenant.status,
        reason,
      },
      tenantId,
    );

    return updatedTenant;
  }

  /**
   * Reactivate a suspended tenant
   */
  async reactivateTenant(
    tenantId: string,
    performedBy: string,
    performedByEmail: string,
    performedByName: string,
    reason?: string,
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.status !== 'suspended') {
      throw new BadRequestException('Can only reactivate suspended tenants');
    }

    // Determine new status - if it was in trial before, restore trial
    const wasActivated = tenant.activatedAt !== null;
    const newStatus = wasActivated ? 'active' : 'trial';

    const updatedTenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        status: newStatus,
        suspendedAt: null,
      },
    });

    // Log the action
    await this.logAction(
      PlatformAction.TENANT_REACTIVATED,
      TargetType.TENANT,
      tenantId,
      performedBy,
      performedByEmail,
      performedByName,
      {
        previousStatus: 'suspended',
        newStatus,
        reason,
      },
      tenantId,
    );

    return updatedTenant;
  }

  /**
   * Get platform-level audit logs
   */
  async getAuditLogs(query: AuditLogQueryDto) {
    const where: Record<string, unknown> = {};

    if (query.action) {
      where.action = query.action;
    }

    if (query.targetType) {
      where.targetType = query.targetType;
    }

    if (query.targetId) {
      where.targetId = query.targetId;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(query.startDate);
      }
      if (query.endDate) {
        (where.createdAt as Record<string, Date>).lte = new Date(query.endDate);
      }
    }

    const page = query.page || 1;
    const limit = query.limit || 50;

    const [logs, total] = await Promise.all([
      this.prisma.platformAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          tenant: {
            select: { id: true, name: true, displayName: true },
          },
        },
      }),
      this.prisma.platformAuditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get audit logs for a specific tenant
   */
  async getTenantAuditLogs(tenantId: string, query: AuditLogQueryDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.getAuditLogs({
      ...query,
      targetId: tenantId,
    });
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats() {
    const [
      totalTenants,
      trialTenants,
      activeTenants,
      suspendedTenants,
      totalUsers,
      totalStudents,
      pendingInvitations,
    ] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { status: 'trial' } }),
      this.prisma.tenant.count({ where: { status: 'active' } }),
      this.prisma.tenant.count({ where: { status: 'suspended' } }),
      this.prisma.user.count({ where: { tenantId: { not: null } } }),
      this.prisma.student.count(),
      this.prisma.invitation.count({ where: { status: 'pending' } }),
    ]);

    // Get tenants with expiring trials (within 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringTrials = await this.prisma.tenant.count({
      where: {
        status: 'trial',
        trialEndsAt: {
          lte: sevenDaysFromNow,
          gt: new Date(),
        },
      },
    });

    // Get recent activity count (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentActions = await this.prisma.platformAuditLog.count({
      where: {
        createdAt: { gte: oneDayAgo },
      },
    });

    return {
      tenants: {
        total: totalTenants,
        trial: trialTenants,
        active: activeTenants,
        suspended: suspendedTenants,
        expiringTrials,
      },
      users: {
        total: totalUsers,
        students: totalStudents,
      },
      invitations: {
        pending: pendingInvitations,
      },
      activity: {
        last24Hours: recentActions,
      },
    };
  }
}
