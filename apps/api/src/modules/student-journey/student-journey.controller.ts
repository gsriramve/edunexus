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
} from '@nestjs/common';
import { StudentJourneyService } from './student-journey.service';
import { TenantId, UserId } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  CreateMilestoneDto,
  UpdateMilestoneDto,
  QueryMilestonesDto,
  CreateSemesterSnapshotDto,
  UpdateSemesterSnapshotDto,
  QuerySemesterSnapshotsDto,
  TimelineFilterDto,
  GenerateSnapshotDto,
  BulkGenerateSnapshotsDto,
  ExportJourneyDto,
} from './dto/student-journey.dto';

@Controller('student-journey')
@UseGuards(RolesGuard)
export class StudentJourneyController {
  constructor(private readonly studentJourneyService: StudentJourneyService) {}

  // ============ MILESTONE ENDPOINTS ============

  /**
   * Create a new milestone
   * Accessible by: principal, hod, teacher, admin_staff
   */
  @Post('milestones')
  @Roles('principal', 'hod', 'teacher', 'admin_staff')
  async createMilestone(
    @TenantId() tenantId: string,
    @Body() dto: CreateMilestoneDto,
  ) {
    return this.studentJourneyService.createMilestone(tenantId, dto);
  }

  /**
   * Update a milestone
   * Accessible by: principal, hod, teacher, admin_staff
   */
  @Put('milestones/:id')
  @Roles('principal', 'hod', 'teacher', 'admin_staff')
  async updateMilestone(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMilestoneDto,
  ) {
    return this.studentJourneyService.updateMilestone(tenantId, id, dto);
  }

  /**
   * Delete a milestone
   * Accessible by: principal, hod, admin_staff
   */
  @Delete('milestones/:id')
  @Roles('principal', 'hod', 'admin_staff')
  async deleteMilestone(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.studentJourneyService.deleteMilestone(tenantId, id);
  }

  /**
   * Get a single milestone
   * Accessible by: all authenticated users
   */
  @Get('milestones/:id')
  async getMilestone(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.studentJourneyService.getMilestone(tenantId, id);
  }

  /**
   * Query milestones with filters
   * Accessible by: all authenticated users
   */
  @Get('milestones')
  async queryMilestones(
    @TenantId() tenantId: string,
    @Query() query: QueryMilestonesDto,
  ) {
    return this.studentJourneyService.queryMilestones(tenantId, query);
  }

  /**
   * Get my milestones (for students)
   * Accessible by: student
   */
  @Get('my-milestones')
  @Roles('student')
  async getMyMilestones(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Query() query: QueryMilestonesDto,
  ) {
    // For students, use userId as studentId lookup
    return this.studentJourneyService.queryMilestones(tenantId, {
      ...query,
      studentId: userId, // Service should resolve this
    });
  }

  // ============ SNAPSHOT ENDPOINTS ============

  /**
   * Create or update semester snapshot
   * Accessible by: principal, hod, admin_staff
   */
  @Post('snapshots')
  @Roles('principal', 'hod', 'admin_staff')
  async saveSemesterSnapshot(
    @TenantId() tenantId: string,
    @Body() dto: CreateSemesterSnapshotDto,
  ) {
    return this.studentJourneyService.saveSemesterSnapshot(tenantId, dto);
  }

  /**
   * Generate snapshot from student data
   * Accessible by: principal, hod, admin_staff
   */
  @Post('snapshots/generate')
  @Roles('principal', 'hod', 'admin_staff')
  async generateSnapshot(
    @TenantId() tenantId: string,
    @Body() dto: GenerateSnapshotDto,
  ) {
    return this.studentJourneyService.generateSnapshot(
      tenantId,
      dto.studentId,
      dto.academicYear,
      dto.semester,
    );
  }

  /**
   * Bulk generate snapshots for department/batch
   * Accessible by: principal, hod
   */
  @Post('snapshots/bulk-generate')
  @Roles('principal', 'hod')
  async bulkGenerateSnapshots(
    @TenantId() tenantId: string,
    @Body() dto: BulkGenerateSnapshotsDto,
  ) {
    return this.studentJourneyService.bulkGenerateSnapshots(
      tenantId,
      dto.academicYear,
      dto.semester,
      {
        departmentId: dto.departmentId,
        batch: dto.batch,
      },
    );
  }

  /**
   * Get a semester snapshot
   * Accessible by: all authenticated users
   */
  @Get('snapshots/:studentId/:academicYear/:semester')
  async getSemesterSnapshot(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Param('academicYear') academicYear: string,
    @Param('semester') semester: string,
  ) {
    return this.studentJourneyService.getSemesterSnapshot(
      tenantId,
      studentId,
      academicYear,
      parseInt(semester, 10),
    );
  }

  /**
   * Query snapshots
   * Accessible by: all authenticated users
   */
  @Get('snapshots')
  async querySnapshots(
    @TenantId() tenantId: string,
    @Query() query: QuerySemesterSnapshotsDto,
  ) {
    return this.studentJourneyService.querySnapshots(tenantId, query);
  }

  /**
   * Get my snapshots (for students)
   * Accessible by: student
   */
  @Get('my-snapshots')
  @Roles('student')
  async getMySnapshots(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Query() query: QuerySemesterSnapshotsDto,
  ) {
    return this.studentJourneyService.querySnapshots(tenantId, {
      ...query,
      studentId: userId,
    });
  }

  /**
   * Update snapshot
   * Accessible by: principal, hod, admin_staff
   */
  @Put('snapshots/:id')
  @Roles('principal', 'hod', 'admin_staff')
  async updateSnapshot(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSemesterSnapshotDto,
  ) {
    return this.studentJourneyService.updateSnapshot(tenantId, id, dto);
  }

  // ============ TIMELINE & STATS ENDPOINTS ============

  /**
   * Get student timeline
   * Accessible by: all authenticated users
   */
  @Get('timeline/:studentId')
  async getStudentTimeline(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Query() filter: TimelineFilterDto,
  ) {
    return this.studentJourneyService.getStudentTimeline(tenantId, {
      ...filter,
      studentId,
    });
  }

  /**
   * Get my timeline (for students)
   * Accessible by: student
   */
  @Get('my-timeline')
  @Roles('student')
  async getMyTimeline(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Query() filter: TimelineFilterDto,
  ) {
    return this.studentJourneyService.getStudentTimeline(tenantId, {
      ...filter,
      studentId: userId,
    });
  }

  /**
   * Get journey statistics
   * Accessible by: all authenticated users
   */
  @Get('stats/:studentId')
  async getJourneyStats(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.studentJourneyService.getJourneyStats(tenantId, studentId);
  }

  /**
   * Get my journey stats (for students)
   * Accessible by: student
   */
  @Get('my-stats')
  @Roles('student')
  async getMyStats(
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    return this.studentJourneyService.getJourneyStats(tenantId, userId);
  }

  /**
   * Compare two semesters
   * Accessible by: all authenticated users
   */
  @Get('compare/:studentId')
  async compareSemesters(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Query('year1') year1: string,
    @Query('sem1') sem1: string,
    @Query('year2') year2: string,
    @Query('sem2') sem2: string,
  ) {
    return this.studentJourneyService.compareSemesters(
      tenantId,
      studentId,
      { academicYear: year1, semester: parseInt(sem1, 10) },
      { academicYear: year2, semester: parseInt(sem2, 10) },
    );
  }

  /**
   * Get year-over-year progress
   * Accessible by: all authenticated users
   */
  @Get('progress/:studentId')
  async getYearOverYearProgress(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.studentJourneyService.getYearOverYearProgress(tenantId, studentId);
  }

  /**
   * Get my progress (for students)
   * Accessible by: student
   */
  @Get('my-progress')
  @Roles('student')
  async getMyProgress(
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    return this.studentJourneyService.getYearOverYearProgress(tenantId, userId);
  }

  // ============ EXPORT ENDPOINTS ============

  /**
   * Export student journey
   * Accessible by: principal, hod, admin_staff, student (own data)
   */
  @Post('export')
  @Roles('principal', 'hod', 'admin_staff', 'student')
  async exportJourney(
    @TenantId() tenantId: string,
    @Body() dto: ExportJourneyDto,
  ) {
    return this.studentJourneyService.exportJourney(tenantId, dto);
  }

  // ============ DASHBOARD ENDPOINTS ============

  /**
   * Get journey dashboard for a student (combined stats, timeline, snapshots)
   * Accessible by: all authenticated users
   */
  @Get('dashboard/:studentId')
  async getJourneyDashboard(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    const [stats, timeline, progress, snapshots] = await Promise.all([
      this.studentJourneyService.getJourneyStats(tenantId, studentId),
      this.studentJourneyService.getStudentTimeline(tenantId, { studentId }),
      this.studentJourneyService.getYearOverYearProgress(tenantId, studentId),
      this.studentJourneyService.querySnapshots(tenantId, { studentId }),
    ]);

    return {
      stats,
      timeline: timeline.slice(0, 10), // Latest 10 items
      progress,
      snapshots,
    };
  }

  /**
   * Get my journey dashboard (for students)
   * Accessible by: student
   */
  @Get('my-dashboard')
  @Roles('student')
  async getMyDashboard(
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    const [stats, timeline, progress, snapshots] = await Promise.all([
      this.studentJourneyService.getJourneyStats(tenantId, userId),
      this.studentJourneyService.getStudentTimeline(tenantId, { studentId: userId }),
      this.studentJourneyService.getYearOverYearProgress(tenantId, userId),
      this.studentJourneyService.querySnapshots(tenantId, { studentId: userId }),
    ]);

    return {
      stats,
      timeline: timeline.slice(0, 10),
      progress,
      snapshots,
    };
  }
}
