import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  QueryAttendanceDto,
  AttendanceRecordDto,
  AttendanceStatsDto,
  SubjectAttendanceDto,
  MarkAttendanceDto,
  BulkMarkAttendanceDto,
  AttendanceStatus,
  ByDateQueryDto,
} from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get attendance records for a specific student
   */
  async getStudentAttendance(
    tenantId: string,
    studentId: string,
    query?: QueryAttendanceDto,
  ): Promise<AttendanceRecordDto[]> {
    // Verify student exists
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Build date filter
    const dateFilter: any = {};
    if (query?.fromDate) {
      dateFilter.gte = new Date(query.fromDate);
    }
    if (query?.toDate) {
      dateFilter.lte = new Date(query.toDate);
    }

    // Get attendance records
    const records = await this.prisma.studentAttendance.findMany({
      where: {
        tenantId,
        studentId,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
      orderBy: { date: 'desc' },
    });

    return records.map((record) => ({
      id: record.id,
      date: record.date.toISOString().split('T')[0],
      status: record.status as AttendanceStatus,
      markedByType: record.markedByType,
      time: record.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }));
  }

  /**
   * Get attendance statistics for a student
   */
  async getStudentStats(
    tenantId: string,
    studentId: string,
    query?: QueryAttendanceDto,
  ): Promise<AttendanceStatsDto> {
    // Verify student exists
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Build date filter
    const dateFilter: any = {};
    if (query?.fromDate) {
      dateFilter.gte = new Date(query.fromDate);
    }
    if (query?.toDate) {
      dateFilter.lte = new Date(query.toDate);
    }

    // Get all attendance records for the student
    const records = await this.prisma.studentAttendance.findMany({
      where: {
        tenantId,
        studentId,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
    });

    // Calculate stats
    const present = records.filter((r) => r.status === 'present').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const late = records.filter((r) => r.status === 'late').length;
    const excused = records.filter((r) => r.status === 'excused').length;
    const totalDays = records.length;

    return {
      totalDays,
      present,
      absent,
      late,
      excused,
      percentage: totalDays > 0 ? Math.round(((present + late) / totalDays) * 100) : 0,
    };
  }

  /**
   * Get subject-wise attendance breakdown for a student
   * Note: Since StudentAttendance doesn't have a direct subject link,
   * we calculate based on the student's enrolled subjects and timetable
   */
  async getStudentSubjectAttendance(
    tenantId: string,
    studentId: string,
  ): Promise<SubjectAttendanceDto[]> {
    // Verify student exists and get their department/semester
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: {
        department: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Get subjects for the student's semester
    const subjects = await this.prisma.subject.findMany({
      where: {
        tenantId,
        semester: student.semester,
        course: {
          departmentId: student.departmentId,
        },
      },
      include: {
        course: true,
      },
    });

    // Get all attendance records for the student
    const records = await this.prisma.studentAttendance.findMany({
      where: {
        tenantId,
        studentId,
      },
    });

    // Since attendance doesn't directly link to subjects,
    // we'll distribute the attendance across subjects evenly for now
    // In a real implementation, you'd want to link attendance to specific classes/subjects
    const totalRecords = records.length;
    const subjectsCount = subjects.length || 1;
    const recordsPerSubject = Math.floor(totalRecords / subjectsCount);

    const presentRecords = records.filter((r) => r.status === 'present' || r.status === 'late').length;
    const presentPerSubject = Math.floor(presentRecords / subjectsCount);

    return subjects.map((subject) => {
      const totalClasses = recordsPerSubject || 0;
      const present = presentPerSubject || 0;
      const absent = totalClasses - present;

      return {
        subjectId: subject.id,
        subjectCode: subject.code,
        subjectName: subject.name,
        totalClasses,
        present,
        absent,
        late: 0,
        percentage: totalClasses > 0 ? Math.round((present / totalClasses) * 100) : 0,
      };
    });
  }

  /**
   * Get attendance records for a specific date (for marking)
   */
  async getByDate(
    tenantId: string,
    query: ByDateQueryDto,
  ) {
    const date = new Date(query.date);
    date.setHours(0, 0, 0, 0);

    // Build student filter
    const studentFilter: any = {
      tenantId,
      status: 'active',
    };

    if (query.departmentId) {
      studentFilter.departmentId = query.departmentId;
    }
    if (query.section) {
      studentFilter.section = query.section;
    }

    // Get students
    const students = await this.prisma.student.findMany({
      where: studentFilter,
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { rollNo: 'asc' },
    });

    // Get existing attendance for this date
    const records = await this.prisma.studentAttendance.findMany({
      where: {
        tenantId,
        date,
        studentId: { in: students.map((s) => s.id) },
      },
    });

    const attendanceMap: Record<string, string> = {};
    records.forEach((r) => {
      attendanceMap[r.studentId] = r.status;
    });

    return {
      date: query.date,
      students: students.map((s) => ({
        id: s.id,
        rollNo: s.rollNo,
        name: s.user?.name || 'Unknown',
        status: attendanceMap[s.id] || null,
      })),
      isMarked: records.length > 0,
    };
  }

  /**
   * Get overall attendance statistics
   */
  async getOverallStats(
    tenantId: string,
    query?: { date?: string; departmentId?: string },
  ) {
    const dateFilter: any = {};
    if (query?.date) {
      const date = new Date(query.date);
      date.setHours(0, 0, 0, 0);
      dateFilter.date = date;
    }

    const studentFilter: any = { tenantId };
    if (query?.departmentId) {
      studentFilter.departmentId = query.departmentId;
    }

    // Get all students
    const students = await this.prisma.student.findMany({
      where: { ...studentFilter, status: 'active' },
      select: { id: true },
    });

    const studentIds = students.map((s) => s.id);

    // Get attendance records
    const records = await this.prisma.studentAttendance.findMany({
      where: {
        tenantId,
        studentId: { in: studentIds },
        ...dateFilter,
      },
    });

    const present = records.filter((r) => r.status === 'present').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const late = records.filter((r) => r.status === 'late').length;
    const excused = records.filter((r) => r.status === 'excused').length;
    const total = records.length;

    return {
      totalStudents: students.length,
      totalRecords: total,
      present,
      absent,
      late,
      excused,
      percentage: total > 0 ? Math.round(((present + late) / total) * 100) : 0,
    };
  }

  /**
   * Mark attendance for a single student
   */
  async markAttendance(
    tenantId: string,
    userId: string,
    dto: MarkAttendanceDto,
  ) {
    const date = new Date(dto.date);
    date.setHours(0, 0, 0, 0);

    const results = [];
    for (const entry of dto.attendance) {
      // Verify student exists
      const student = await this.prisma.student.findFirst({
        where: { id: entry.studentId, tenantId },
      });

      if (!student) {
        throw new BadRequestException(`Student ${entry.studentId} not found`);
      }

      const record = await this.prisma.studentAttendance.upsert({
        where: {
          tenantId_studentId_date: {
            tenantId,
            studentId: entry.studentId,
            date,
          },
        },
        create: {
          tenantId,
          studentId: entry.studentId,
          date,
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
      results.push(record);
    }

    return {
      success: true,
      marked: results.length,
    };
  }

  /**
   * Bulk mark attendance
   */
  async bulkMarkAttendance(
    tenantId: string,
    userId: string,
    dto: BulkMarkAttendanceDto,
  ) {
    const date = new Date(dto.date);
    date.setHours(0, 0, 0, 0);

    let marked = 0;
    let failed = 0;

    for (const entry of dto.records) {
      try {
        await this.prisma.studentAttendance.upsert({
          where: {
            tenantId_studentId_date: {
              tenantId,
              studentId: entry.studentId,
              date,
            },
          },
          create: {
            tenantId,
            studentId: entry.studentId,
            date,
            status: entry.status,
            markedBy: userId,
            markedByType: 'manual',
          },
          update: {
            status: entry.status,
            markedBy: userId,
          },
        });
        marked++;
      } catch {
        failed++;
      }
    }

    return { marked, failed };
  }

  /**
   * Update an attendance record
   */
  async updateAttendance(
    tenantId: string,
    id: string,
    data: { status: AttendanceStatus; remarks?: string },
  ) {
    const record = await this.prisma.studentAttendance.findFirst({
      where: { id, tenantId },
    });

    if (!record) {
      throw new NotFoundException('Attendance record not found');
    }

    return this.prisma.studentAttendance.update({
      where: { id },
      data: {
        status: data.status,
      },
    });
  }

  /**
   * Delete an attendance record
   */
  async deleteAttendance(tenantId: string, id: string) {
    const record = await this.prisma.studentAttendance.findFirst({
      where: { id, tenantId },
    });

    if (!record) {
      throw new NotFoundException('Attendance record not found');
    }

    await this.prisma.studentAttendance.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * List attendance records with pagination
   */
  async listAttendance(
    tenantId: string,
    query?: QueryAttendanceDto & { page?: number; limit?: number },
  ) {
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    const dateFilter: any = {};
    if (query?.fromDate) {
      dateFilter.gte = new Date(query.fromDate);
    }
    if (query?.toDate) {
      dateFilter.lte = new Date(query.toDate);
    }

    const where: any = {
      tenantId,
      ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
    };

    const [records, total] = await Promise.all([
      this.prisma.studentAttendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          student: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.studentAttendance.count({ where }),
    ]);

    return {
      data: records.map((r) => ({
        id: r.id,
        date: r.date.toISOString().split('T')[0],
        status: r.status,
        student: {
          id: r.student.id,
          rollNo: r.student.rollNo,
          name: r.student.user?.name || 'Unknown',
        },
        markedByType: r.markedByType,
      })),
      total,
      page,
      limit,
    };
  }
}
