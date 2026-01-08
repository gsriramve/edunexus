import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  MarkAttendanceDto,
  QueryAttendanceDto,
  AttendanceStatus,
  StudentForAttendanceDto,
  ClassAttendanceResponseDto,
  AttendanceStatsDto,
  ClassAttendanceHistoryDto,
  AttendanceHistoryEntryDto,
  SaveAttendanceResponseDto,
} from './dto/teacher-attendance.dto';

@Injectable()
export class TeacherAttendanceService {
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
   * Verify teacher has access to the class
   */
  private async verifyTeacherAccess(
    tenantId: string,
    staffId: string,
    teacherSubjectId: string,
  ) {
    const teacherSubject = await this.prisma.teacherSubject.findFirst({
      where: {
        id: teacherSubjectId,
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

    return teacherSubject;
  }

  /**
   * Get class attendance data including students and existing records
   */
  async getClassAttendance(
    tenantId: string,
    userId: string,
    teacherSubjectId: string,
    date: string,
  ): Promise<ClassAttendanceResponseDto> {
    const staffId = await this.getStaffId(tenantId, userId);
    const teacherSubject = await this.verifyTeacherAccess(tenantId, staffId, teacherSubjectId);

    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);

    // Get students in this class (by department, semester, and section)
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
          select: {
            name: true,
            profile: { select: { photoUrl: true } },
          },
        },
      },
      orderBy: { rollNo: 'asc' },
    });

    // Get existing attendance records for this date
    const attendanceRecords = await this.prisma.studentAttendance.findMany({
      where: {
        tenantId,
        studentId: { in: students.map((s) => s.id) },
        date: parsedDate,
      },
    });

    // Build attendance map
    const attendanceMap: Record<string, AttendanceStatus> = {};
    for (const record of attendanceRecords) {
      attendanceMap[record.studentId] = record.status as AttendanceStatus;
    }

    // Format students
    const formattedStudents: StudentForAttendanceDto[] = students.map((s) => ({
      id: s.id,
      rollNo: s.rollNo,
      name: s.user?.name || 'Unknown',
      photoUrl: s.user?.profile?.photoUrl ?? undefined,
    }));

    // Calculate stats
    const stats = this.calculateStats(attendanceMap, students.length);

    return {
      classId: teacherSubjectId,
      subjectCode: teacherSubject.subject.code,
      subjectName: teacherSubject.subject.name,
      section: teacherSubject.section,
      department: teacherSubject.subject.course.department.name,
      date,
      students: formattedStudents,
      attendance: attendanceMap,
      stats,
      isMarked: attendanceRecords.length > 0,
    };
  }

  /**
   * Mark/update attendance for a class
   */
  async markAttendance(
    tenantId: string,
    userId: string,
    dto: MarkAttendanceDto,
  ): Promise<SaveAttendanceResponseDto> {
    const staffId = await this.getStaffId(tenantId, userId);
    await this.verifyTeacherAccess(tenantId, staffId, dto.teacherSubjectId);

    const parsedDate = new Date(dto.date);
    parsedDate.setHours(0, 0, 0, 0);

    // Validate all student IDs exist
    const studentIds = dto.attendance.map((a) => a.studentId);
    const existingStudents = await this.prisma.student.count({
      where: {
        tenantId,
        id: { in: studentIds },
      },
    });

    if (existingStudents !== studentIds.length) {
      throw new BadRequestException('One or more student IDs are invalid');
    }

    // Upsert attendance records
    let savedCount = 0;
    for (const entry of dto.attendance) {
      await this.prisma.studentAttendance.upsert({
        where: {
          tenantId_studentId_date: {
            tenantId,
            studentId: entry.studentId,
            date: parsedDate,
          },
        },
        create: {
          tenantId,
          studentId: entry.studentId,
          date: parsedDate,
          status: entry.status,
          markedBy: userId,
          markedByType: 'manual',
        },
        update: {
          status: entry.status,
          markedBy: userId,
          markedByType: 'manual',
        },
      });
      savedCount++;
    }

    return {
      success: true,
      message: `Attendance saved for ${savedCount} students`,
      savedCount,
      date: dto.date,
      teacherSubjectId: dto.teacherSubjectId,
    };
  }

  /**
   * Get attendance history for a class
   */
  async getClassAttendanceHistory(
    tenantId: string,
    userId: string,
    teacherSubjectId: string,
    query?: QueryAttendanceDto,
  ): Promise<ClassAttendanceHistoryDto> {
    const staffId = await this.getStaffId(tenantId, userId);
    const teacherSubject = await this.verifyTeacherAccess(tenantId, staffId, teacherSubjectId);

    // Get all students in this class
    const students = await this.prisma.student.findMany({
      where: {
        tenantId,
        departmentId: teacherSubject.subject.course.departmentId,
        semester: teacherSubject.subject.semester,
        section: teacherSubject.section || undefined,
        status: 'active',
      },
      select: { id: true },
    });

    const studentIds = students.map((s) => s.id);

    // Build date range
    const now = new Date();
    const startDate = query?.startDate
      ? new Date(query.startDate)
      : new Date(now.getFullYear(), now.getMonth() - 1, 1); // Last month
    const endDate = query?.endDate ? new Date(query.endDate) : now;

    // Get all attendance records
    const attendanceRecords = await this.prisma.studentAttendance.findMany({
      where: {
        tenantId,
        studentId: { in: studentIds },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    });

    // Group by date
    const byDate = new Map<string, { present: number; absent: number; late: number; excused: number }>();

    for (const record of attendanceRecords) {
      const dateKey = record.date.toISOString().split('T')[0];
      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, { present: 0, absent: 0, late: 0, excused: 0 });
      }
      const dateStats = byDate.get(dateKey)!;
      if (record.status === 'present') dateStats.present++;
      else if (record.status === 'absent') dateStats.absent++;
      else if (record.status === 'late') dateStats.late++;
      else if (record.status === 'excused') dateStats.excused++;
    }

    // Build history entries
    const history: AttendanceHistoryEntryDto[] = [];
    const totalStudents = students.length;

    for (const [date, counts] of byDate.entries()) {
      const total = counts.present + counts.absent + counts.late + counts.excused;
      history.push({
        date,
        stats: {
          total: totalStudents,
          present: counts.present,
          absent: counts.absent,
          late: counts.late,
          excused: counts.excused,
          percentage: total > 0 ? Math.round((counts.present / total) * 100) : 0,
        },
      });
    }

    // Calculate overall stats
    const overallPresent = attendanceRecords.filter((r) => r.status === 'present').length;
    const overallAbsent = attendanceRecords.filter((r) => r.status === 'absent').length;
    const overallLate = attendanceRecords.filter((r) => r.status === 'late').length;
    const overallExcused = attendanceRecords.filter((r) => r.status === 'excused').length;
    const overallTotal = attendanceRecords.length;

    return {
      classId: teacherSubjectId,
      subjectCode: teacherSubject.subject.code,
      subjectName: teacherSubject.subject.name,
      section: teacherSubject.section,
      history,
      overallStats: {
        total: overallTotal,
        present: overallPresent,
        absent: overallAbsent,
        late: overallLate,
        excused: overallExcused,
        percentage: overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0,
      },
    };
  }

  /**
   * Get student's attendance in a class
   */
  async getStudentAttendance(
    tenantId: string,
    userId: string,
    teacherSubjectId: string,
    studentId: string,
    query?: QueryAttendanceDto,
  ) {
    const staffId = await this.getStaffId(tenantId, userId);
    const teacherSubject = await this.verifyTeacherAccess(tenantId, staffId, teacherSubjectId);

    // Verify student is in this class
    const student = await this.prisma.student.findFirst({
      where: {
        id: studentId,
        tenantId,
        departmentId: teacherSubject.subject.course.departmentId,
        semester: teacherSubject.subject.semester,
        section: teacherSubject.section || undefined,
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found in this class');
    }

    // Build date range
    const now = new Date();
    const startDate = query?.startDate
      ? new Date(query.startDate)
      : new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const endDate = query?.endDate ? new Date(query.endDate) : now;

    // Get attendance records
    const records = await this.prisma.studentAttendance.findMany({
      where: {
        tenantId,
        studentId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate stats
    const stats = {
      total: records.length,
      present: records.filter((r) => r.status === 'present').length,
      absent: records.filter((r) => r.status === 'absent').length,
      late: records.filter((r) => r.status === 'late').length,
      excused: records.filter((r) => r.status === 'excused').length,
      percentage: records.length > 0
        ? Math.round((records.filter((r) => r.status === 'present').length / records.length) * 100)
        : 0,
    };

    return {
      student: {
        id: student.id,
        rollNo: student.rollNo,
        name: student.user?.name || 'Unknown',
      },
      records: records.map((r) => ({
        date: r.date.toISOString().split('T')[0],
        status: r.status,
      })),
      stats,
    };
  }

  /**
   * Calculate attendance stats
   */
  private calculateStats(
    attendance: Record<string, AttendanceStatus>,
    totalStudents: number,
  ): AttendanceStatsDto {
    const values = Object.values(attendance);
    const present = values.filter((s) => s === AttendanceStatus.PRESENT).length;
    const absent = values.filter((s) => s === AttendanceStatus.ABSENT).length;
    const late = values.filter((s) => s === AttendanceStatus.LATE).length;
    const excused = values.filter((s) => s === AttendanceStatus.EXCUSED).length;

    return {
      total: totalStudents,
      present,
      absent,
      late,
      excused,
      percentage: totalStudents > 0 ? Math.round((present / totalStudents) * 100) : 0,
    };
  }
}
