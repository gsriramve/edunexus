import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TeacherAssignmentsService } from './teacher-assignments.service';
import {
  QueryAssignmentsDto,
  QuerySubmissionsDto,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  GradeSubmissionDto,
} from './dto/teacher-assignments.dto';

@Controller('teacher-assignments')
export class TeacherAssignmentsController {
  constructor(private readonly teacherAssignmentsService: TeacherAssignmentsService) {}

  /**
   * Get all assignments for the current teacher with stats
   * GET /api/teacher-assignments
   */
  @Get()
  getAssignments(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryAssignmentsDto,
  ) {
    return this.teacherAssignmentsService.getAssignments(tenantId, userId, query);
  }

  /**
   * Get teacher's subjects for assignment creation dropdown
   * GET /api/teacher-assignments/subjects
   */
  @Get('subjects')
  getTeacherSubjects(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.teacherAssignmentsService.getTeacherSubjects(tenantId, userId);
  }

  /**
   * Get recent submissions across all assignments
   * GET /api/teacher-assignments/submissions/recent
   */
  @Get('submissions/recent')
  getRecentSubmissions(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QuerySubmissionsDto,
  ) {
    return this.teacherAssignmentsService.getRecentSubmissions(tenantId, userId, query);
  }

  /**
   * Get a single assignment with details
   * GET /api/teacher-assignments/:id
   */
  @Get(':id')
  getAssignment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') assignmentId: string,
  ) {
    return this.teacherAssignmentsService.getAssignment(tenantId, userId, assignmentId);
  }

  /**
   * Get submissions for a specific assignment
   * GET /api/teacher-assignments/:id/submissions
   */
  @Get(':id/submissions')
  getAssignmentSubmissions(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') assignmentId: string,
    @Query() query: QuerySubmissionsDto,
  ) {
    return this.teacherAssignmentsService.getAssignmentSubmissions(
      tenantId,
      userId,
      assignmentId,
      query,
    );
  }

  /**
   * Create a new assignment
   * POST /api/teacher-assignments
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createAssignment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.teacherAssignmentsService.createAssignment(tenantId, userId, dto);
  }

  /**
   * Update an assignment
   * PATCH /api/teacher-assignments/:id
   */
  @Patch(':id')
  updateAssignment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') assignmentId: string,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.teacherAssignmentsService.updateAssignment(
      tenantId,
      userId,
      assignmentId,
      dto,
    );
  }

  /**
   * Delete an assignment
   * DELETE /api/teacher-assignments/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAssignment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') assignmentId: string,
  ) {
    return this.teacherAssignmentsService.deleteAssignment(tenantId, userId, assignmentId);
  }

  /**
   * Grade a submission
   * POST /api/teacher-assignments/submissions/:submissionId/grade
   */
  @Post('submissions/:submissionId/grade')
  gradeSubmission(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('submissionId') submissionId: string,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.teacherAssignmentsService.gradeSubmission(
      tenantId,
      userId,
      submissionId,
      dto,
    );
  }
}
