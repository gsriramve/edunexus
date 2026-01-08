import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { StudentCareerService } from './student-career.service';
import {
  QueryDrivesDto,
  QueryApplicationsDto,
  UpdateProfileDto,
  ApplyToDriveDto,
} from './dto/student-career.dto';

@Controller('student-career')
export class StudentCareerController {
  constructor(private readonly studentCareerService: StudentCareerService) {}

  /**
   * Get complete career hub dashboard data
   */
  @Get(':studentId')
  async getCareerDashboard(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.studentCareerService.getCareerDashboard(tenantId, studentId);
  }

  /**
   * Get student's career profile
   */
  @Get(':studentId/profile')
  async getProfile(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.studentCareerService.getProfile(tenantId, studentId);
  }

  /**
   * Update career profile
   */
  @Put(':studentId/profile')
  async updateProfile(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
    @Body() data: UpdateProfileDto,
  ) {
    return this.studentCareerService.updateProfile(tenantId, studentId, data);
  }

  /**
   * Get placement stats
   */
  @Get(':studentId/stats')
  async getPlacementStats(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.studentCareerService.getPlacementStats(tenantId, studentId);
  }

  /**
   * Get upcoming placement drives
   */
  @Get(':studentId/drives')
  async getUpcomingDrives(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
    @Query() query: QueryDrivesDto,
  ) {
    return this.studentCareerService.getUpcomingDrives(tenantId, studentId, query);
  }

  /**
   * Get student's job applications
   */
  @Get(':studentId/applications')
  async getApplications(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
    @Query() query: QueryApplicationsDto,
  ) {
    return this.studentCareerService.getApplications(tenantId, studentId, query);
  }

  /**
   * Get skill gaps for placement preparation
   */
  @Get(':studentId/skill-gaps')
  async getSkillGaps(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.studentCareerService.getSkillGaps(tenantId, studentId);
  }

  /**
   * Apply to a placement drive
   */
  @Post(':studentId/apply')
  async applyToDrive(
    @Headers('x-tenant-id') tenantId: string,
    @Param('studentId') studentId: string,
    @Body() data: ApplyToDriveDto,
  ) {
    return this.studentCareerService.applyToDrive(tenantId, studentId, data.driveId);
  }
}
