import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RekognitionService } from './rekognition.service';
import { EnrollmentService } from './enrollment.service';
import {
  CreateSessionDto,
  ProcessSessionDto,
  ConfirmSessionDto,
  UpdateSessionDto,
  QuerySessionsDto,
  UpdateDetectedFaceDto,
  BulkUpdateFacesDto,
  SessionStatus,
  DetectedFaceStatus,
  AttendanceStatus,
  SessionResult,
  DetectedFaceResult,
  AttendanceStats,
  BoundingBox,
} from './dto/face-recognition.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);
  private readonly defaultMatchThreshold = 90;

  constructor(
    private readonly prisma: PrismaService,
    private readonly rekognition: RekognitionService,
    private readonly enrollment: EnrollmentService,
  ) {}

  /**
   * Create a new attendance session from class photo
   */
  async createSession(
    tenantId: string,
    dto: CreateSessionDto,
    createdBy: string,
  ): Promise<SessionResult> {
    // Create session record
    const session = await this.prisma.attendanceSession.create({
      data: {
        tenantId,
        departmentId: dto.departmentId,
        section: dto.section,
        subjectId: dto.subjectId,
        classPhotoUrl: dto.classPhotoUrl,
        date: new Date(dto.date),
        status: SessionStatus.PENDING,
        createdBy,
      },
    });

    this.logger.log(`Created attendance session ${session.id}`);

    return this.mapSessionToResult(session, []);
  }

  /**
   * Process a session - detect faces and match with enrolled students
   */
  async processSession(
    tenantId: string,
    dto: ProcessSessionDto,
  ): Promise<SessionResult> {
    const session = await this.prisma.attendanceSession.findFirst({
      where: { id: dto.sessionId, tenantId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status !== SessionStatus.PENDING) {
      throw new BadRequestException(`Session is already ${session.status}`);
    }

    // Update status to processing
    await this.prisma.attendanceSession.update({
      where: { id: session.id },
      data: { status: SessionStatus.PROCESSING },
    });

    try {
      const collectionId = this.rekognition.getCollectionId(tenantId);
      const threshold = dto.matchThreshold || this.defaultMatchThreshold;

      // Prepare image source
      const imageSource = { url: session.classPhotoUrl };

      // Detect all faces in the class photo
      const detectedFaces = await this.rekognition.detectFaces(imageSource);

      if (detectedFaces.length === 0) {
        await this.prisma.attendanceSession.update({
          where: { id: session.id },
          data: {
            status: SessionStatus.REVIEW,
            totalFacesDetected: 0,
            matchedFaces: 0,
            unmatchedFaces: 0,
          },
        });

        return this.getSession(tenantId, session.id);
      }

      // Get face ID to student mapping
      const faceIdToStudent = await this.enrollment.getFaceIdToStudentMap(tenantId);

      // Process each detected face
      const detectedFaceRecords: {
        boundingBox: BoundingBox;
        matchedStudentId: string | null;
        matchConfidence: number | null;
        status: DetectedFaceStatus;
      }[] = [];

      for (const face of detectedFaces) {
        // Try to match this face
        try {
          // Crop the face region and search (simplified - searches whole image)
          const matches = await this.rekognition.searchFaces(
            collectionId,
            imageSource,
            threshold,
            1,
          );

          if (matches.length > 0 && matches[0].similarity >= threshold) {
            const studentId = faceIdToStudent.get(matches[0].faceId);

            if (studentId) {
              detectedFaceRecords.push({
                boundingBox: face.boundingBox,
                matchedStudentId: studentId,
                matchConfidence: matches[0].similarity,
                status: DetectedFaceStatus.MATCHED,
              });
              continue;
            }
          }
        } catch (error) {
          this.logger.warn(`Face search failed: ${error}`);
        }

        // No match found
        detectedFaceRecords.push({
          boundingBox: face.boundingBox,
          matchedStudentId: null,
          matchConfidence: null,
          status: DetectedFaceStatus.UNMATCHED,
        });
      }

      // Save detected faces
      await this.prisma.detectedFace.createMany({
        data: detectedFaceRecords.map((face) => ({
          tenantId,
          sessionId: session.id,
          boundingBox: face.boundingBox as unknown as Prisma.InputJsonValue,
          matchedStudentId: face.matchedStudentId,
          matchConfidence: face.matchConfidence,
          status: face.status,
          attendanceStatus: AttendanceStatus.PRESENT,
        })),
      });

      // Update session stats
      const matchedCount = detectedFaceRecords.filter(
        (f) => f.status === DetectedFaceStatus.MATCHED,
      ).length;

      await this.prisma.attendanceSession.update({
        where: { id: session.id },
        data: {
          status: SessionStatus.REVIEW,
          totalFacesDetected: detectedFaceRecords.length,
          matchedFaces: matchedCount,
          unmatchedFaces: detectedFaceRecords.length - matchedCount,
        },
      });

      this.logger.log(
        `Processed session ${session.id}: ${detectedFaceRecords.length} faces, ${matchedCount} matched`,
      );

      return this.getSession(tenantId, session.id);
    } catch (error: any) {
      // Reset to pending on error
      await this.prisma.attendanceSession.update({
        where: { id: session.id },
        data: { status: SessionStatus.PENDING },
      });

      throw error;
    }
  }

  /**
   * Confirm a session after review
   */
  async confirmSession(
    tenantId: string,
    dto: ConfirmSessionDto,
    confirmedBy: string,
  ): Promise<SessionResult> {
    const session = await this.prisma.attendanceSession.findFirst({
      where: { id: dto.sessionId, tenantId },
      include: { detectedFaces: true },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status !== SessionStatus.REVIEW) {
      throw new BadRequestException('Session must be in review status to confirm');
    }

    // Apply any overrides
    if (dto.overrides && dto.overrides.length > 0) {
      for (const override of dto.overrides) {
        await this.prisma.detectedFace.update({
          where: { id: override.detectedFaceId },
          data: {
            overrideStudentId: override.studentId,
            status: override.studentId
              ? DetectedFaceStatus.MANUAL_OVERRIDE
              : DetectedFaceStatus.UNMATCHED,
            attendanceStatus: override.attendanceStatus || AttendanceStatus.PRESENT,
          },
        });
      }
    }

    // Get all detected faces with final assignments
    const detectedFaces = await this.prisma.detectedFace.findMany({
      where: { sessionId: session.id },
    });

    // Mark attendance for matched students
    for (const face of detectedFaces) {
      const studentId = face.overrideStudentId || face.matchedStudentId;

      if (studentId && face.attendanceStatus === AttendanceStatus.PRESENT) {
        // Create or update attendance record
        await this.prisma.studentAttendance.upsert({
          where: {
            tenantId_studentId_date: {
              tenantId,
              studentId,
              date: session.date,
            },
          },
          create: {
            tenantId,
            studentId,
            date: session.date,
            status: 'present',
            markedBy: confirmedBy,
            markedByType: 'face_recognition',
            sessionId: session.id,
            matchConfidence: face.matchConfidence,
          },
          update: {
            status: 'present',
            markedBy: confirmedBy,
            markedByType: 'face_recognition',
            sessionId: session.id,
            matchConfidence: face.matchConfidence,
          },
        });
      }
    }

    // Update session status
    await this.prisma.attendanceSession.update({
      where: { id: session.id },
      data: {
        status: SessionStatus.CONFIRMED,
        confirmedBy,
        confirmedAt: new Date(),
      },
    });

    this.logger.log(`Confirmed session ${session.id}`);

    return this.getSession(tenantId, session.id);
  }

  /**
   * Cancel a session
   */
  async cancelSession(tenantId: string, sessionId: string): Promise<void> {
    const session = await this.prisma.attendanceSession.findFirst({
      where: { id: sessionId, tenantId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status === SessionStatus.CONFIRMED) {
      throw new BadRequestException('Cannot cancel a confirmed session');
    }

    // Delete detected faces
    await this.prisma.detectedFace.deleteMany({
      where: { sessionId },
    });

    // Update session status
    await this.prisma.attendanceSession.update({
      where: { id: sessionId },
      data: { status: SessionStatus.CANCELLED },
    });

    this.logger.log(`Cancelled session ${sessionId}`);
  }

  /**
   * Get a session by ID
   */
  async getSession(tenantId: string, sessionId: string): Promise<SessionResult> {
    const session = await this.prisma.attendanceSession.findFirst({
      where: { id: sessionId, tenantId },
      include: {
        detectedFaces: {
          include: {
            // We need to manually query for matched student info
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Get student info for matched faces
    const studentIds = session.detectedFaces
      .map((f) => f.overrideStudentId || f.matchedStudentId)
      .filter(Boolean) as string[];

    const students = await this.prisma.student.findMany({
      where: { id: { in: studentIds } },
      include: {
        user: {
          select: {
            name: true,
            profile: { select: { photoUrl: true } },
          },
        },
      },
    });

    const studentMap = new Map(students.map((s) => [s.id, s]));

    const detectedFaceResults: DetectedFaceResult[] = session.detectedFaces.map((face) => {
      const studentId = face.overrideStudentId || face.matchedStudentId;
      const student = studentId ? studentMap.get(studentId) : null;

      return {
        id: face.id,
        boundingBox: face.boundingBox as unknown as BoundingBox,
        matchedStudent: student
          ? {
              id: student.id,
              name: student.user?.name || 'Unknown',
              rollNo: student.rollNo,
              photoUrl: student.user?.profile?.photoUrl ?? undefined,
            }
          : undefined,
        matchConfidence: face.matchConfidence ?? undefined,
        status: face.status as DetectedFaceStatus,
        attendanceStatus: face.attendanceStatus as AttendanceStatus,
      };
    });

    return this.mapSessionToResult(session, detectedFaceResults);
  }

  /**
   * Query sessions with filters
   */
  async querySessions(tenantId: string, query: QuerySessionsDto) {
    const where: any = { tenantId };

    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.section) where.section = query.section;
    if (query.status) where.status = query.status;
    if (query.createdBy) where.createdBy = query.createdBy;

    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
      if (query.dateTo) where.date.lte = new Date(query.dateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.attendanceSession.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit || 20,
        skip: query.offset || 0,
      }),
      this.prisma.attendanceSession.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Update a detected face
   */
  async updateDetectedFace(
    tenantId: string,
    faceId: string,
    dto: UpdateDetectedFaceDto,
  ) {
    const face = await this.prisma.detectedFace.findFirst({
      where: { id: faceId, tenantId },
    });

    if (!face) {
      throw new NotFoundException('Detected face not found');
    }

    return this.prisma.detectedFace.update({
      where: { id: faceId },
      data: {
        overrideStudentId: dto.overrideStudentId,
        status: dto.status,
        attendanceStatus: dto.attendanceStatus,
      },
    });
  }

  /**
   * Bulk update detected faces
   */
  async bulkUpdateFaces(tenantId: string, dto: BulkUpdateFacesDto) {
    const results = [];

    for (const update of dto.updates) {
      const face = await this.prisma.detectedFace.findFirst({
        where: { id: update.detectedFaceId, tenantId },
      });

      if (face) {
        const updated = await this.prisma.detectedFace.update({
          where: { id: update.detectedFaceId },
          data: {
            overrideStudentId: update.overrideStudentId,
            status: update.overrideStudentId
              ? DetectedFaceStatus.MANUAL_OVERRIDE
              : face.status,
            attendanceStatus: update.attendanceStatus,
          },
        });
        results.push(updated);
      }
    }

    return { updated: results.length };
  }

  /**
   * Get attendance statistics
   */
  async getAttendanceStats(tenantId: string): Promise<AttendanceStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalSessions, todaySessions, recentSessions] = await Promise.all([
      this.prisma.attendanceSession.count({
        where: { tenantId, status: SessionStatus.CONFIRMED },
      }),
      this.prisma.attendanceSession.count({
        where: {
          tenantId,
          status: SessionStatus.CONFIRMED,
          date: { gte: today },
        },
      }),
      this.prisma.attendanceSession.findMany({
        where: { tenantId, status: SessionStatus.CONFIRMED },
        select: { matchedFaces: true, totalFacesDetected: true, departmentId: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);

    // Calculate average match rate
    const totalMatched = recentSessions.reduce((sum, s) => sum + s.matchedFaces, 0);
    const totalDetected = recentSessions.reduce((sum, s) => sum + s.totalFacesDetected, 0);
    const averageMatchRate = totalDetected > 0 ? (totalMatched / totalDetected) * 100 : 0;

    // Total students marked via face recognition
    const totalStudentsMarked = await this.prisma.studentAttendance.count({
      where: { tenantId, markedByType: 'face_recognition' },
    });

    // Stats by department
    const departments = await this.prisma.department.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    });

    const byDepartment = await Promise.all(
      departments.map(async (dept) => {
        const deptSessions = recentSessions.filter((s) => s.departmentId === dept.id);
        const matched = deptSessions.reduce((sum, s) => sum + s.matchedFaces, 0);
        const detected = deptSessions.reduce((sum, s) => sum + s.totalFacesDetected, 0);

        return {
          departmentId: dept.id,
          departmentName: dept.name,
          sessions: deptSessions.length,
          averageMatchRate: detected > 0 ? (matched / detected) * 100 : 0,
        };
      }),
    );

    return {
      totalSessions,
      todaySessions,
      averageMatchRate,
      totalStudentsMarked,
      byDepartment,
    };
  }

  /**
   * Get students in a section for face matching suggestions
   */
  async getSectionStudents(
    tenantId: string,
    departmentId?: string,
    section?: string,
  ) {
    const where: any = { tenantId, status: 'active' };
    if (departmentId) where.departmentId = departmentId;
    if (section) where.section = section;

    return this.prisma.student.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            profile: { select: { photoUrl: true } },
          },
        },
        faceEnrollment: { select: { status: true } },
      },
      orderBy: { rollNo: 'asc' },
    });
  }

  // ============ Helper Methods ============

  private mapSessionToResult(
    session: any,
    detectedFaces: DetectedFaceResult[],
  ): SessionResult {
    return {
      id: session.id,
      status: session.status as SessionStatus,
      totalFacesDetected: session.totalFacesDetected,
      matchedFaces: session.matchedFaces,
      unmatchedFaces: session.unmatchedFaces,
      detectedFaces,
      classPhotoUrl: session.classPhotoUrl,
      date: session.date.toISOString(),
    };
  }
}
