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
import { StudentEnrollmentService } from './student-enrollment.service';
import {
  InitiateEnrollmentDto,
  EnrollmentQueryDto,
  AdminReviewDto,
} from './dto/enrollment.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * Admin Controller for Student Enrollment
 * Handles enrollment initiation, review, and management
 */
@Controller('student-enrollment')
export class StudentEnrollmentController {
  constructor(private readonly enrollmentService: StudentEnrollmentService) {}

  /**
   * Initiate a new student enrollment
   * Creates enrollment record and prepares for invitation
   */
  @Post('initiate')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('principal', 'admin_staff')
  async initiate(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: InitiateEnrollmentDto,
  ) {
    return this.enrollmentService.initiate(tenantId, dto, userId);
  }

  /**
   * List all enrollments for the tenant with optional filters
   */
  @Get()
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('principal', 'admin_staff', 'hod')
  async findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: EnrollmentQueryDto,
  ) {
    return this.enrollmentService.findAll(tenantId, query);
  }

  /**
   * Get enrollment statistics
   */
  @Get('stats')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('principal', 'admin_staff')
  async getStats(
    @Headers('x-tenant-id') tenantId: string,
    @Query('academicYear') academicYear?: string,
  ) {
    return this.enrollmentService.getStats(tenantId, academicYear);
  }

  /**
   * Get a single enrollment by ID
   */
  @Get(':id')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('principal', 'admin_staff', 'hod')
  async findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.enrollmentService.findOne(tenantId, id);
  }

  /**
   * Send or resend invitation email
   */
  @Post(':id/send-invitation')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('principal', 'admin_staff')
  async sendInvitation(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.enrollmentService.sendInvitation(tenantId, id);
  }

  /**
   * Admin reviews the enrollment application
   * Can approve, request changes, or reject
   */
  @Post(':id/admin-review')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('principal', 'admin_staff')
  async adminReview(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() dto: AdminReviewDto,
  ) {
    return this.enrollmentService.adminReview(tenantId, id, dto, userId);
  }

  /**
   * Cancel an enrollment
   */
  @Delete(':id')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('principal', 'admin_staff')
  async cancel(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.enrollmentService.cancel(tenantId, id);
  }
}
