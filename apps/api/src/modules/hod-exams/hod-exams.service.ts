import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  QueryExamsDto,
  ScheduleExamDto,
  UpdateExamDto,
  UpdateExamStatusDto,
  ExamStatus,
  ExamType,
} from './dto/hod-exams.dto';

@Injectable()
export class HodExamsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get HoD's department ID from their staff record
   */
  private async getHodDepartment(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
        role: 'hod',
      },
      include: {
        staff: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!user || !user.staff || !user.staff.departmentId) {
      throw new ForbiddenException('User is not an HoD or has no department assigned');
    }

    return {
      staffId: user.staff.id,
      departmentId: user.staff.departmentId,
      department: user.staff.department,
    };
  }

  /**
   * Get exams overview for the HoD's department
   */
  async getExamsOverview(tenantId: string, userId: string, query: QueryExamsDto) {
    const { departmentId, department } = await this.getHodDepartment(tenantId, userId);

    // Get courses for the department
    const courses = await this.prisma.course.findMany({
      where: { tenantId, departmentId },
    });
    const courseIds = courses.map((c) => c.id);

    // Get subjects for the department
    const subjectWhere: any = {
      tenantId,
      courseId: { in: courseIds },
    };

    if (query.semester) {
      subjectWhere.semester = parseInt(query.semester);
    }

    const subjects = await this.prisma.subject.findMany({
      where: subjectWhere,
    });
    const subjectIds = subjects.map((s) => s.id);

    // Build exam query
    const examWhere: any = {
      tenantId,
      subjectId: { in: subjectIds },
    };

    if (query.status) {
      examWhere.status = query.status;
    }

    if (query.type) {
      examWhere.type = query.type;
    }

    if (query.subjectId) {
      examWhere.subjectId = query.subjectId;
    }

    if (query.search) {
      examWhere.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { subject: { name: { contains: query.search, mode: 'insensitive' } } },
        { subject: { code: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    if (query.startDate || query.endDate) {
      examWhere.date = {};
      if (query.startDate) examWhere.date.gte = new Date(query.startDate);
      if (query.endDate) examWhere.date.lte = new Date(query.endDate);
    }

    // Get all exams
    const exams = await this.prisma.exam.findMany({
      where: examWhere,
      include: {
        subject: {
          select: { id: true, code: true, name: true, semester: true },
        },
        _count: {
          select: { examResults: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate stats
    const now = new Date();
    const stats = {
      totalExams: exams.length,
      upcoming: exams.filter((e) => e.status === 'scheduled' && new Date(e.date) > now).length,
      ongoing: exams.filter((e) => e.status === 'ongoing').length,
      completed: exams.filter((e) => e.status === 'completed').length,
      cancelled: exams.filter((e) => e.status === 'cancelled').length,
    };

    // Separate into upcoming and completed
    const upcomingExams = exams
      .filter((e) => e.status === 'scheduled' || e.status === 'ongoing')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 20)
      .map((exam) => this.formatExam(exam));

    const completedExams = exams
      .filter((e) => e.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20)
      .map((exam) => this.formatExam(exam));

    // Get exam types used
    const examTypes = Object.values(ExamType);

    // Get subjects for dropdown
    const subjectsForDropdown = subjects.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      semester: s.semester,
    }));

    return {
      department: { id: department?.id, name: department?.name, code: department?.code },
      stats,
      upcomingExams,
      completedExams,
      examTypes,
      subjects: subjectsForDropdown,
    };
  }

  /**
   * Format exam for response
   */
  private formatExam(exam: any) {
    // Calculate results summary if exam has results
    let avgMarks = 0;
    let passPercentage = 0;

    return {
      id: exam.id,
      code: exam.subject?.code,
      name: exam.subject?.name,
      examName: exam.name,
      type: this.formatExamType(exam.type),
      typeValue: exam.type,
      semester: exam.subject?.semester,
      date: exam.date,
      time: exam.startTime,
      duration: `${exam.durationMinutes} mins`,
      durationMinutes: exam.durationMinutes,
      venue: exam.venue,
      maxMarks: exam.maxMarks,
      passingMarks: exam.passingMarks,
      students: exam._count?.examResults || 0,
      status: exam.status,
      avgMarks,
      passPercentage,
      instructions: exam.instructions,
      isPublished: exam.isPublished,
    };
  }

  /**
   * Format exam type for display
   */
  private formatExamType(type: string): string {
    const typeMap: Record<string, string> = {
      internal_1: 'Internal 1',
      internal_2: 'Internal 2',
      mid_semester: 'Mid-Semester',
      end_semester: 'End-Semester',
      practical: 'Practical',
      assignment: 'Assignment',
      quiz: 'Quiz',
    };
    return typeMap[type] || type;
  }

  /**
   * Schedule a new exam
   */
  async scheduleExam(tenantId: string, userId: string, dto: ScheduleExamDto) {
    const { departmentId } = await this.getHodDepartment(tenantId, userId);

    // Verify subject belongs to HoD's department
    const subject = await this.prisma.subject.findFirst({
      where: {
        id: dto.subjectId,
        tenantId,
        course: { departmentId },
      },
      include: {
        course: true,
      },
    });

    if (!subject) {
      throw new BadRequestException('Subject not found in your department');
    }

    // Check for duplicate exam
    const existingExam = await this.prisma.exam.findFirst({
      where: {
        tenantId,
        subjectId: dto.subjectId,
        type: dto.type,
        date: new Date(dto.date),
        status: { notIn: ['cancelled'] },
      },
    });

    if (existingExam) {
      throw new BadRequestException('An exam of this type is already scheduled for this subject on this date');
    }

    // Create exam
    const exam = await this.prisma.exam.create({
      data: {
        tenantId,
        subjectId: dto.subjectId,
        name: dto.name,
        type: dto.type,
        date: new Date(dto.date),
        startTime: dto.startTime,
        durationMinutes: dto.durationMinutes,
        maxMarks: dto.maxMarks,
        passingMarks: dto.passingMarks,
        venue: dto.venue,
        instructions: dto.instructions,
        status: dto.isPublished ? ExamStatus.SCHEDULED : ExamStatus.DRAFT,
        isPublished: dto.isPublished || false,
        createdById: userId,
      },
      include: {
        subject: {
          select: { code: true, name: true },
        },
      },
    });

    return {
      message: 'Exam scheduled successfully',
      exam: this.formatExam(exam),
    };
  }

  /**
   * Update an exam
   */
  async updateExam(tenantId: string, userId: string, examId: string, dto: UpdateExamDto) {
    const { departmentId } = await this.getHodDepartment(tenantId, userId);

    // Verify exam belongs to HoD's department
    const exam = await this.prisma.exam.findFirst({
      where: {
        id: examId,
        tenantId,
        subject: {
          course: { departmentId },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found in your department');
    }

    if (exam.status === 'completed') {
      throw new BadRequestException('Cannot update a completed exam');
    }

    // Update exam
    const updatedExam = await this.prisma.exam.update({
      where: { id: examId },
      data: {
        name: dto.name,
        date: dto.date ? new Date(dto.date) : undefined,
        startTime: dto.startTime,
        durationMinutes: dto.durationMinutes,
        maxMarks: dto.maxMarks,
        passingMarks: dto.passingMarks,
        venue: dto.venue,
        instructions: dto.instructions,
        status: dto.status,
        isPublished: dto.isPublished,
      },
      include: {
        subject: {
          select: { code: true, name: true },
        },
      },
    });

    return {
      message: 'Exam updated successfully',
      exam: this.formatExam(updatedExam),
    };
  }

  /**
   * Update exam status
   */
  async updateExamStatus(tenantId: string, userId: string, examId: string, dto: UpdateExamStatusDto) {
    const { departmentId } = await this.getHodDepartment(tenantId, userId);

    // Verify exam belongs to HoD's department
    const exam = await this.prisma.exam.findFirst({
      where: {
        id: examId,
        tenantId,
        subject: {
          course: { departmentId },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found in your department');
    }

    // Update status
    const updatedExam = await this.prisma.exam.update({
      where: { id: examId },
      data: {
        status: dto.status,
        // Add cancellation/postponement reason if provided
        ...(dto.reason && (dto.status === 'cancelled' || dto.status === 'postponed')
          ? { instructions: `${exam.instructions || ''}\n\n[${dto.status.toUpperCase()}]: ${dto.reason}`.trim() }
          : {}),
      },
      include: {
        subject: {
          select: { code: true, name: true },
        },
      },
    });

    return {
      message: `Exam ${dto.status} successfully`,
      exam: this.formatExam(updatedExam),
    };
  }

  /**
   * Delete an exam (only draft or cancelled)
   */
  async deleteExam(tenantId: string, userId: string, examId: string) {
    const { departmentId } = await this.getHodDepartment(tenantId, userId);

    // Verify exam belongs to HoD's department
    const exam = await this.prisma.exam.findFirst({
      where: {
        id: examId,
        tenantId,
        subject: {
          course: { departmentId },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found in your department');
    }

    if (!['draft', 'cancelled'].includes(exam.status)) {
      throw new BadRequestException('Can only delete draft or cancelled exams');
    }

    await this.prisma.exam.delete({
      where: { id: examId },
    });

    return { message: 'Exam deleted successfully' };
  }

  /**
   * Get exam by ID with results
   */
  async getExamById(tenantId: string, userId: string, examId: string) {
    const { departmentId } = await this.getHodDepartment(tenantId, userId);

    const exam = await this.prisma.exam.findFirst({
      where: {
        id: examId,
        tenantId,
        subject: {
          course: { departmentId },
        },
      },
      include: {
        subject: {
          select: { id: true, code: true, name: true, semester: true },
        },
        examResults: {
          include: {
            student: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
          orderBy: { marksObtained: 'desc' },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found in your department');
    }

    // Calculate results statistics
    const results = exam.examResults;
    const totalStudents = results.length;
    const passedStudents = results.filter((r) => r.marksObtained >= exam.passingMarks).length;
    const avgMarks = totalStudents > 0
      ? Math.round((results.reduce((sum, r) => sum + r.marksObtained, 0) / totalStudents) * 10) / 10
      : 0;
    const passPercentage = totalStudents > 0
      ? Math.round((passedStudents / totalStudents) * 1000) / 10
      : 0;

    // Grade distribution
    const gradeDistribution = this.calculateGradeDistribution(results, exam.maxMarks);

    return {
      ...this.formatExam({ ...exam, _count: { examResults: totalStudents } }),
      avgMarks,
      passPercentage,
      totalStudents,
      passedStudents,
      failedStudents: totalStudents - passedStudents,
      gradeDistribution,
      results: results.map((r) => ({
        id: r.id,
        studentId: r.studentId,
        studentName: r.student?.user?.name || 'Unknown',
        rollNo: r.student?.rollNo,
        marksObtained: r.marksObtained,
        grade: this.calculateGrade(r.marksObtained, exam.maxMarks),
        isPassed: r.marksObtained >= exam.passingMarks,
      })),
    };
  }

  /**
   * Calculate grade distribution
   */
  private calculateGradeDistribution(results: any[], maxMarks: number) {
    const distribution = {
      A: 0, // 90%+
      B: 0, // 80-89%
      C: 0, // 70-79%
      D: 0, // 60-69%
      E: 0, // 50-59%
      F: 0, // <50%
    };

    results.forEach((r) => {
      const percentage = (r.marksObtained / maxMarks) * 100;
      if (percentage >= 90) distribution.A++;
      else if (percentage >= 80) distribution.B++;
      else if (percentage >= 70) distribution.C++;
      else if (percentage >= 60) distribution.D++;
      else if (percentage >= 50) distribution.E++;
      else distribution.F++;
    });

    return distribution;
  }

  /**
   * Calculate grade based on marks
   */
  private calculateGrade(marks: number, maxMarks: number): string {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    if (percentage >= 50) return 'E';
    return 'F';
  }

  /**
   * Get exam statistics for analytics
   */
  async getExamStats(tenantId: string, userId: string) {
    const { departmentId, department } = await this.getHodDepartment(tenantId, userId);

    // Get courses for the department
    const courses = await this.prisma.course.findMany({
      where: { tenantId, departmentId },
    });
    const courseIds = courses.map((c) => c.id);

    // Get subjects
    const subjects = await this.prisma.subject.findMany({
      where: { tenantId, courseId: { in: courseIds } },
    });
    const subjectIds = subjects.map((s) => s.id);

    // Get all exams with results
    const exams = await this.prisma.exam.findMany({
      where: {
        tenantId,
        subjectId: { in: subjectIds },
        status: 'completed',
      },
      include: {
        subject: { select: { code: true, name: true, semester: true } },
        examResults: true,
      },
      orderBy: { date: 'desc' },
      take: 50,
    });

    // Calculate stats by semester
    const bySemester = new Map<number, { total: number; avgPass: number; count: number }>();
    exams.forEach((exam) => {
      const semester = exam.subject?.semester || 0;
      const existing = bySemester.get(semester) || { total: 0, avgPass: 0, count: 0 };
      const totalStudents = exam.examResults.length;
      const passed = exam.examResults.filter((r) => r.marksObtained >= exam.passingMarks).length;
      const passRate = totalStudents > 0 ? (passed / totalStudents) * 100 : 0;

      bySemester.set(semester, {
        total: existing.total + totalStudents,
        avgPass: existing.avgPass + passRate,
        count: existing.count + 1,
      });
    });

    const semesterStats = Array.from(bySemester.entries())
      .map(([semester, data]) => ({
        semester,
        students: data.total,
        avgPassRate: data.count > 0 ? Math.round((data.avgPass / data.count) * 10) / 10 : 0,
      }))
      .sort((a, b) => a.semester - b.semester);

    // Calculate stats by exam type
    const byType = new Map<string, { total: number; avgPass: number; count: number }>();
    exams.forEach((exam) => {
      const existing = byType.get(exam.type) || { total: 0, avgPass: 0, count: 0 };
      const totalStudents = exam.examResults.length;
      const passed = exam.examResults.filter((r) => r.marksObtained >= exam.passingMarks).length;
      const passRate = totalStudents > 0 ? (passed / totalStudents) * 100 : 0;

      byType.set(exam.type, {
        total: existing.total + totalStudents,
        avgPass: existing.avgPass + passRate,
        count: existing.count + 1,
      });
    });

    const typeStats = Array.from(byType.entries())
      .map(([type, data]) => ({
        type: this.formatExamType(type),
        typeValue: type,
        exams: data.count,
        avgPassRate: data.count > 0 ? Math.round((data.avgPass / data.count) * 10) / 10 : 0,
      }));

    return {
      department: { id: department?.id, name: department?.name, code: department?.code },
      totalExams: exams.length,
      bySemester: semesterStats,
      byType: typeStats,
    };
  }
}
