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
  BadRequestException,
} from '@nestjs/common';
import { HodCurriculumService } from './hod-curriculum.service';
import {
  QuerySubjectsDto,
  QueryFacultyAssignmentsDto,
  CreateSyllabusUnitDto,
  UpdateSyllabusUnitDto,
  BulkUpdateSyllabusStatusDto,
} from './dto/hod-curriculum.dto';

@Controller('hod-curriculum')
export class HodCurriculumController {
  constructor(private readonly curriculumService: HodCurriculumService) {}

  private getTenantAndUser(
    tenantIdHeader: string,
    userIdHeader: string,
  ): { tenantId: string; staffId: string } {
    if (!tenantIdHeader) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    if (!userIdHeader) {
      throw new BadRequestException('x-user-id header is required');
    }
    return { tenantId: tenantIdHeader, staffId: userIdHeader };
  }

  // ==================== Stats ====================

  @Get('stats')
  async getStats(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    const { tenantId: tid, staffId } = this.getTenantAndUser(tenantId, userId);
    return this.curriculumService.getStats(tid, staffId);
  }

  // ==================== Subjects ====================

  @Get('subjects')
  async getSubjects(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QuerySubjectsDto,
  ) {
    const { tenantId: tid, staffId } = this.getTenantAndUser(tenantId, userId);
    return this.curriculumService.getSubjects(tid, staffId, query);
  }

  @Get('subjects/:id')
  async getSubjectDetail(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') subjectId: string,
  ) {
    const { tenantId: tid, staffId } = this.getTenantAndUser(tenantId, userId);
    return this.curriculumService.getSubjectDetail(tid, staffId, subjectId);
  }

  // ==================== Faculty Assignments ====================

  @Get('faculty-assignments')
  async getFacultyAssignments(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryFacultyAssignmentsDto,
  ) {
    const { tenantId: tid, staffId } = this.getTenantAndUser(tenantId, userId);
    return this.curriculumService.getFacultyAssignments(tid, staffId, query);
  }

  // ==================== Syllabus Units ====================

  @Post('syllabus-units')
  async createSyllabusUnit(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: CreateSyllabusUnitDto,
  ) {
    const { tenantId: tid, staffId } = this.getTenantAndUser(tenantId, userId);
    return this.curriculumService.createSyllabusUnit(tid, staffId, data);
  }

  @Patch('syllabus-units/:id')
  async updateSyllabusUnit(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') unitId: string,
    @Body() data: UpdateSyllabusUnitDto,
  ) {
    const { tenantId: tid, staffId } = this.getTenantAndUser(tenantId, userId);
    return this.curriculumService.updateSyllabusUnit(tid, staffId, unitId, data);
  }

  @Patch('syllabus-units/bulk-status')
  async bulkUpdateSyllabusStatus(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: BulkUpdateSyllabusStatusDto,
  ) {
    const { tenantId: tid, staffId } = this.getTenantAndUser(tenantId, userId);
    return this.curriculumService.bulkUpdateSyllabusStatus(tid, staffId, data);
  }

  @Delete('syllabus-units/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSyllabusUnit(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') unitId: string,
  ) {
    const { tenantId: tid, staffId } = this.getTenantAndUser(tenantId, userId);
    await this.curriculumService.deleteSyllabusUnit(tid, staffId, unitId);
  }
}
