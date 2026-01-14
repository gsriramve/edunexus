import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  QueryExamsDto,
  CreateExamDto,
  SaveResultsDto,
  UpdateResultDto,
  SubjectDto,
  ExamDto,
  StudentResultDto,
  ResultStatsDto,
  ExamResultsResponseDto,
  TeacherExamsResponseDto,
  SaveResultsResponseDto,
} from './dto/teacher-results.dto';
import { Decimal } from '@prisma/client/runtime/library';

const EXAM_TYPES = ['internal', 'external', 'practical', 'assignment'];

@Injectable()
export class TeacherResultsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get staff ID for a user (looks up by user ID or Clerk user ID)
   */
  private async getStaffId(tenantId: string, userId: string): Promise<string> {
    // First try to find user by database ID
    let user = await this.prisma.user.findFirst({
      where: { tenantId, id: userId },
      include: {
        staff: true,
      },
    });

    // If not found, try by Clerk ID (for backwards compatibility)
    if (!user) {
      user = await this.prisma.user.findFirst({
        where: { tenantId, clerkUserId: userId },
        include: {
          staff: true,
        },
      });
    }

    if (!user?.staff) {
      throw new ForbiddenException('User is not a staff member');
    }

    return user.staff.id;
  }

  /**
   * Calculate grade based on percentage
   */
  private calculateGrade(marks: number, totalMarks: number): string {
    const percentage = (marks / totalMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 35) return 'D';
    return 'F';
  }

  /**
   * Get exams and subjects for a teacher
   */
  async getTeacherExams(
    tenantId: string,
    userId: string,
    query?: QueryExamsDto,
  ): Promise<TeacherExamsResponseDto> {
    const staffId = await this.getStaffId(tenantId, userId);

    // Get teacher's subject assignments
    const teacherSubjects = await this.prisma.teacherSubject.findMany({
      where: {
        tenantId,
        staffId,
      },
      include: {
        subject: true,
      },
    });

    // Format subjects
    const subjects: SubjectDto[] = teacherSubjects.map((ts) => ({
      id: ts.subject.id,
      code: ts.subject.code,
      name: ts.subject.name,
      section: ts.section,
      teacherSubjectId: ts.id,
    }));

    const subjectIds = teacherSubjects.map((ts) => ts.subjectId);

    // Build exam query
    const examWhere: any = {
      tenantId,
      subjectId: { in: subjectIds },
    };

    if (query?.teacherSubjectId) {
      const ts = teacherSubjects.find((t) => t.id === query.teacherSubjectId);
      if (ts) {
        examWhere.subjectId = ts.subjectId;
      }
    }

    if (query?.type) {
      examWhere.type = query.type;
    }

    // Get exams
    const exams = await this.prisma.exam.findMany({
      where: examWhere,
      include: {
        subject: true,
        _count: {
          select: { results: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Format exams
    const formattedExams: ExamDto[] = exams.map((exam) => ({
      id: exam.id,
      name: exam.name,
      type: exam.type,
      date: exam.date.toISOString().split('T')[0],
      totalMarks: exam.totalMarks,
      subjectId: exam.subjectId,
      subjectCode: exam.subject.code,
      subjectName: exam.subject.name,
      resultsCount: exam._count.results,
    }));

    return {
      subjects,
      examTypes: EXAM_TYPES,
      exams: formattedExams,
    };
  }

  /**
   * Get results for a specific exam
   */
  async getExamResults(
    tenantId: string,
    userId: string,
    examId: string,
  ): Promise<ExamResultsResponseDto> {
    const staffId = await this.getStaffId(tenantId, userId);

    // Get exam with subject
    const exam = await this.prisma.exam.findFirst({
      where: { id: examId, tenantId },
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
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // Verify teacher has access to this subject
    const teacherSubject = await this.prisma.teacherSubject.findFirst({
      where: {
        tenantId,
        staffId,
        subjectId: exam.subjectId,
      },
    });

    if (!teacherSubject) {
      throw new ForbiddenException('You do not have access to this exam');
    }

    // Get students in this class (by department and semester)
    const students = await this.prisma.student.findMany({
      where: {
        tenantId,
        departmentId: exam.subject.course.departmentId,
        semester: exam.subject.semester,
        section: teacherSubject.section || undefined,
        status: 'active',
      },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { rollNo: 'asc' },
    });

    // Get existing results
    const existingResults = await this.prisma.examResult.findMany({
      where: {
        tenantId,
        examId,
      },
    });

    const resultMap = new Map(existingResults.map((r) => [r.studentId, r]));

    // Build results with student info
    const results: StudentResultDto[] = students.map((student) => {
      const result = resultMap.get(student.id);
      const marks = result ? Number(result.marks) : 0;
      const grade = result?.grade || this.calculateGrade(marks, exam.totalMarks);
      const percentage = (marks / exam.totalMarks) * 100;

      return {
        id: result?.id || '',
        studentId: student.id,
        studentName: student.user?.name || 'Unknown',
        rollNo: student.rollNo,
        marks,
        maxMarks: exam.totalMarks,
        grade,
        status: percentage >= 35 ? 'pass' : 'fail',
        remarks: result?.remarks || undefined,
      };
    });

    // Calculate stats
    const resultsWithMarks = results.filter((r) => r.id !== '');
    const stats = this.calculateStats(resultsWithMarks, students.length, exam.totalMarks);

    return {
      exam: {
        id: exam.id,
        name: exam.name,
        type: exam.type,
        date: exam.date.toISOString().split('T')[0],
        totalMarks: exam.totalMarks,
        subjectId: exam.subjectId,
        subjectCode: exam.subject.code,
        subjectName: exam.subject.name,
        resultsCount: resultsWithMarks.length,
      },
      results,
      stats,
    };
  }

  /**
   * Create a new exam
   */
  async createExam(
    tenantId: string,
    userId: string,
    dto: CreateExamDto,
  ): Promise<ExamDto> {
    const staffId = await this.getStaffId(tenantId, userId);

    // Verify teacher subject assignment
    const teacherSubject = await this.prisma.teacherSubject.findFirst({
      where: {
        id: dto.teacherSubjectId,
        tenantId,
        staffId,
      },
      include: {
        subject: true,
      },
    });

    if (!teacherSubject) {
      throw new NotFoundException('Subject assignment not found');
    }

    // Create exam
    const exam = await this.prisma.exam.create({
      data: {
        tenantId,
        subjectId: teacherSubject.subjectId,
        name: dto.name,
        type: dto.type,
        date: new Date(dto.date),
        totalMarks: dto.totalMarks,
      },
      include: {
        subject: true,
      },
    });

    return {
      id: exam.id,
      name: exam.name,
      type: exam.type,
      date: exam.date.toISOString().split('T')[0],
      totalMarks: exam.totalMarks,
      subjectId: exam.subjectId,
      subjectCode: exam.subject.code,
      subjectName: exam.subject.name,
      resultsCount: 0,
    };
  }

  /**
   * Save or update results for an exam
   */
  async saveResults(
    tenantId: string,
    userId: string,
    dto: SaveResultsDto,
  ): Promise<SaveResultsResponseDto> {
    const staffId = await this.getStaffId(tenantId, userId);

    // Get exam
    const exam = await this.prisma.exam.findFirst({
      where: { id: dto.examId, tenantId },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // Verify teacher has access
    const teacherSubject = await this.prisma.teacherSubject.findFirst({
      where: {
        tenantId,
        staffId,
        subjectId: exam.subjectId,
      },
    });

    if (!teacherSubject) {
      throw new ForbiddenException('You do not have access to this exam');
    }

    // Validate marks
    for (const entry of dto.results) {
      if (entry.marks > exam.totalMarks) {
        throw new BadRequestException(
          `Marks (${entry.marks}) cannot exceed total marks (${exam.totalMarks})`,
        );
      }
    }

    // Upsert results
    let savedCount = 0;
    for (const entry of dto.results) {
      const grade = this.calculateGrade(entry.marks, exam.totalMarks);

      await this.prisma.examResult.upsert({
        where: {
          tenantId_examId_studentId: {
            tenantId,
            examId: dto.examId,
            studentId: entry.studentId,
          },
        },
        create: {
          tenantId,
          examId: dto.examId,
          studentId: entry.studentId,
          marks: new Decimal(entry.marks),
          grade,
          remarks: entry.remarks,
        },
        update: {
          marks: new Decimal(entry.marks),
          grade,
          remarks: entry.remarks,
        },
      });
      savedCount++;
    }

    return {
      success: true,
      message: `Results saved for ${savedCount} students`,
      savedCount,
      examId: dto.examId,
    };
  }

  /**
   * Update a single result
   */
  async updateResult(
    tenantId: string,
    userId: string,
    resultId: string,
    dto: UpdateResultDto,
  ) {
    const staffId = await this.getStaffId(tenantId, userId);

    // Get result with exam
    const result = await this.prisma.examResult.findFirst({
      where: { id: resultId, tenantId },
      include: { exam: true },
    });

    if (!result) {
      throw new NotFoundException('Result not found');
    }

    // Verify teacher has access
    const teacherSubject = await this.prisma.teacherSubject.findFirst({
      where: {
        tenantId,
        staffId,
        subjectId: result.exam.subjectId,
      },
    });

    if (!teacherSubject) {
      throw new ForbiddenException('You do not have access to this result');
    }

    // Validate marks
    if (dto.marks > result.exam.totalMarks) {
      throw new BadRequestException(
        `Marks (${dto.marks}) cannot exceed total marks (${result.exam.totalMarks})`,
      );
    }

    const grade = dto.grade || this.calculateGrade(dto.marks, result.exam.totalMarks);

    return this.prisma.examResult.update({
      where: { id: resultId },
      data: {
        marks: new Decimal(dto.marks),
        grade,
        remarks: dto.remarks,
      },
    });
  }

  /**
   * Delete an exam
   */
  async deleteExam(tenantId: string, userId: string, examId: string) {
    const staffId = await this.getStaffId(tenantId, userId);

    const exam = await this.prisma.exam.findFirst({
      where: { id: examId, tenantId },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // Verify teacher has access
    const teacherSubject = await this.prisma.teacherSubject.findFirst({
      where: {
        tenantId,
        staffId,
        subjectId: exam.subjectId,
      },
    });

    if (!teacherSubject) {
      throw new ForbiddenException('You do not have access to this exam');
    }

    // Delete results first
    await this.prisma.examResult.deleteMany({
      where: { examId },
    });

    // Delete exam
    await this.prisma.exam.delete({
      where: { id: examId },
    });
  }

  /**
   * Calculate statistics for results
   */
  private calculateStats(
    results: StudentResultDto[],
    totalStudents: number,
    totalMarks: number,
  ): ResultStatsDto {
    if (results.length === 0) {
      return {
        totalStudents,
        appeared: 0,
        passed: 0,
        failed: 0,
        average: 0,
        highest: 0,
        lowest: 0,
        gradeDistribution: {},
      };
    }

    const marks = results.map((r) => r.marks);
    const passed = results.filter((r) => r.status === 'pass').length;

    // Grade distribution
    const gradeDistribution: Record<string, number> = {};
    for (const result of results) {
      gradeDistribution[result.grade] = (gradeDistribution[result.grade] || 0) + 1;
    }

    return {
      totalStudents,
      appeared: results.length,
      passed,
      failed: results.length - passed,
      average: Math.round((marks.reduce((a, b) => a + b, 0) / marks.length) * 10) / 10,
      highest: Math.max(...marks),
      lowest: Math.min(...marks),
      gradeDistribution,
    };
  }
}
