import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  QueryTeacherClassesDto,
  CreateTimetableDto,
  UpdateTimetableDto,
  TeacherClassDto,
  TodaysClassDto,
  TeacherClassesStatsDto,
  TeacherClassesResponseDto,
  ScheduleEntry,
} from './dto/teacher-classes.dto';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@Injectable()
export class TeacherClassesService {
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
   * Get all classes assigned to a teacher with schedule and stats
   */
  async getTeacherClasses(
    tenantId: string,
    userId: string,
    query?: QueryTeacherClassesDto,
  ): Promise<TeacherClassesResponseDto> {
    const staffId = await this.getStaffId(tenantId, userId);

    // Determine current academic year and semester
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Academic year runs from July to June
    const academicYearStart = currentMonth >= 7 ? currentYear : currentYear - 1;
    const academicYear = query?.academicYear || `${academicYearStart}-${academicYearStart + 1}`;

    // Odd semester: July-Dec, Even semester: Jan-June
    const currentSemester = currentMonth >= 7 && currentMonth <= 12 ? 'Odd' : 'Even';
    const semesterDisplay = currentMonth >= 7 && currentMonth <= 12
      ? `Fall ${academicYearStart}`
      : `Spring ${academicYearStart + 1}`;

    // Get all teacher-subject assignments for this teacher
    const teacherSubjects = await this.prisma.teacherSubject.findMany({
      where: {
        tenantId,
        staffId,
        academicYear,
      },
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
        timetables: {
          where: { isActive: true },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
      },
    });

    // Get student counts for each section
    const classes: TeacherClassDto[] = await Promise.all(
      teacherSubjects.map(async (ts) => {
        // Count students in this section/semester
        const studentCount = await this.prisma.student.count({
          where: {
            tenantId,
            departmentId: ts.subject.course.departmentId,
            semester: ts.subject.semester,
            section: ts.section || undefined,
            status: 'active',
          },
        });

        // Calculate average attendance for this subject
        const attendanceStats = await this.prisma.studentAttendance.groupBy({
          by: ['status'],
          where: {
            tenantId,
            student: {
              departmentId: ts.subject.course.departmentId,
              semester: ts.subject.semester,
              section: ts.section || undefined,
            },
            date: {
              gte: new Date(now.getFullYear(), now.getMonth() - 3, 1), // Last 3 months
            },
          },
          _count: true,
        });

        const totalAttendance = attendanceStats.reduce((sum, s) => sum + (s._count || 0), 0);
        const presentCount = attendanceStats.find(s => s.status === 'present')?._count || 0;
        const averageAttendance = totalAttendance > 0
          ? Math.round((presentCount / totalAttendance) * 100)
          : 0;

        // Calculate average marks (mock for now - would need ExamResult integration)
        const averageMarks = 70 + Math.floor(Math.random() * 20);

        // Build schedule from timetables
        const schedule: ScheduleEntry[] = ts.timetables.map((t) => ({
          day: DAY_NAMES[t.dayOfWeek],
          time: `${t.startTime} - ${t.endTime}`,
        }));

        return {
          id: ts.id,
          teacherSubjectId: ts.id,
          subjectCode: ts.subject.code,
          subjectName: ts.subject.name,
          department: ts.subject.course.department.name,
          departmentId: ts.subject.course.departmentId,
          semester: ts.subject.semester,
          section: ts.section,
          studentCount,
          schedule,
          averageAttendance,
          averageMarks,
        };
      }),
    );

    // Get today's classes
    const todayDayOfWeek = now.getDay();
    const todaysClasses = await this.getTodaysClasses(tenantId, staffId, todayDayOfWeek);

    // Calculate stats
    const totalStudents = classes.reduce((sum, c) => sum + c.studentCount, 0);
    const avgAttendance = classes.length > 0
      ? Math.round(classes.reduce((sum, c) => sum + c.averageAttendance, 0) / classes.length)
      : 0;

    const stats: TeacherClassesStatsDto = {
      currentSemester: semesterDisplay,
      currentAcademicYear: academicYear,
      totalClasses: classes.length,
      totalStudents,
      averageAttendance: avgAttendance,
      todaysClassCount: todaysClasses.length,
    };

    return {
      stats,
      classes,
      todaysClasses,
    };
  }

  /**
   * Get today's scheduled classes for a teacher
   */
  private async getTodaysClasses(
    tenantId: string,
    staffId: string,
    dayOfWeek: number,
  ): Promise<TodaysClassDto[]> {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:mm format

    const timetables = await this.prisma.timetable.findMany({
      where: {
        tenantId,
        teacherSubject: { staffId },
        dayOfWeek,
        isActive: true,
      },
      include: {
        teacherSubject: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return timetables.map((t) => {
      // Determine status based on current time
      let status: 'upcoming' | 'ongoing' | 'completed';
      if (currentTime < t.startTime) {
        status = 'upcoming';
      } else if (currentTime >= t.startTime && currentTime <= t.endTime) {
        status = 'ongoing';
      } else {
        status = 'completed';
      }

      return {
        id: t.id,
        teacherSubjectId: t.teacherSubjectId,
        subjectCode: t.teacherSubject.subject.code,
        subjectName: t.teacherSubject.subject.name,
        section: t.teacherSubject.section,
        time: `${t.startTime} - ${t.endTime}`,
        room: t.room,
        status,
      };
    });
  }

  /**
   * Get a single class details
   */
  async getClassDetails(tenantId: string, userId: string, classId: string) {
    const staffId = await this.getStaffId(tenantId, userId);

    const teacherSubject = await this.prisma.teacherSubject.findFirst({
      where: {
        id: classId,
        tenantId,
        staffId,
      },
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
        timetables: {
          where: { isActive: true },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
      },
    });

    if (!teacherSubject) {
      throw new NotFoundException('Class not found or not assigned to you');
    }

    // Get students in this class
    const students = await this.prisma.student.findMany({
      where: {
        tenantId,
        departmentId: teacherSubject.subject.course.departmentId,
        semester: teacherSubject.subject.semester,
        section: teacherSubject.section || undefined,
        status: 'active',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { rollNo: 'asc' },
    });

    return {
      ...teacherSubject,
      students,
      schedule: teacherSubject.timetables.map((t) => ({
        id: t.id,
        day: DAY_NAMES[t.dayOfWeek],
        dayOfWeek: t.dayOfWeek,
        startTime: t.startTime,
        endTime: t.endTime,
        room: t.room,
      })),
    };
  }

  /**
   * Get detailed student list for a class with attendance and performance stats
   */
  async getClassStudents(tenantId: string, userId: string, classId: string) {
    const staffId = await this.getStaffId(tenantId, userId);

    const teacherSubject = await this.prisma.teacherSubject.findFirst({
      where: {
        id: classId,
        tenantId,
        staffId,
      },
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

    if (!teacherSubject) {
      throw new NotFoundException('Class not found or not assigned to you');
    }

    // Get students in this class
    const students = await this.prisma.student.findMany({
      where: {
        tenantId,
        departmentId: teacherSubject.subject.course.departmentId,
        semester: teacherSubject.subject.semester,
        section: teacherSubject.section || undefined,
        status: 'active',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { rollNo: 'asc' },
    });

    // Get attendance stats for each student (last 3 months)
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    const studentDetails = await Promise.all(
      students.map(async (student) => {
        // Get attendance records
        const attendanceRecords = await this.prisma.studentAttendance.findMany({
          where: {
            tenantId,
            studentId: student.id,
            date: { gte: threeMonthsAgo },
          },
        });

        const totalClasses = attendanceRecords.length;
        const presentCount = attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length;
        const attendance = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

        // Mock average marks (would need ExamResult integration)
        const avgMarks = 50 + Math.floor(Math.random() * 45);

        // Mock assignments (would need Assignment model)
        const assignmentsSubmitted = Math.floor(Math.random() * 8) + 2;
        const assignmentsPending = Math.floor(Math.random() * 4);

        // Calculate status based on attendance and marks
        let status: 'excellent' | 'good' | 'warning' | 'at_risk';
        if (attendance >= 90 && avgMarks >= 80) {
          status = 'excellent';
        } else if (attendance >= 75 && avgMarks >= 60) {
          status = 'good';
        } else if (attendance >= 60 || avgMarks >= 50) {
          status = 'warning';
        } else {
          status = 'at_risk';
        }

        return {
          id: student.id,
          rollNo: student.rollNo,
          name: student.user?.name || 'Unknown',
          email: student.user?.email || '',
          phone: '', // Phone is stored in UserContact, not directly on Student
          section: student.section || teacherSubject.section || 'A',
          attendance,
          avgMarks,
          assignments: {
            submitted: assignmentsSubmitted,
            pending: assignmentsPending,
          },
          status,
        };
      }),
    );

    // Calculate stats
    const stats = {
      total: studentDetails.length,
      excellent: studentDetails.filter(s => s.status === 'excellent').length,
      good: studentDetails.filter(s => s.status === 'good').length,
      warning: studentDetails.filter(s => s.status === 'warning').length,
      atRisk: studentDetails.filter(s => s.status === 'at_risk').length,
    };

    return {
      classInfo: {
        id: teacherSubject.id,
        subjectCode: teacherSubject.subject.code,
        subjectName: teacherSubject.subject.name,
        section: teacherSubject.section,
        department: teacherSubject.subject.course.department.name,
        semester: teacherSubject.subject.semester,
      },
      students: studentDetails,
      stats,
    };
  }

  /**
   * Add a timetable entry
   */
  async createTimetable(tenantId: string, userId: string, dto: CreateTimetableDto) {
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
      throw new NotFoundException('Class assignment not found or not assigned to you');
    }

    return this.prisma.timetable.create({
      data: {
        tenantId,
        teacherSubjectId: dto.teacherSubjectId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        room: dto.room,
        periodNumber: dto.periodNumber,
      },
    });
  }

  /**
   * Update a timetable entry
   */
  async updateTimetable(tenantId: string, userId: string, timetableId: string, dto: UpdateTimetableDto) {
    const staffId = await this.getStaffId(tenantId, userId);

    // Verify the timetable belongs to this teacher
    const timetable = await this.prisma.timetable.findFirst({
      where: {
        id: timetableId,
        tenantId,
        teacherSubject: { staffId },
      },
    });

    if (!timetable) {
      throw new NotFoundException('Timetable entry not found or not authorized');
    }

    return this.prisma.timetable.update({
      where: { id: timetableId },
      data: {
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        room: dto.room,
        periodNumber: dto.periodNumber,
        isActive: dto.isActive,
      },
    });
  }

  /**
   * Delete a timetable entry
   */
  async deleteTimetable(tenantId: string, userId: string, timetableId: string) {
    const staffId = await this.getStaffId(tenantId, userId);

    // Verify the timetable belongs to this teacher
    const timetable = await this.prisma.timetable.findFirst({
      where: {
        id: timetableId,
        tenantId,
        teacherSubject: { staffId },
      },
    });

    if (!timetable) {
      throw new NotFoundException('Timetable entry not found or not authorized');
    }

    return this.prisma.timetable.delete({
      where: { id: timetableId },
    });
  }
}
