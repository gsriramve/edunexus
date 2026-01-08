import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Body,
  Param,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { LabAssistantService } from './lab-assistant.service';
import {
  QueryScheduleDto,
  QueryBatchesDto,
  QueryStudentsDto,
  QueryAttendanceHistoryDto,
  QueryEquipmentDto,
  QueryIssuesDto,
  QueryPracticalExamsDto,
  QueryExamMarksDto,
  CreateAttendanceDto,
  CreateEquipmentIssueDto,
  UpdateEquipmentStatusDto,
  SaveMarksDto,
} from './dto/lab-assistant.dto';

@Controller('lab-assistant')
export class LabAssistantController {
  constructor(private readonly labAssistantService: LabAssistantService) {}

  /**
   * Get dashboard data for lab assistant
   */
  @Get('dashboard')
  async getDashboard(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.labAssistantService.getDashboard(tenantId, userId);
  }

  /**
   * Get labs assigned to lab assistant
   */
  @Get('labs')
  async getLabs(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.labAssistantService.getLabs(tenantId, userId);
  }

  /**
   * Get batches for lab sessions
   */
  @Get('batches')
  async getBatches(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryBatchesDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.labAssistantService.getBatches(tenantId, userId, query);
  }

  /**
   * Get students for attendance marking
   */
  @Get('students')
  async getStudents(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryStudentsDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.labAssistantService.getStudentsForAttendance(tenantId, userId, query);
  }

  /**
   * Get attendance history
   */
  @Get('attendance/history')
  async getAttendanceHistory(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryAttendanceHistoryDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.labAssistantService.getAttendanceHistory(tenantId, userId, query);
  }

  /**
   * Get students with low attendance
   */
  @Get('attendance/low')
  async getLowAttendance(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.labAssistantService.getLowAttendanceStudents(tenantId, userId);
  }

  /**
   * Submit attendance for a lab session
   */
  @Post('attendance')
  async submitAttendance(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: CreateAttendanceDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.labAssistantService.submitAttendance(tenantId, userId, data);
  }

  /**
   * Get equipment inventory
   */
  @Get('equipment')
  async getEquipment(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryEquipmentDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.labAssistantService.getEquipment(tenantId, userId, query);
  }

  /**
   * Get reported equipment issues
   */
  @Get('equipment/issues')
  async getIssues(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryIssuesDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.labAssistantService.getIssues(tenantId, userId, query);
  }

  /**
   * Get maintenance history
   */
  @Get('equipment/maintenance')
  async getMaintenanceHistory(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.labAssistantService.getMaintenanceHistory(tenantId, userId);
  }

  /**
   * Report an equipment issue
   */
  @Post('equipment/issues')
  async reportIssue(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: CreateEquipmentIssueDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.labAssistantService.reportIssue(tenantId, userId, data);
  }

  /**
   * Update equipment status
   */
  @Patch('equipment/:id/status')
  async updateEquipmentStatus(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') equipmentId: string,
    @Body() data: UpdateEquipmentStatusDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.labAssistantService.updateEquipmentStatus(
      tenantId,
      userId,
      equipmentId,
      data,
    );
  }

  // ============ Marks Endpoints ============

  /**
   * Get practical exams for lab assistant
   */
  @Get('marks/exams')
  async getPracticalExams(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: QueryPracticalExamsDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.labAssistantService.getPracticalExams(tenantId, userId, query);
  }

  /**
   * Get students and their marks for a specific exam
   */
  @Get('marks/exams/:examId')
  async getExamMarks(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('examId') examId: string,
    @Query() query: QueryExamMarksDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.labAssistantService.getExamMarksDetail(tenantId, userId, examId, query);
  }

  /**
   * Save marks for a practical exam
   */
  @Post('marks')
  async saveMarks(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: SaveMarksDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.labAssistantService.saveMarks(tenantId, userId, data);
  }
}
