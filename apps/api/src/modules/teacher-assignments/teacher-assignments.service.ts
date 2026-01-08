import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  QueryAssignmentsDto,
  QuerySubmissionsDto,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  GradeSubmissionDto,
  AssignmentStatsDto,
  AssignmentDto,
  AssignmentDetailDto,
  SubmissionDto,
  AssignmentsResponseDto,
  SubmissionsResponseDto,
  RecentSubmissionsResponseDto,
} from './dto/teacher-assignments.dto';

@Injectable()
export class TeacherAssignmentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get staff ID for a user
   */
  private async getStaffId(tenantId: string, userId: string): Promise<string> {
    const staff = await this.prisma.staff.findFirst({
      where: { tenantId, userId },
    });

    if (!staff) {
      throw new ForbiddenException('User is not a staff member');
    }

    return staff.id;
  }

  /**
   * Get all assignments for a teacher with stats
   */
  async getAssignments(
    tenantId: string,
    userId: string,
    query?: QueryAssignmentsDto,
  ): Promise<AssignmentsResponseDto> {
    const staffId = await this.getStaffId(tenantId, userId);
    const limit = query?.limit || 50;
    const offset = query?.offset || 0;

    // Build where clause
    const where: any = {
      tenantId,
      teacherSubject: { staffId },
    };

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.subjectCode) {
      where.teacherSubject = {
        ...where.teacherSubject,
        subject: { code: query.subjectCode },
      };
    }

    if (query?.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }

    // Get total count
    const total = await this.prisma.assignment.count({ where });

    // Get assignments with related data
    const assignments = await this.prisma.assignment.findMany({
      where,
      include: {
        teacherSubject: {
          include: {
            subject: {
              include: {
                course: {
                  include: {
                    department: true,
                  },
                },
              },
            },
          },
        },
        submissions: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Map to DTOs and get student counts
    const assignmentDtos: AssignmentDto[] = await Promise.all(
      assignments.map(async (a) => {
        // Get total students for this section/semester
        const totalStudents = await this.prisma.student.count({
          where: {
            tenantId,
            departmentId: a.teacherSubject.subject.course.departmentId,
            semester: a.teacherSubject.subject.semester,
            section: a.teacherSubject.section || undefined,
            status: 'active',
          },
        });

        const graded = a.submissions.filter((s: { id: string; status: string }) => s.status === 'graded').length;

        return {
          id: a.id,
          title: a.title,
          description: a.description,
          subjectCode: a.teacherSubject.subject.code,
          subjectName: a.teacherSubject.subject.name,
          section: a.teacherSubject.section,
          dueDate: a.dueDate.toISOString(),
          totalMarks: a.totalMarks,
          submissions: a.submissions.length,
          totalStudents,
          graded,
          status: a.status,
          allowLateSubmission: a.allowLateSubmission,
          latePenaltyPercent: a.latePenaltyPercent,
          createdAt: a.createdAt.toISOString(),
        };
      }),
    );

    // Calculate stats
    const allAssignments = await this.prisma.assignment.findMany({
      where: {
        tenantId,
        teacherSubject: { staffId },
      },
      include: {
        submissions: {
          select: { id: true, status: true },
        },
        teacherSubject: {
          include: {
            subject: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    let totalPendingGrading = 0;
    let totalSubmissionRate = 0;

    for (const a of allAssignments) {
      const pendingCount = a.submissions.filter((s: { id: string; status: string }) => s.status !== 'graded').length;
      totalPendingGrading += pendingCount;

      const studentCount = await this.prisma.student.count({
        where: {
          tenantId,
          departmentId: a.teacherSubject.subject.course.departmentId,
          semester: a.teacherSubject.subject.semester,
          section: a.teacherSubject.section || undefined,
          status: 'active',
        },
      });

      if (studentCount > 0) {
        totalSubmissionRate += (a.submissions.length / studentCount) * 100;
      }
    }

    const stats: AssignmentStatsDto = {
      total: allAssignments.length,
      active: allAssignments.filter((a: { status: string }) => a.status === 'active').length,
      completed: allAssignments.filter((a: { status: string }) => a.status === 'completed').length,
      draft: allAssignments.filter((a: { status: string }) => a.status === 'draft').length,
      pendingGrading: totalPendingGrading,
      avgSubmissionRate: allAssignments.length > 0
        ? Math.round(totalSubmissionRate / allAssignments.length)
        : 0,
    };

    return {
      stats,
      assignments: assignmentDtos,
      total,
    };
  }

  /**
   * Get a single assignment with full details
   */
  async getAssignment(
    tenantId: string,
    userId: string,
    assignmentId: string,
  ): Promise<AssignmentDetailDto> {
    const staffId = await this.getStaffId(tenantId, userId);

    const assignment = await this.prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        tenantId,
        teacherSubject: { staffId },
      },
      include: {
        teacherSubject: {
          include: {
            subject: {
              include: {
                course: {
                  include: {
                    department: true,
                  },
                },
              },
            },
          },
        },
        submissions: {
          select: { id: true, status: true },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const totalStudents = await this.prisma.student.count({
      where: {
        tenantId,
        departmentId: assignment.teacherSubject.subject.course.departmentId,
        semester: assignment.teacherSubject.subject.semester,
        section: assignment.teacherSubject.section || undefined,
        status: 'active',
      },
    });

    const graded = assignment.submissions.filter((s: { id: string; status: string }) => s.status === 'graded').length;

    return {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions,
      subjectCode: assignment.teacherSubject.subject.code,
      subjectName: assignment.teacherSubject.subject.name,
      section: assignment.teacherSubject.section,
      dueDate: assignment.dueDate.toISOString(),
      totalMarks: assignment.totalMarks,
      submissions: assignment.submissions.length,
      totalStudents,
      graded,
      status: assignment.status,
      allowLateSubmission: assignment.allowLateSubmission,
      latePenaltyPercent: assignment.latePenaltyPercent,
      attachments: assignment.attachments as any[] || [],
      teacherSubjectId: assignment.teacherSubjectId,
      createdAt: assignment.createdAt.toISOString(),
    };
  }

  /**
   * Create a new assignment
   */
  async createAssignment(
    tenantId: string,
    userId: string,
    dto: CreateAssignmentDto,
  ) {
    const staffId = await this.getStaffId(tenantId, userId);

    // Verify the teacher-subject assignment belongs to this teacher
    const teacherSubject = await this.prisma.teacherSubject.findFirst({
      where: {
        id: dto.teacherSubjectId,
        tenantId,
        staffId,
      },
    });

    if (!teacherSubject) {
      throw new NotFoundException('Subject assignment not found or not assigned to you');
    }

    const assignment = await this.prisma.assignment.create({
      data: {
        tenantId,
        teacherSubjectId: dto.teacherSubjectId,
        title: dto.title,
        description: dto.description,
        instructions: dto.instructions,
        totalMarks: dto.totalMarks,
        dueDate: new Date(dto.dueDate),
        status: dto.status || 'draft',
        attachments: dto.attachments || [],
        allowLateSubmission: dto.allowLateSubmission ?? false,
        latePenaltyPercent: dto.latePenaltyPercent,
      },
      include: {
        teacherSubject: {
          include: {
            subject: true,
          },
        },
      },
    });

    return assignment;
  }

  /**
   * Update an assignment
   */
  async updateAssignment(
    tenantId: string,
    userId: string,
    assignmentId: string,
    dto: UpdateAssignmentDto,
  ) {
    const staffId = await this.getStaffId(tenantId, userId);

    // Verify ownership
    const assignment = await this.prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        tenantId,
        teacherSubject: { staffId },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return this.prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        title: dto.title,
        description: dto.description,
        instructions: dto.instructions,
        totalMarks: dto.totalMarks,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status: dto.status,
        attachments: dto.attachments,
        allowLateSubmission: dto.allowLateSubmission,
        latePenaltyPercent: dto.latePenaltyPercent,
      },
    });
  }

  /**
   * Delete an assignment
   */
  async deleteAssignment(
    tenantId: string,
    userId: string,
    assignmentId: string,
  ) {
    const staffId = await this.getStaffId(tenantId, userId);

    // Verify ownership
    const assignment = await this.prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        tenantId,
        teacherSubject: { staffId },
      },
      include: {
        submissions: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Warn if there are submissions
    if (assignment.submissions.length > 0) {
      throw new BadRequestException(
        `Cannot delete assignment with ${assignment.submissions.length} submissions. Archive it instead.`
      );
    }

    return this.prisma.assignment.delete({
      where: { id: assignmentId },
    });
  }

  /**
   * Get submissions for an assignment
   */
  async getAssignmentSubmissions(
    tenantId: string,
    userId: string,
    assignmentId: string,
    query?: QuerySubmissionsDto,
  ): Promise<SubmissionsResponseDto> {
    const staffId = await this.getStaffId(tenantId, userId);
    const limit = query?.limit || 100;
    const offset = query?.offset || 0;

    // Verify ownership
    const assignment = await this.prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        tenantId,
        teacherSubject: { staffId },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Build where clause
    const where: any = {
      tenantId,
      assignmentId,
    };

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.search) {
      where.student = {
        OR: [
          { rollNo: { contains: query.search, mode: 'insensitive' } },
          { user: { name: { contains: query.search, mode: 'insensitive' } } },
        ],
      };
    }

    const total = await this.prisma.assignmentSubmission.count({ where });

    const submissions = await this.prisma.assignmentSubmission.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        assignment: {
          select: { title: true, totalMarks: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const submissionDtos: SubmissionDto[] = submissions.map((s: any) => ({
      id: s.id,
      studentId: s.studentId,
      studentName: s.student.user?.name || 'Unknown',
      rollNo: s.student.rollNo,
      assignmentId: s.assignmentId,
      assignmentTitle: s.assignment.title,
      submittedAt: s.submittedAt.toISOString(),
      status: s.status,
      marks: s.marks ? Number(s.marks) : null,
      totalMarks: s.assignment.totalMarks,
      feedback: s.feedback,
      files: s.files as any[] || [],
    }));

    const graded = submissions.filter((s: { status: string }) => s.status === 'graded').length;
    const pending = total - graded;

    return {
      submissions: submissionDtos,
      total,
      graded,
      pending,
    };
  }

  /**
   * Get recent submissions across all assignments for a teacher
   */
  async getRecentSubmissions(
    tenantId: string,
    userId: string,
    query?: QuerySubmissionsDto,
  ): Promise<RecentSubmissionsResponseDto> {
    const staffId = await this.getStaffId(tenantId, userId);
    const limit = query?.limit || 20;
    const offset = query?.offset || 0;

    // Build where clause
    const where: any = {
      tenantId,
      assignment: {
        teacherSubject: { staffId },
      },
    };

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.search) {
      where.OR = [
        { student: { rollNo: { contains: query.search, mode: 'insensitive' } } },
        { student: { user: { name: { contains: query.search, mode: 'insensitive' } } } },
        { assignment: { title: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const total = await this.prisma.assignmentSubmission.count({ where });

    const submissions = await this.prisma.assignmentSubmission.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        assignment: {
          select: { title: true, totalMarks: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const submissionDtos: SubmissionDto[] = submissions.map((s: any) => ({
      id: s.id,
      studentId: s.studentId,
      studentName: s.student.user?.name || 'Unknown',
      rollNo: s.student.rollNo,
      assignmentId: s.assignmentId,
      assignmentTitle: s.assignment.title,
      submittedAt: s.submittedAt.toISOString(),
      status: s.status,
      marks: s.marks ? Number(s.marks) : null,
      totalMarks: s.assignment.totalMarks,
      feedback: s.feedback,
      files: s.files as any[] || [],
    }));

    return {
      submissions: submissionDtos,
      total,
    };
  }

  /**
   * Grade a submission
   */
  async gradeSubmission(
    tenantId: string,
    userId: string,
    submissionId: string,
    dto: GradeSubmissionDto,
  ) {
    const staffId = await this.getStaffId(tenantId, userId);

    // Verify ownership
    const submission = await this.prisma.assignmentSubmission.findFirst({
      where: {
        id: submissionId,
        tenantId,
        assignment: {
          teacherSubject: { staffId },
        },
      },
      include: {
        assignment: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Validate marks
    if (dto.marks > submission.assignment.totalMarks) {
      throw new BadRequestException(
        `Marks cannot exceed total marks (${submission.assignment.totalMarks})`
      );
    }

    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        marks: dto.marks,
        feedback: dto.feedback,
        status: 'graded',
        gradedAt: new Date(),
        gradedBy: staffId,
      },
    });
  }

  /**
   * Get teacher's subjects for dropdown
   */
  async getTeacherSubjects(tenantId: string, userId: string) {
    const staffId = await this.getStaffId(tenantId, userId);

    // Get current academic year
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const academicYearStart = currentMonth >= 7 ? currentYear : currentYear - 1;
    const academicYear = `${academicYearStart}-${academicYearStart + 1}`;

    const teacherSubjects = await this.prisma.teacherSubject.findMany({
      where: {
        tenantId,
        staffId,
        academicYear,
      },
      include: {
        subject: true,
      },
      orderBy: { subject: { name: 'asc' } },
    });

    return teacherSubjects.map((ts) => ({
      id: ts.id,
      subjectId: ts.subjectId,
      subjectCode: ts.subject.code,
      subjectName: ts.subject.name,
      section: ts.section,
      semester: ts.subject.semester,
    }));
  }
}
