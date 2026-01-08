import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HodSubjectsService } from './hod-subjects.service';
import {
  QuerySubjectsDto,
  CreateSubjectDto,
  UpdateSubjectDto,
  AssignFacultyDto,
} from './dto/hod-subjects.dto';

@Controller('hod-subjects')
export class HodSubjectsController {
  constructor(private readonly subjectsService: HodSubjectsService) {}

  /**
   * Get all subjects for the HoD's department
   * GET /api/hod-subjects
   */
  @Get()
  getSubjects(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QuerySubjectsDto,
  ) {
    return this.subjectsService.getSubjects(tenantId, userId, query);
  }

  /**
   * Get available faculty for assignment
   * GET /api/hod-subjects/faculty
   */
  @Get('faculty')
  getAvailableFaculty(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.subjectsService.getAvailableFaculty(tenantId, userId);
  }

  /**
   * Get single subject details
   * GET /api/hod-subjects/:subjectId
   */
  @Get(':subjectId')
  getSubjectById(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.subjectsService.getSubjectById(tenantId, userId, subjectId);
  }

  /**
   * Create a new subject
   * POST /api/hod-subjects
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createSubject(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateSubjectDto,
  ) {
    return this.subjectsService.createSubject(tenantId, userId, dto);
  }

  /**
   * Update a subject
   * PATCH /api/hod-subjects/:subjectId
   */
  @Patch(':subjectId')
  updateSubject(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('subjectId') subjectId: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.subjectsService.updateSubject(tenantId, userId, subjectId, dto);
  }

  /**
   * Delete a subject
   * DELETE /api/hod-subjects/:subjectId
   */
  @Delete(':subjectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSubject(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.subjectsService.deleteSubject(tenantId, userId, subjectId);
  }

  /**
   * Assign faculty to a subject
   * POST /api/hod-subjects/:subjectId/faculty
   */
  @Post(':subjectId/faculty')
  @HttpCode(HttpStatus.CREATED)
  assignFaculty(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('subjectId') subjectId: string,
    @Body() dto: AssignFacultyDto,
  ) {
    return this.subjectsService.assignFaculty(tenantId, userId, subjectId, dto);
  }

  /**
   * Remove faculty from a subject
   * DELETE /api/hod-subjects/faculty/:teacherSubjectId
   */
  @Delete('faculty/:teacherSubjectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFaculty(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('teacherSubjectId') teacherSubjectId: string,
  ) {
    return this.subjectsService.removeFaculty(tenantId, userId, teacherSubjectId);
  }
}
