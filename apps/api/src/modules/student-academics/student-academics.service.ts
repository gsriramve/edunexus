import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StudentAcademicsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get student's enrolled subjects for a semester
   */
  async getSubjects(tenantId: string, studentId: string, semester?: number) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: {
        user: { select: { name: true } },
        department: { select: { id: true, name: true, code: true } },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Use provided semester or student's current semester
    const targetSemester = semester ?? student.semester;

    // Get courses for the student's department
    const courses = await this.prisma.course.findMany({
      where: {
        tenantId,
        departmentId: student.departmentId,
      },
      select: { id: true },
    });

    const courseIds = courses.map((c) => c.id);

    // Get subjects for those courses and semester
    const subjects = await this.prisma.subject.findMany({
      where: {
        tenantId,
        courseId: { in: courseIds },
        semester: targetSemester,
      },
      include: {
        teacherSubjects: {
          where: { tenantId },
          include: {
            staff: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
          take: 1,
        },
      },
      orderBy: { code: 'asc' },
    });

    // Get exam results for calculating progress
    const examResults = await this.prisma.examResult.findMany({
      where: {
        tenantId,
        studentId,
        exam: {
          subject: { semester: targetSemester },
        },
      },
      include: {
        exam: {
          include: {
            subject: true,
          },
        },
      },
    });

    // Calculate results by subject
    const resultsBySubject = new Map<string, { examsCompleted: number; avgScore: number }>();
    for (const result of examResults) {
      const subjectId = result.exam.subjectId;
      if (!resultsBySubject.has(subjectId)) {
        resultsBySubject.set(subjectId, { examsCompleted: 0, avgScore: 0 });
      }
      const stats = resultsBySubject.get(subjectId)!;
      const percentage = (Number(result.marks) / result.exam.totalMarks) * 100;
      stats.avgScore = (stats.avgScore * stats.examsCompleted + percentage) / (stats.examsCompleted + 1);
      stats.examsCompleted++;
    }

    // Transform subjects
    const transformedSubjects = subjects.map((subject) => {
      const results = resultsBySubject.get(subject.id) || { examsCompleted: 0, avgScore: 0 };

      // Calculate syllabus progress based on exam completion (rough estimation)
      const estimatedProgress = Math.min(100, results.examsCompleted * 25);

      // Get primary teacher
      const primaryTeacher = subject.teacherSubjects[0];
      const teacherName = primaryTeacher?.staff?.user?.name || 'TBA';

      // Default attendance to 85% if no attendance records (simplified)
      const attendance = 85;

      return {
        id: subject.id,
        code: subject.code,
        name: subject.name,
        credits: subject.credits,
        type: subject.isLab ? 'Lab' : 'Theory',
        teacher: teacherName,
        attendance,
        progress: estimatedProgress,
        examsCompleted: results.examsCompleted,
        avgScore: Math.round(results.avgScore * 10) / 10,
      };
    });

    // Calculate semester progress
    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    const avgProgress = transformedSubjects.length > 0
      ? Math.round(transformedSubjects.reduce((sum, s) => sum + s.progress, 0) / transformedSubjects.length)
      : 0;

    return {
      student: {
        id: student.id,
        name: student.user.name,
        rollNo: student.rollNo,
        semester: student.semester,
        department: student.department,
      },
      currentSemester: targetSemester,
      subjects: transformedSubjects,
      progress: {
        totalCredits,
        totalSubjects: subjects.length,
        avgProgress,
        avgAttendance: transformedSubjects.length > 0
          ? Math.round(transformedSubjects.reduce((sum, s) => sum + s.attendance, 0) / transformedSubjects.length)
          : 0,
      },
    };
  }

  /**
   * Get academic summary including SGPA calculation
   */
  async getSummary(tenantId: string, studentId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Get all exam results for the student
    const examResults = await this.prisma.examResult.findMany({
      where: { tenantId, studentId },
      include: {
        exam: {
          include: {
            subject: true,
          },
        },
      },
    });

    // Group results by semester
    const resultsBySemester = new Map<number, { totalCredits: number; totalPoints: number }>();

    for (const result of examResults) {
      const semester = result.exam.subject.semester;
      if (!resultsBySemester.has(semester)) {
        resultsBySemester.set(semester, { totalCredits: 0, totalPoints: 0 });
      }

      const stats = resultsBySemester.get(semester)!;
      const percentage = (Number(result.marks) / result.exam.totalMarks) * 100;
      const gradePoints = this.calculateGradePoints(percentage);

      stats.totalCredits += result.exam.subject.credits;
      stats.totalPoints += gradePoints * result.exam.subject.credits;
    }

    // Calculate SGPA for each semester and overall CGPA
    const semesterResults: Array<{ semester: number; sgpa: number; credits: number }> = [];
    let totalCredits = 0;
    let totalPoints = 0;

    resultsBySemester.forEach((stats, semester) => {
      const sgpa = stats.totalCredits > 0
        ? Math.round((stats.totalPoints / stats.totalCredits) * 100) / 100
        : 0;
      semesterResults.push({ semester, sgpa, credits: stats.totalCredits });
      totalCredits += stats.totalCredits;
      totalPoints += stats.totalPoints;
    });

    const cgpa = totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;

    return {
      studentId,
      currentSemester: student.semester,
      cgpa,
      totalCredits,
      semesterResults: semesterResults.sort((a, b) => a.semester - b.semester),
    };
  }

  private calculateGradePoints(percentage: number): number {
    if (percentage >= 90) return 10;
    if (percentage >= 80) return 9;
    if (percentage >= 70) return 8;
    if (percentage >= 60) return 7;
    if (percentage >= 50) return 6;
    if (percentage >= 40) return 4;
    return 0;
  }
}
