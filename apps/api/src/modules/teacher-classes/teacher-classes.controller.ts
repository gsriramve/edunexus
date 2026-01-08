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
import { TeacherClassesService } from './teacher-classes.service';
import {
  QueryTeacherClassesDto,
  CreateTimetableDto,
  UpdateTimetableDto,
} from './dto/teacher-classes.dto';

@Controller('teacher-classes')
export class TeacherClassesController {
  constructor(private readonly teacherClassesService: TeacherClassesService) {}

  /**
   * Get all classes assigned to the current teacher
   * GET /api/teacher-classes
   */
  @Get()
  getMyClasses(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('academicYear') academicYear?: string,
    @Query('semester') semester?: string,
  ) {
    return this.teacherClassesService.getTeacherClasses(tenantId, userId, {
      academicYear,
      semester,
    });
  }

  /**
   * Get details of a specific class
   * GET /api/teacher-classes/:id
   */
  @Get(':id')
  getClassDetails(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') classId: string,
  ) {
    return this.teacherClassesService.getClassDetails(tenantId, userId, classId);
  }

  /**
   * Get detailed student list for a class with attendance and performance stats
   * GET /api/teacher-classes/:id/students
   */
  @Get(':id/students')
  getClassStudents(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') classId: string,
  ) {
    return this.teacherClassesService.getClassStudents(tenantId, userId, classId);
  }

  /**
   * Add a timetable entry for a class
   * POST /api/teacher-classes/timetable
   */
  @Post('timetable')
  @HttpCode(HttpStatus.CREATED)
  createTimetable(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() createTimetableDto: CreateTimetableDto,
  ) {
    return this.teacherClassesService.createTimetable(tenantId, userId, createTimetableDto);
  }

  /**
   * Update a timetable entry
   * PATCH /api/teacher-classes/timetable/:id
   */
  @Patch('timetable/:id')
  updateTimetable(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') timetableId: string,
    @Body() updateTimetableDto: UpdateTimetableDto,
  ) {
    return this.teacherClassesService.updateTimetable(
      tenantId,
      userId,
      timetableId,
      updateTimetableDto,
    );
  }

  /**
   * Delete a timetable entry
   * DELETE /api/teacher-classes/timetable/:id
   */
  @Delete('timetable/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTimetable(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') timetableId: string,
  ) {
    return this.teacherClassesService.deleteTimetable(tenantId, userId, timetableId);
  }
}
