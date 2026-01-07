import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PlatformService } from './platform.service';
import {
  CreateTenantDto,
  InvitePrincipalDto,
  ExtendTrialDto,
  UpdateTenantStatusDto,
  TenantQueryDto,
  AuditLogQueryDto,
} from './dto/platform.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

interface RequestWithUser {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  ip?: string;
  headers?: {
    'user-agent'?: string;
  };
}

/**
 * Platform Controller
 *
 * Manages platform-level operations (Super Admin only):
 * - Tenant management (create, list, activate, suspend)
 * - Trial management (extend, expire)
 * - Principal invitations
 * - Platform audit logs
 */
@Controller('platform')
@UseGuards(RolesGuard)
@Roles('platform_owner')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  // ====================
  // STATISTICS
  // ====================

  /**
   * Get platform-wide statistics
   */
  @Get('stats')
  async getStats() {
    return this.platformService.getPlatformStats();
  }

  // ====================
  // TENANT MANAGEMENT
  // ====================

  /**
   * List all tenants with pagination and filters
   */
  @Get('tenants')
  async listTenants(@Query() query: TenantQueryDto) {
    return this.platformService.listTenants(query);
  }

  /**
   * Get a single tenant by ID
   */
  @Get('tenants/:id')
  async getTenant(@Param('id') id: string) {
    return this.platformService.getTenant(id);
  }

  /**
   * Create a new tenant
   */
  @Post('tenants')
  async createTenant(
    @Body() dto: CreateTenantDto,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    return this.platformService.createTenant(
      dto,
      user?.id || 'system',
      user?.email || 'system',
      user?.name || 'System',
    );
  }

  /**
   * Extend a tenant's trial period
   */
  @Patch('tenants/:id/extend-trial')
  async extendTrial(
    @Param('id') id: string,
    @Body() dto: ExtendTrialDto,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    return this.platformService.extendTrial(
      id,
      dto,
      user?.id || 'system',
      user?.email || 'system',
      user?.name || 'System',
    );
  }

  /**
   * Activate a tenant (convert from trial to active)
   */
  @Patch('tenants/:id/activate')
  async activateTenant(
    @Param('id') id: string,
    @Body() dto: UpdateTenantStatusDto,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    return this.platformService.activateTenant(
      id,
      user?.id || 'system',
      user?.email || 'system',
      user?.name || 'System',
      dto.reason,
    );
  }

  /**
   * Suspend a tenant (block access)
   */
  @Patch('tenants/:id/suspend')
  async suspendTenant(
    @Param('id') id: string,
    @Body() dto: UpdateTenantStatusDto,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    return this.platformService.suspendTenant(
      id,
      user?.id || 'system',
      user?.email || 'system',
      user?.name || 'System',
      dto.reason,
    );
  }

  /**
   * Reactivate a suspended tenant
   */
  @Patch('tenants/:id/reactivate')
  async reactivateTenant(
    @Param('id') id: string,
    @Body() dto: UpdateTenantStatusDto,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    return this.platformService.reactivateTenant(
      id,
      user?.id || 'system',
      user?.email || 'system',
      user?.name || 'System',
      dto.reason,
    );
  }

  // ====================
  // INVITATION MANAGEMENT
  // ====================

  /**
   * Send principal invitation to a tenant
   */
  @Post('tenants/:id/invite-principal')
  async invitePrincipal(
    @Param('id') id: string,
    @Body() dto: InvitePrincipalDto,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    return this.platformService.invitePrincipal(
      id,
      dto,
      user?.id || 'system',
      user?.email || 'system',
      user?.name || 'System',
    );
  }

  /**
   * Resend an invitation
   */
  @Post('invitations/:id/resend')
  async resendInvitation(
    @Param('id') id: string,
    @Body() body: { message?: string },
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    return this.platformService.resendInvitation(
      id,
      user?.id || 'system',
      user?.email || 'system',
      user?.name || 'System',
      body.message,
    );
  }

  /**
   * Cancel an invitation
   */
  @Delete('invitations/:id')
  async cancelInvitation(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    return this.platformService.cancelInvitation(
      id,
      user?.id || 'system',
      user?.email || 'system',
      user?.name || 'System',
    );
  }

  // ====================
  // AUDIT LOGS
  // ====================

  /**
   * Get platform-wide audit logs
   */
  @Get('audit-logs')
  async getAuditLogs(@Query() query: AuditLogQueryDto) {
    return this.platformService.getAuditLogs(query);
  }

  /**
   * Get audit logs for a specific tenant
   */
  @Get('tenants/:id/audit-logs')
  async getTenantAuditLogs(
    @Param('id') id: string,
    @Query() query: AuditLogQueryDto,
  ) {
    return this.platformService.getTenantAuditLogs(id, query);
  }
}
