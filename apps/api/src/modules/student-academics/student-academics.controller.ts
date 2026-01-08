import {
  Controller,
  Get,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { StudentAcademicsService } from './student-academics.service';

@Controller('student-academics')
export class StudentAcademicsController {
  constructor(private readonly studentAcademicsService: StudentAcademicsService) {}

  @Get('subjects')
  getSubjects(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('studentId') studentId: string,
    @Query('semester') semester?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!studentId && !userId) {
      throw new BadRequestException('Student ID is required');
    }

    const semesterNum = semester ? parseInt(semester, 10) : undefined;
    return this.studentAcademicsService.getSubjects(
      tenantId,
      studentId || userId,
      semesterNum,
    );
  }

  @Get('summary')
  getSummary(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query('studentId') studentId?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!studentId && !userId) {
      throw new BadRequestException('Student ID is required');
    }

    return this.studentAcademicsService.getSummary(
      tenantId,
      studentId || userId,
    );
  }
}
