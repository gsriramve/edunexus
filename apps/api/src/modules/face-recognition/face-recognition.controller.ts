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
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId, UserId } from '../../common/decorators/tenant.decorator';
import { EnrollmentService } from './enrollment.service';
import { AttendanceService } from './attendance.service';
import { RekognitionService } from './rekognition.service';
import {
  EnrollStudentDto,
  BulkEnrollDto,
  QueryEnrollmentsDto,
  CreateSessionDto,
  ProcessSessionDto,
  ConfirmSessionDto,
  UpdateSessionDto,
  QuerySessionsDto,
  UpdateDetectedFaceDto,
  BulkUpdateFacesDto,
  SearchFaceDto,
  DetectFacesDto,
} from './dto/face-recognition.dto';

@Controller('face-recognition')
@UseGuards(RolesGuard)
export class FaceRecognitionController {
  constructor(
    private readonly enrollment: EnrollmentService,
    private readonly attendance: AttendanceService,
    private readonly rekognition: RekognitionService,
  ) {}

  // ============ ENROLLMENT ENDPOINTS ============

  @Post('enroll')
  @Roles('platform_owner', 'principal', 'hod', 'admin_staff')
  async enrollStudent(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: EnrollStudentDto,
  ) {
    return this.enrollment.enrollStudent(tenantId, dto, userId);
  }

  @Post('enroll/bulk')
  @Roles('platform_owner', 'principal', 'hod', 'admin_staff')
  async bulkEnroll(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: BulkEnrollDto,
  ) {
    return this.enrollment.bulkEnroll(tenantId, dto, userId);
  }

  @Post('enroll/:studentId/re-enroll')
  @Roles('platform_owner', 'principal', 'hod', 'admin_staff')
  async reEnrollStudent(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('studentId') studentId: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    return this.enrollment.reEnrollStudent(tenantId, studentId, imageUrl, userId);
  }

  @Delete('enroll/:studentId')
  @Roles('platform_owner', 'principal', 'hod')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unenrollStudent(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    await this.enrollment.unenrollStudent(tenantId, studentId);
  }

  @Get('enrollments')
  @Roles('platform_owner', 'principal', 'hod', 'admin_staff', 'teacher')
  async queryEnrollments(
    @TenantId() tenantId: string,
    @Query() query: QueryEnrollmentsDto,
  ) {
    return this.enrollment.queryEnrollments(tenantId, query);
  }

  @Get('enrollments/stats')
  @Roles('platform_owner', 'principal', 'hod', 'admin_staff')
  async getEnrollmentStats(@TenantId() tenantId: string) {
    return this.enrollment.getEnrollmentStats(tenantId);
  }

  @Get('enrollments/unenrolled')
  @Roles('platform_owner', 'principal', 'hod', 'admin_staff')
  async getUnenrolledStudents(
    @TenantId() tenantId: string,
    @Query('departmentId') departmentId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.enrollment.getUnenrolledStudents(tenantId, departmentId, limit);
  }

  @Get('enrollments/:studentId')
  @Roles('platform_owner', 'principal', 'hod', 'admin_staff', 'teacher')
  async getEnrollment(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.enrollment.getEnrollment(tenantId, studentId);
  }

  @Get('enrollments/:studentId/status')
  @Roles('platform_owner', 'principal', 'hod', 'admin_staff', 'teacher')
  async checkEnrollmentStatus(
    @TenantId() tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    const isEnrolled = await this.enrollment.isEnrolled(tenantId, studentId);
    return { studentId, isEnrolled };
  }

  // ============ ATTENDANCE SESSION ENDPOINTS ============

  @Post('sessions')
  @Roles('platform_owner', 'principal', 'hod', 'teacher')
  async createSession(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: CreateSessionDto,
  ) {
    return this.attendance.createSession(tenantId, dto, userId);
  }

  @Post('sessions/:sessionId/process')
  @Roles('platform_owner', 'principal', 'hod', 'teacher')
  async processSession(
    @TenantId() tenantId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: Partial<ProcessSessionDto>,
  ) {
    return this.attendance.processSession(tenantId, { sessionId, ...dto });
  }

  @Post('sessions/:sessionId/confirm')
  @Roles('platform_owner', 'principal', 'hod', 'teacher')
  async confirmSession(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: Partial<ConfirmSessionDto>,
  ) {
    return this.attendance.confirmSession(tenantId, { sessionId, ...dto }, userId);
  }

  @Post('sessions/:sessionId/cancel')
  @Roles('platform_owner', 'principal', 'hod', 'teacher')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelSession(
    @TenantId() tenantId: string,
    @Param('sessionId') sessionId: string,
  ) {
    await this.attendance.cancelSession(tenantId, sessionId);
  }

  @Get('sessions')
  @Roles('platform_owner', 'principal', 'hod', 'teacher')
  async querySessions(
    @TenantId() tenantId: string,
    @Query() query: QuerySessionsDto,
  ) {
    return this.attendance.querySessions(tenantId, query);
  }

  @Get('sessions/stats')
  @Roles('platform_owner', 'principal', 'hod')
  async getAttendanceStats(@TenantId() tenantId: string) {
    return this.attendance.getAttendanceStats(tenantId);
  }

  @Get('sessions/:sessionId')
  @Roles('platform_owner', 'principal', 'hod', 'teacher')
  async getSession(
    @TenantId() tenantId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.attendance.getSession(tenantId, sessionId);
  }

  // ============ DETECTED FACE ENDPOINTS ============

  @Put('faces/:faceId')
  @Roles('platform_owner', 'principal', 'hod', 'teacher')
  async updateDetectedFace(
    @TenantId() tenantId: string,
    @Param('faceId') faceId: string,
    @Body() dto: UpdateDetectedFaceDto,
  ) {
    return this.attendance.updateDetectedFace(tenantId, faceId, dto);
  }

  @Put('faces/bulk')
  @Roles('platform_owner', 'principal', 'hod', 'teacher')
  async bulkUpdateFaces(
    @TenantId() tenantId: string,
    @Body() dto: BulkUpdateFacesDto,
  ) {
    return this.attendance.bulkUpdateFaces(tenantId, dto);
  }

  // ============ HELPER ENDPOINTS ============

  @Get('section-students')
  @Roles('platform_owner', 'principal', 'hod', 'teacher')
  async getSectionStudents(
    @TenantId() tenantId: string,
    @Query('departmentId') departmentId?: string,
    @Query('section') section?: string,
  ) {
    return this.attendance.getSectionStudents(tenantId, departmentId, section);
  }

  // ============ UTILITY ENDPOINTS ============

  @Post('detect')
  @Roles('platform_owner', 'principal', 'hod', 'admin_staff')
  async detectFaces(
    @TenantId() tenantId: string,
    @Body() dto: DetectFacesDto,
  ) {
    const imageSource = dto.imageBase64
      ? { bytes: Buffer.from(dto.imageBase64, 'base64') }
      : { url: dto.imageUrl };

    return this.rekognition.detectFaces(imageSource);
  }

  @Post('search')
  @Roles('platform_owner', 'principal', 'hod', 'admin_staff')
  async searchFace(
    @TenantId() tenantId: string,
    @Body() dto: SearchFaceDto,
  ) {
    const collectionId = this.rekognition.getCollectionId(tenantId);
    const imageSource = dto.imageBase64
      ? { bytes: Buffer.from(dto.imageBase64, 'base64') }
      : { url: dto.imageUrl };

    const matches = await this.rekognition.searchFaces(
      collectionId,
      imageSource,
      dto.threshold,
      dto.maxFaces,
    );

    // Get student info for matches
    const faceIdMap = await this.enrollment.getFaceIdToStudentMap(tenantId);

    return matches.map((match) => ({
      ...match,
      studentId: faceIdMap.get(match.faceId),
    }));
  }

  @Get('config')
  @Roles('platform_owner', 'principal')
  async getConfig(@TenantId() tenantId: string) {
    const isConfigured = this.rekognition.isConfigured();
    const collectionId = this.rekognition.getCollectionId(tenantId);

    return {
      isConfigured,
      collectionId,
      matchThreshold: 90,
      enrollmentQualityThreshold: 80,
      autoConfirmHighConfidence: false,
      requireManualReview: true,
      maxFacesPerPhoto: 50,
    };
  }

  @Post('collection/initialize')
  @Roles('platform_owner', 'principal')
  async initializeCollection(@TenantId() tenantId: string) {
    const collectionId = this.rekognition.getCollectionId(tenantId);
    await this.rekognition.createCollection(collectionId);
    return { collectionId, status: 'initialized' };
  }
}
