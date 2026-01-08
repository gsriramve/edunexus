import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  TeacherDashboardResponseDto,
  TeacherInfoDto,
  QuickStatsDto,
  ScheduleItemDto,
  PendingTaskDto,
  SubjectStatsDto,
} from './dto/teacher-dashboard.dto';

@Injectable()
export class TeacherDashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get teacher's staff record
   */
  private async getTeacherStaff(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
        role: 'teacher',
      },
      include: {
        staff: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!user || !user.staff) {
      throw new ForbiddenException('User is not a teacher or has no staff record');
    }

    return {
      user,
      staff: user.staff,
      department: user.staff.department,
    };
  }

  /**
   * Format time from HH:mm to 12-hour format
   */
  private formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  /**
   * Calculate attendance percentage
   */
  private calculateAttendance(attendance: { status: string }[]): number {
    if (attendance.length === 0) return 0;
    const present = attendance.filter(
      (a) => a.status === 'present' || a.status === 'late'
    ).length;
    return Math.round((present / attendance.length) * 100 * 10) / 10;
  }

  /**
   * Get complete dashboard data
   */
  async getDashboard(tenantId: string, userId: string): Promise<TeacherDashboardResponseDto> {
    const { user, staff, department } = await this.getTeacherStaff(tenantId, userId);

    // Get today's date and day of week
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();

    // Get teacher's subjects with timetable
    const teacherSubjects = await this.prisma.teacherSubject.findMany({
      where: {
        tenantId,
        staffId: staff.id,
      },
      include: {
        subject: {
          include: {
            course: true,
          },
        },
        timetables: {
          where: {
            isActive: true,
          },
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    });

    // Get today's timetable
    const todayTimetable = await this.prisma.timetable.findMany({
      where: {
        tenantId,
        dayOfWeek,
        isActive: true,
        teacherSubject: {
          staffId: staff.id,
        },
      },
      include: {
        teacherSubject: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Calculate total unique students
    const studentCounts = await Promise.all(
      teacherSubjects.map(async (ts) => {
        const count = await this.prisma.student.count({
          where: {
            tenantId,
            departmentId: ts.subject.course.departmentId,
            semester: ts.subject.semester,
            status: 'active',
          },
        });
        return count;
      })
    );
    const totalStudents = studentCounts.reduce((sum, count) => sum + count, 0);

    // Get upcoming exams count
    const upcomingExamsCount = await this.prisma.exam.count({
      where: {
        tenantId,
        date: {
          gte: today,
        },
        subjectId: {
          in: teacherSubjects.map((ts) => ts.subjectId),
        },
      },
    });

    // Build teacher info
    const teacherInfo: TeacherInfoDto = {
      id: staff.id,
      name: user.name,
      employeeId: staff.employeeId,
      department: department?.name || 'Unknown',
      departmentCode: department?.code || 'N/A',
      designation: staff.designation,
      email: user.email,
      subjectsCount: teacherSubjects.length,
      totalStudents,
    };

    // Build today's schedule
    const todaySchedule: ScheduleItemDto[] = todayTimetable.map((slot) => {
      const isLab = slot.teacherSubject.subject.isLab;
      return {
        id: slot.id,
        time: this.formatTime(slot.startTime),
        subject: slot.teacherSubject.subject.name,
        subjectCode: slot.teacherSubject.subject.code,
        section: slot.teacherSubject.section,
        room: slot.room,
        type: isLab ? 'Lab' : 'Lecture',
        students: 0, // Will be calculated per section if needed
      };
    });

    // Build pending tasks
    const pendingTasks: PendingTaskDto[] = [];

    // Check for attendance tasks (classes without attendance today)
    if (todaySchedule.length > 0) {
      pendingTasks.push({
        id: 'attendance-today',
        task: `Mark attendance for ${todaySchedule.length} class(es) today`,
        type: 'attendance',
        due: 'Today',
        urgent: true,
      });
    }

    // Check for upcoming exam marks entry
    const upcomingExams = await this.prisma.exam.findMany({
      where: {
        tenantId,
        subjectId: {
          in: teacherSubjects.map((ts) => ts.subjectId),
        },
        date: {
          lte: today, // Exams that have passed
        },
      },
      include: {
        subject: true,
        _count: {
          select: {
            results: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: 5,
    });

    for (const exam of upcomingExams) {
      if (exam._count.results === 0) {
        pendingTasks.push({
          id: `marks-${exam.id}`,
          task: `Enter marks for ${exam.name} - ${exam.subject.name}`,
          type: 'marks',
          due: 'Pending',
          urgent: true,
          relatedId: exam.id,
        });
      }
    }

    // Build subject stats
    const subjectStats: SubjectStatsDto[] = await Promise.all(
      teacherSubjects.map(async (ts) => {
        // Count students in this subject's department/semester
        const studentCount = await this.prisma.student.count({
          where: {
            tenantId,
            departmentId: ts.subject.course.departmentId,
            semester: ts.subject.semester,
            status: 'active',
          },
        });

        // Get attendance records for these students (overall attendance since subject-level not tracked)
        const studentsWithAttendanceRecords = await this.prisma.student.findMany({
          where: {
            tenantId,
            departmentId: ts.subject.course.departmentId,
            semester: ts.subject.semester,
            status: 'active',
          },
          include: {
            attendance: {
              where: {
                tenantId,
              },
            },
          },
        });

        // Calculate average attendance
        let totalAttendance = 0;
        let studentsWithAttendance = 0;
        studentsWithAttendanceRecords.forEach((student) => {
          if (student.attendance.length > 0) {
            totalAttendance += this.calculateAttendance(student.attendance);
            studentsWithAttendance++;
          }
        });
        const avgAttendance = studentsWithAttendance > 0
          ? Math.round((totalAttendance / studentsWithAttendance) * 10) / 10
          : 0;

        // Count classes this week
        const classesThisWeek = ts.timetables.length;

        // Count sections
        const sections = ts.section ? 1 : 0;

        return {
          id: ts.id,
          subject: ts.subject.name,
          code: ts.subject.code,
          sections: sections || 1,
          students: studentCount,
          avgAttendance,
          classesThisWeek,
        };
      })
    );

    // Get count of students with low attendance (using Set to avoid duplicates)
    const lowAttendanceStudentIds = new Set<string>();
    for (const ts of teacherSubjects) {
      const studentsToCheck = await this.prisma.student.findMany({
        where: {
          tenantId,
          departmentId: ts.subject.course.departmentId,
          semester: ts.subject.semester,
          status: 'active',
        },
        include: {
          attendance: {
            where: {
              tenantId,
            },
          },
        },
      });

      studentsToCheck.forEach((student) => {
        const attendance = this.calculateAttendance(student.attendance);
        if (student.attendance.length > 0 && attendance < 75) {
          lowAttendanceStudentIds.add(student.id);
        }
      });
    }
    const lowAttendanceCount = lowAttendanceStudentIds.size;

    // Build quick stats
    const quickStats: QuickStatsDto = {
      totalStudents,
      classesToday: todaySchedule.length,
      subjectsCount: teacherSubjects.length,
      pendingTasks: pendingTasks.length,
      upcomingExams: upcomingExamsCount,
      lowAttendanceStudents: lowAttendanceCount,
    };

    return {
      teacher: teacherInfo,
      quickStats,
      todaySchedule,
      pendingTasks,
      subjectStats,
    };
  }

  /**
   * Get today's schedule only
   */
  async getTodaySchedule(tenantId: string, userId: string): Promise<ScheduleItemDto[]> {
    const dashboard = await this.getDashboard(tenantId, userId);
    return dashboard.todaySchedule;
  }

  /**
   * Get pending tasks only
   */
  async getPendingTasks(tenantId: string, userId: string): Promise<PendingTaskDto[]> {
    const dashboard = await this.getDashboard(tenantId, userId);
    return dashboard.pendingTasks;
  }

  /**
   * Get subject stats only
   */
  async getSubjectStats(tenantId: string, userId: string): Promise<SubjectStatsDto[]> {
    const dashboard = await this.getDashboard(tenantId, userId);
    return dashboard.subjectStats;
  }
}
