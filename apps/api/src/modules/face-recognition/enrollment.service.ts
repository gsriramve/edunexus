import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RekognitionService } from './rekognition.service';
import {
  EnrollStudentDto,
  BulkEnrollDto,
  QueryEnrollmentsDto,
  EnrollmentStatus,
  EnrollmentResult,
  EnrollmentStats,
} from './dto/face-recognition.dto';

@Injectable()
export class EnrollmentService {
  private readonly logger = new Logger(EnrollmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rekognition: RekognitionService,
  ) {}

  /**
   * Enroll a student's face in the recognition system
   */
  async enrollStudent(
    tenantId: string,
    dto: EnrollStudentDto,
    enrolledBy: string,
  ): Promise<EnrollmentResult> {
    // Verify student exists
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, tenantId },
      include: { user: { select: { name: true } } },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check if already enrolled
    const existing = await this.prisma.faceEnrollment.findUnique({
      where: { studentId: dto.studentId },
    });

    if (existing && existing.status === EnrollmentStatus.ACTIVE) {
      throw new ConflictException('Student is already enrolled in face recognition');
    }

    const collectionId = this.rekognition.getCollectionId(tenantId);

    try {
      // Ensure collection exists
      await this.rekognition.createCollection(collectionId);

      // Prepare image source
      const imageSource = dto.imageBase64
        ? { bytes: Buffer.from(dto.imageBase64, 'base64') }
        : { url: dto.imageUrl };

      // Index face in AWS Rekognition
      const indexResult = await this.rekognition.indexFace(
        collectionId,
        imageSource,
        dto.studentId,
      );

      if (!indexResult) {
        throw new BadRequestException('Failed to index face - no face detected');
      }

      // Create or update enrollment record
      const enrollment = await this.prisma.faceEnrollment.upsert({
        where: { studentId: dto.studentId },
        create: {
          tenantId,
          studentId: dto.studentId,
          collectionId,
          faceId: indexResult.faceId,
          sourceImageUrl: dto.imageUrl,
          enrollmentQuality: indexResult.quality,
          status: EnrollmentStatus.ACTIVE,
          enrolledAt: new Date(),
          enrolledBy,
        },
        update: {
          faceId: indexResult.faceId,
          sourceImageUrl: dto.imageUrl,
          enrollmentQuality: indexResult.quality,
          status: EnrollmentStatus.ACTIVE,
          enrolledAt: new Date(),
          enrolledBy,
          failureReason: null,
        },
      });

      this.logger.log(`Enrolled student ${dto.studentId} with face ID ${indexResult.faceId}`);

      return {
        studentId: dto.studentId,
        success: true,
        faceId: indexResult.faceId,
        quality: indexResult.quality,
      };
    } catch (error: any) {
      // Record failure
      await this.prisma.faceEnrollment.upsert({
        where: { studentId: dto.studentId },
        create: {
          tenantId,
          studentId: dto.studentId,
          collectionId,
          faceId: '',
          sourceImageUrl: dto.imageUrl,
          status: EnrollmentStatus.FAILED,
          failureReason: error.message,
        },
        update: {
          status: EnrollmentStatus.FAILED,
          failureReason: error.message,
        },
      });

      this.logger.error(`Failed to enroll student ${dto.studentId}: ${error.message}`);

      return {
        studentId: dto.studentId,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Bulk enroll multiple students
   */
  async bulkEnroll(
    tenantId: string,
    dto: BulkEnrollDto,
    enrolledBy: string,
  ): Promise<{
    total: number;
    successful: number;
    failed: number;
    results: EnrollmentResult[];
  }> {
    const results: EnrollmentResult[] = [];

    for (const enrollment of dto.enrollments) {
      const result = await this.enrollStudent(tenantId, enrollment, enrolledBy);
      results.push(result);
    }

    const successful = results.filter((r) => r.success).length;

    return {
      total: dto.enrollments.length,
      successful,
      failed: dto.enrollments.length - successful,
      results,
    };
  }

  /**
   * Re-enroll a student (update their face)
   */
  async reEnrollStudent(
    tenantId: string,
    studentId: string,
    imageUrl: string,
    enrolledBy: string,
  ): Promise<EnrollmentResult> {
    // Get existing enrollment
    const existing = await this.prisma.faceEnrollment.findFirst({
      where: { studentId, tenantId },
    });

    if (existing && existing.faceId) {
      // Delete old face from collection
      try {
        await this.rekognition.deleteFace(existing.collectionId, existing.faceId);
      } catch (error) {
        this.logger.warn(`Failed to delete old face: ${error}`);
      }
    }

    // Enroll with new image
    return this.enrollStudent(tenantId, { studentId, imageUrl }, enrolledBy);
  }

  /**
   * Remove a student's face enrollment
   */
  async unenrollStudent(tenantId: string, studentId: string): Promise<void> {
    const enrollment = await this.prisma.faceEnrollment.findFirst({
      where: { studentId, tenantId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Delete face from AWS collection
    if (enrollment.faceId) {
      try {
        await this.rekognition.deleteFace(enrollment.collectionId, enrollment.faceId);
      } catch (error) {
        this.logger.warn(`Failed to delete face from AWS: ${error}`);
      }
    }

    // Delete enrollment record
    await this.prisma.faceEnrollment.delete({
      where: { id: enrollment.id },
    });

    this.logger.log(`Unenrolled student ${studentId}`);
  }

  /**
   * Get enrollment by student ID
   */
  async getEnrollment(tenantId: string, studentId: string) {
    const enrollment = await this.prisma.faceEnrollment.findFirst({
      where: { studentId, tenantId },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return enrollment;
  }

  /**
   * Query enrollments with filters
   */
  async queryEnrollments(tenantId: string, query: QueryEnrollmentsDto) {
    const where: any = { tenantId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.departmentId) {
      where.student = { departmentId: query.departmentId };
    }

    if (query.search) {
      where.OR = [
        { student: { rollNo: { contains: query.search, mode: 'insensitive' } } },
        { student: { user: { name: { contains: query.search, mode: 'insensitive' } } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.faceEnrollment.findMany({
        where,
        include: {
          student: {
            include: {
              user: { select: { name: true } },
              department: { select: { id: true, name: true, code: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: query.limit || 50,
        skip: query.offset || 0,
      }),
      this.prisma.faceEnrollment.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Get enrollment statistics
   */
  async getEnrollmentStats(tenantId: string): Promise<EnrollmentStats> {
    // Get counts by status
    const statusCounts = await this.prisma.faceEnrollment.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: true,
    });

    const stats = {
      total: 0,
      active: 0,
      pending: 0,
      failed: 0,
    };

    statusCounts.forEach((item) => {
      stats.total += item._count;
      switch (item.status) {
        case EnrollmentStatus.ACTIVE:
          stats.active = item._count;
          break;
        case EnrollmentStatus.PENDING:
          stats.pending = item._count;
          break;
        case EnrollmentStatus.FAILED:
          stats.failed = item._count;
          break;
      }
    });

    // Get by department
    const departments = await this.prisma.department.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    });

    const byDepartment = await Promise.all(
      departments.map(async (dept) => {
        const [enrolled, totalStudents] = await Promise.all([
          this.prisma.faceEnrollment.count({
            where: {
              tenantId,
              status: EnrollmentStatus.ACTIVE,
              student: { departmentId: dept.id },
            },
          }),
          this.prisma.student.count({
            where: { tenantId, departmentId: dept.id, status: 'active' },
          }),
        ]);

        return {
          departmentId: dept.id,
          departmentName: dept.name,
          enrolled,
          total: totalStudents,
          percentage: totalStudents > 0 ? (enrolled / totalStudents) * 100 : 0,
        };
      }),
    );

    return { ...stats, byDepartment };
  }

  /**
   * Get students not yet enrolled
   */
  async getUnenrolledStudents(
    tenantId: string,
    departmentId?: string,
    limit: number = 50,
  ) {
    const where: any = {
      tenantId,
      status: 'active',
      faceEnrollment: null,
    };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    return this.prisma.student.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        department: { select: { id: true, name: true, code: true } },
      },
      take: limit,
      orderBy: { rollNo: 'asc' },
    });
  }

  /**
   * Check if a student is enrolled
   */
  async isEnrolled(tenantId: string, studentId: string): Promise<boolean> {
    const enrollment = await this.prisma.faceEnrollment.findFirst({
      where: {
        tenantId,
        studentId,
        status: EnrollmentStatus.ACTIVE,
      },
    });

    return !!enrollment;
  }

  /**
   * Get face ID for a student
   */
  async getFaceId(tenantId: string, studentId: string): Promise<string | null> {
    const enrollment = await this.prisma.faceEnrollment.findFirst({
      where: {
        tenantId,
        studentId,
        status: EnrollmentStatus.ACTIVE,
      },
      select: { faceId: true },
    });

    return enrollment?.faceId || null;
  }

  /**
   * Map face IDs to student IDs for a tenant
   */
  async getFaceIdToStudentMap(tenantId: string): Promise<Map<string, string>> {
    const enrollments = await this.prisma.faceEnrollment.findMany({
      where: { tenantId, status: EnrollmentStatus.ACTIVE },
      select: { faceId: true, studentId: true },
    });

    return new Map(enrollments.map((e) => [e.faceId, e.studentId]));
  }
}
