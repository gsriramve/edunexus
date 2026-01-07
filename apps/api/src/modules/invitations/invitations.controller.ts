import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto, InvitationQueryDto, ResendInvitationDto } from './dto/invitation.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  /**
   * Create a new invitation
   * Only principals and admin_staff can create invitations
   */
  @Post()
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('principal', 'admin_staff')
  async create(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-name') userName: string,
    @Body() createDto: CreateInvitationDto,
  ) {
    return this.invitationsService.create(tenantId, createDto, userId, userName);
  }

  /**
   * List all invitations for the tenant
   */
  @Get()
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('principal', 'admin_staff')
  async findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: InvitationQueryDto,
  ) {
    return this.invitationsService.findAll(tenantId, query);
  }

  /**
   * Get invitation statistics
   */
  @Get('stats')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('principal', 'admin_staff')
  async getStats(@Headers('x-tenant-id') tenantId: string) {
    return this.invitationsService.getStats(tenantId);
  }

  /**
   * Validate an invitation token (public endpoint)
   * Used by the sign-up page to verify the invitation before showing the form
   */
  @Get('validate/:token')
  async validateToken(@Param('token') token: string) {
    return this.invitationsService.validateToken(token);
  }

  /**
   * Get a single invitation
   */
  @Get(':id')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('principal', 'admin_staff')
  async findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.invitationsService.findOne(tenantId, id);
  }

  /**
   * Resend an invitation email
   */
  @Post(':id/resend')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('principal', 'admin_staff')
  async resend(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() resendDto: ResendInvitationDto,
  ) {
    return this.invitationsService.resend(tenantId, id, resendDto.message);
  }

  /**
   * Cancel an invitation
   */
  @Delete(':id')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('principal', 'admin_staff')
  async cancel(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.invitationsService.cancel(tenantId, id);
  }
}
