import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { StudentEnrollmentService } from './student-enrollment.service';
import { ApprovalDto } from './dto/enrollment.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

/**
 * Approval Controller for Student Enrollment
 * Used by HOD and Principal for final approval workflow
 */
@Controller('student-enrollment')
export class StudentEnrollmentApprovalController {
  constructor(private readonly enrollmentService: StudentEnrollmentService) {}

  /**
   * Get enrollments pending approval
   * HOD sees only their department's enrollments
   * Principal sees all enrollments
   */
  @Get('pending-approval')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('principal', 'hod')
  async getPendingApprovals(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') role: UserRole,
  ) {
    return this.enrollmentService.getPendingApprovals(tenantId, userId, role);
  }

  /**
   * HOD/Principal approves enrollment
   * HOD approval moves to PRINCIPAL_APPROVED or back to ADMIN for principal review
   * Principal approval completes the enrollment
   */
  @Post(':id/approve')
  @UseGuards(TenantGuard, RolesGuard)
  @Roles('principal', 'hod')
  async approve(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') role: UserRole,
    @Param('id') id: string,
    @Body() dto: ApprovalDto,
  ) {
    return this.enrollmentService.finalApproval(tenantId, id, dto, userId, role);
  }
}
