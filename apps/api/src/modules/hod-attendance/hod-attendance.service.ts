import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryAttendanceDto } from './dto/hod-attendance.dto';

@Injectable()
export class HodAttendanceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get HoD's department ID from their staff record
   */
  private async getHodDepartment(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { clerkUserId: userId },
        ],
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
   * Get comprehensive attendance data for the HoD's department
   */
  async getAttendanceOverview(tenantId: string, userId: string, query: QueryAttendanceDto) {
    const { departmentId, department } = await this.getHodDepartment(tenantId, userId);

    // Get all active students in the department
    const studentWhereClause: any = {
      tenantId,
      departmentId,
      status: 'active',
    };

    if (query.semester) {
      studentWhereClause.semester = parseInt(query.semester);
    }

    const students = await this.prisma.student.findMany({
      where: studentWhereClause,
      include: {
        user: true,
        attendance: {
          where: {
            tenantId,
            ...(query.startDate && query.endDate
              ? {
                  date: {
                    gte: new Date(query.startDate),
                    lte: new Date(query.endDate),
                  },
                }
              : {}),
          },
        },
      },
    });

    const totalStudents = students.length;
    if (totalStudents === 0) {
      return {
        department: { id: department?.id, name: department?.name, code: department?.code },
        stats: {
          departmentAverage: 0,
          todaysAttendance: 0,
          totalStudents: 0,
          belowThreshold: 0,
          perfectAttendance: 0,
        },
        bySubject: [],
        bySemester: [],
        lowAttendance: [],
        weeklyTrend: [],
      };
    }

    // Calculate attendance for each student
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const studentAttendanceData = students.map((student) => {
      const totalClasses = student.attendance.length;
      const presentClasses = student.attendance.filter(
        (a) => a.status === 'present' || a.status === 'late'
      ).length;
      const percentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

      // Check today's attendance
      const todayRecord = student.attendance.find(
        (a) => new Date(a.date).toDateString() === today.toDateString()
      );
      const isPresentToday = todayRecord
        ? todayRecord.status === 'present' || todayRecord.status === 'late'
        : false;

      return {
        studentId: student.id,
        name: student.user.name,
        rollNo: student.rollNo,
        semester: student.semester,
        totalClasses,
        presentClasses,
        percentage: Math.round(percentage * 10) / 10,
        isPresentToday,
        isPerfect: totalClasses > 0 && percentage >= 99.9,
      };
    });

    // Calculate stats
    const avgPercentage =
      studentAttendanceData.reduce((sum, s) => sum + s.percentage, 0) / totalStudents;
    const belowThreshold = studentAttendanceData.filter((s) => s.percentage < 75).length;
    const perfectAttendance = studentAttendanceData.filter((s) => s.isPerfect).length;
    const presentToday = studentAttendanceData.filter((s) => s.isPresentToday).length;
    const todaysAttendance = totalStudents > 0 ? (presentToday / totalStudents) * 100 : 0;

    // Calculate by semester
    const semesterGroups = new Map<number, { total: number; avgSum: number }>();
    studentAttendanceData.forEach((s) => {
      const existing = semesterGroups.get(s.semester) || { total: 0, avgSum: 0 };
      semesterGroups.set(s.semester, {
        total: existing.total + 1,
        avgSum: existing.avgSum + s.percentage,
      });
    });

    const bySemester = Array.from(semesterGroups.entries())
      .map(([semester, data]) => ({
        semester,
        avg: Math.round((data.avgSum / data.total) * 10) / 10,
        students: data.total,
      }))
      .sort((a, b) => a.semester - b.semester);

    // Get subjects for the department
    const courses = await this.prisma.course.findMany({
      where: { tenantId, departmentId },
    });
    const courseIds = courses.map((c) => c.id);

    const subjects = await this.prisma.subject.findMany({
      where: {
        tenantId,
        courseId: { in: courseIds },
      },
      orderBy: { semester: 'asc' },
    });

    // Calculate subject-wise attendance (based on semester grouping)
    const bySubject = subjects.slice(0, 10).map((subject) => {
      // Get students in the subject's semester
      const semesterStudents = studentAttendanceData.filter(
        (s) => s.semester === subject.semester
      );
      const avgAttendance =
        semesterStudents.length > 0
          ? semesterStudents.reduce((sum, s) => sum + s.percentage, 0) / semesterStudents.length
          : 0;
      const belowThresholdCount = semesterStudents.filter((s) => s.percentage < 75).length;

      return {
        code: subject.code,
        name: subject.name,
        avg: Math.round(avgAttendance * 10) / 10,
        belowThreshold: belowThresholdCount,
      };
    });

    // Low attendance students
    const lowAttendance = studentAttendanceData
      .filter((s) => s.percentage < 75)
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 10)
      .map((s) => ({
        id: s.studentId,
        name: s.name,
        rollNo: s.rollNo,
        semester: s.semester,
        attendance: s.percentage,
        classes: s.totalClasses,
      }));

    // Weekly trend (last 4 weeks)
    const weeklyTrend = await this.calculateWeeklyTrend(tenantId, students.map((s) => s.id));

    return {
      department: { id: department?.id, name: department?.name, code: department?.code },
      stats: {
        departmentAverage: Math.round(avgPercentage * 10) / 10,
        todaysAttendance: Math.round(todaysAttendance * 10) / 10,
        totalStudents,
        belowThreshold,
        perfectAttendance,
      },
      bySubject,
      bySemester,
      lowAttendance,
      weeklyTrend,
    };
  }

  /**
   * Calculate weekly attendance trend for the past 4 weeks
   */
  private async calculateWeeklyTrend(tenantId: string, studentIds: string[]) {
    if (studentIds.length === 0) {
      return [];
    }

    const weeks: { week: string; attendance: number }[] = [];
    const now = new Date();

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i + 1) * 7);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const attendance = await this.prisma.studentAttendance.groupBy({
        by: ['status'],
        where: {
          tenantId,
          studentId: { in: studentIds },
          date: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        _count: true,
      });

      const total = attendance.reduce((sum, a) => sum + a._count, 0);
      const present = attendance
        .filter((a) => a.status === 'present' || a.status === 'late')
        .reduce((sum, a) => sum + a._count, 0);

      const percentage = total > 0 ? (present / total) * 100 : 0;

      weeks.push({
        week: `Week ${4 - i}`,
        attendance: Math.round(percentage * 10) / 10,
      });
    }

    return weeks;
  }

  /**
   * Get detailed attendance for a specific student
   */
  async getStudentAttendance(tenantId: string, userId: string, studentId: string) {
    const { departmentId } = await this.getHodDepartment(tenantId, userId);

    const student = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        tenantId,
        departmentId,
      },
      include: {
        user: true,
        attendance: {
          where: { tenantId },
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    if (!student) {
      throw new ForbiddenException('Student not found in your department');
    }

    const totalClasses = student.attendance.length;
    const presentClasses = student.attendance.filter(
      (a) => a.status === 'present' || a.status === 'late'
    ).length;
    const percentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

    return {
      id: student.id,
      name: student.user.name,
      rollNo: student.rollNo,
      semester: student.semester,
      attendancePercentage: Math.round(percentage * 10) / 10,
      totalClasses,
      presentClasses,
      absentClasses: totalClasses - presentClasses,
      recentAttendance: student.attendance.map((a) => ({
        date: a.date,
        status: a.status,
        markedByType: a.markedByType,
      })),
    };
  }

  /**
   * Get students with low attendance for sending notices
   */
  async getLowAttendanceStudents(
    tenantId: string,
    userId: string,
    threshold: number = 75
  ) {
    const { departmentId } = await this.getHodDepartment(tenantId, userId);

    const students = await this.prisma.student.findMany({
      where: {
        tenantId,
        departmentId,
        status: 'active',
      },
      include: {
        user: true,
        attendance: {
          where: { tenantId },
        },
      },
    });

    const lowAttendanceStudents = students
      .map((student) => {
        const totalClasses = student.attendance.length;
        const presentClasses = student.attendance.filter(
          (a) => a.status === 'present' || a.status === 'late'
        ).length;
        const percentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

        return {
          id: student.id,
          name: student.user.name,
          email: student.user.email,
          rollNo: student.rollNo,
          semester: student.semester,
          attendance: Math.round(percentage * 10) / 10,
          totalClasses,
          presentClasses,
          absentClasses: totalClasses - presentClasses,
        };
      })
      .filter((s) => s.attendance < threshold)
      .sort((a, b) => a.attendance - b.attendance);

    return {
      threshold,
      count: lowAttendanceStudents.length,
      students: lowAttendanceStudents,
    };
  }
}
