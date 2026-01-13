import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryFacultyDto } from './dto/hod-faculty.dto';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@Injectable()
export class HodFacultyService {
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
   * Get all faculty in the HoD's department
   */
  async getFaculty(tenantId: string, userId: string, query: QueryFacultyDto) {
    const { departmentId, department } = await this.getHodDepartment(tenantId, userId);

    // Build where clause
    const whereClause: any = {
      tenantId,
      departmentId,
    };

    if (query.search) {
      whereClause.OR = [
        { user: { name: { contains: query.search, mode: 'insensitive' } } },
        { employeeId: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.designation && query.designation !== 'all') {
      whereClause.designation = query.designation;
    }

    // Get staff with their subjects and timetable
    const staff = await this.prisma.staff.findMany({
      where: whereClause,
      include: {
        user: true,
        teacherSubjects: {
          where: { tenantId },
          include: {
            subject: true,
            timetables: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { user: { name: 'asc' } },
    });

    // Filter to only teacher/hod roles
    const facultyStaff = staff.filter(
      (s) => s.user.role === 'teacher' || s.user.role === 'hod'
    );

    // Transform faculty data
    const faculty = facultyStaff.map((s) => {
      const totalClasses = s.teacherSubjects.reduce(
        (sum, ts) => sum + ts.timetables.length * 4, // Assuming 4 weeks per month
        0
      );
      // For now, assume 90% classes taken on average (can be calculated from attendance later)
      const classesTaken = Math.floor(totalClasses * 0.9);
      const attendancePercentage = totalClasses > 0 ? (classesTaken / totalClasses) * 100 : 0;

      return {
        id: s.id,
        name: s.user.name,
        employeeId: s.employeeId,
        email: s.user.email,
        designation: s.designation,
        joiningDate: s.joiningDate.toISOString(),
        subjects: s.teacherSubjects.map((ts) => ({
          id: ts.id,
          code: ts.subject.code,
          name: ts.subject.name,
          section: ts.section,
          academicYear: ts.academicYear,
        })),
        subjectCount: s.teacherSubjects.length,
        totalClasses,
        classesTaken,
        attendancePercentage: Math.round(attendancePercentage),
        isOnLeave: false, // No leave model yet
      };
    });

    // Calculate stats
    const totalFaculty = faculty.length;
    const onLeave = faculty.filter((f) => f.isOnLeave).length;
    const presentToday = totalFaculty - onLeave;
    const totalWeeklyClasses = faculty.reduce(
      (sum, f) => sum + f.subjectCount * 3, // Avg 3 classes per subject
      0
    );
    const avgClassesPerWeek =
      totalFaculty > 0 ? Math.round((totalWeeklyClasses / totalFaculty) * 10) / 10 : 0;

    // Calculate workload summary
    const OPTIMAL_MIN = 2;
    const OPTIMAL_MAX = 4;
    let underloaded = 0;
    let optimal = 0;
    let overloaded = 0;

    faculty.forEach((f) => {
      if (f.subjectCount < OPTIMAL_MIN) {
        underloaded++;
      } else if (f.subjectCount > OPTIMAL_MAX) {
        overloaded++;
      } else {
        optimal++;
      }
    });

    const labSubjects = faculty.reduce(
      (sum, f) => sum + f.subjects.filter((s) => s.name.toLowerCase().includes('lab')).length,
      0
    );

    return {
      department: department
        ? { id: department.id, name: department.name, code: department.code }
        : null,
      stats: {
        totalFaculty,
        presentToday,
        onLeave,
        avgClassesPerWeek,
      },
      workload: {
        avgClassesPerFaculty: avgClassesPerWeek,
        avgLabsPerFaculty:
          totalFaculty > 0 ? Math.round((labSubjects / totalFaculty) * 10) / 10 : 0,
        underloaded,
        optimal,
        overloaded,
      },
      faculty,
    };
  }

  /**
   * Get single faculty details
   */
  async getFacultyById(tenantId: string, userId: string, staffId: string) {
    const { departmentId, department } = await this.getHodDepartment(tenantId, userId);

    const staff = await this.prisma.staff.findFirst({
      where: {
        id: staffId,
        tenantId,
        departmentId,
      },
      include: {
        user: {
          include: {
            profile: {
              include: {
                contacts: true,
              },
            },
          },
        },
        teacherSubjects: {
          where: { tenantId },
          include: {
            subject: true,
            timetables: {
              where: { isActive: true },
              orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
            },
          },
        },
      },
    });

    if (!staff) {
      throw new NotFoundException('Faculty not found in your department');
    }

    const totalClasses = staff.teacherSubjects.reduce(
      (sum, ts) => sum + ts.timetables.length * 4,
      0
    );
    const classesTaken = Math.floor(totalClasses * 0.9);
    const attendancePercentage = totalClasses > 0 ? (classesTaken / totalClasses) * 100 : 0;

    // Get phone from profile contacts
    const phone =
      staff.user.profile?.contacts?.find((c) => c.type === 'mobile')?.number || null;

    // Build timetable
    const timetable = staff.teacherSubjects.flatMap((ts) =>
      ts.timetables.map((t) => ({
        id: t.id,
        dayOfWeek: t.dayOfWeek,
        dayName: DAY_NAMES[t.dayOfWeek],
        startTime: t.startTime,
        endTime: t.endTime,
        room: t.room,
        subjectCode: ts.subject.code,
        subjectName: ts.subject.name,
        section: ts.section,
      }))
    );

    return {
      id: staff.id,
      name: staff.user.name,
      employeeId: staff.employeeId,
      email: staff.user.email,
      phone,
      designation: staff.designation,
      qualification: null, // Not in schema yet
      specialization: null, // Not in schema yet
      joiningDate: staff.joiningDate.toISOString(),
      department: department
        ? { id: department.id, name: department.name, code: department.code }
        : null,
      subjects: staff.teacherSubjects.map((ts) => ({
        id: ts.id,
        code: ts.subject.code,
        name: ts.subject.name,
        section: ts.section,
        academicYear: ts.academicYear,
      })),
      subjectCount: staff.teacherSubjects.length,
      totalClasses,
      classesTaken,
      attendancePercentage: Math.round(attendancePercentage),
      isOnLeave: false,
      timetable,
    };
  }

  /**
   * Get department timetable (aggregated view)
   */
  async getDepartmentTimetable(tenantId: string, userId: string) {
    const { departmentId, department } = await this.getHodDepartment(tenantId, userId);

    // Get all timetable entries for department faculty
    const staff = await this.prisma.staff.findMany({
      where: {
        tenantId,
        departmentId,
        user: { role: { in: ['teacher', 'hod'] } },
      },
      include: {
        user: true,
        teacherSubjects: {
          where: { tenantId },
          include: {
            subject: true,
            timetables: {
              where: { isActive: true },
              orderBy: [{ startTime: 'asc' }],
            },
          },
        },
      },
    });

    // Collect all unique time slots
    const timeSlots = new Set<string>();
    const scheduleMap = new Map<string, Map<number, string>>();

    staff.forEach((s) => {
      s.teacherSubjects.forEach((ts) => {
        ts.timetables.forEach((t) => {
          const timeKey = `${t.startTime}-${t.endTime}`;
          timeSlots.add(timeKey);

          if (!scheduleMap.has(timeKey)) {
            scheduleMap.set(timeKey, new Map());
          }

          const dayMap = scheduleMap.get(timeKey)!;
          const entry = `${s.user.name.split(' ')[0]} - ${ts.subject.code}`;
          dayMap.set(t.dayOfWeek, entry);
        });
      });
    });

    // Convert to array format
    const sortedTimeSlots = Array.from(timeSlots).sort((a, b) => {
      const [aStart] = a.split('-');
      const [bStart] = b.split('-');
      return aStart.localeCompare(bStart);
    });

    const timetable = sortedTimeSlots.map((timeKey) => {
      const dayMap = scheduleMap.get(timeKey) || new Map();
      const [start, end] = timeKey.split('-');

      return {
        time: `${start} - ${end}`,
        monday: dayMap.get(1) || null,
        tuesday: dayMap.get(2) || null,
        wednesday: dayMap.get(3) || null,
        thursday: dayMap.get(4) || null,
        friday: dayMap.get(5) || null,
        saturday: dayMap.get(6) || null,
      };
    });

    return {
      department: department
        ? { id: department.id, name: department.name, code: department.code }
        : null,
      timetable,
    };
  }

  /**
   * Get workload details for all faculty
   */
  async getWorkloadDetails(tenantId: string, userId: string) {
    const { departmentId, department } = await this.getHodDepartment(tenantId, userId);

    const staff = await this.prisma.staff.findMany({
      where: {
        tenantId,
        departmentId,
        user: { role: { in: ['teacher', 'hod'] } },
      },
      include: {
        user: true,
        teacherSubjects: {
          where: { tenantId },
          include: {
            subject: true,
            timetables: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { user: { name: 'asc' } },
    });

    const OPTIMAL_MIN = 2;
    const OPTIMAL_MAX = 4;

    const workloadData = staff.map((s) => {
      const subjectCount = s.teacherSubjects.length;
      const labCount = s.teacherSubjects.filter((ts) =>
        ts.subject.name.toLowerCase().includes('lab')
      ).length;
      const theoryCount = subjectCount - labCount;
      const totalClassesPerWeek = s.teacherSubjects.reduce(
        (sum, ts) => sum + ts.timetables.length,
        0
      );

      let status: 'underloaded' | 'optimal' | 'overloaded';
      if (subjectCount < OPTIMAL_MIN) {
        status = 'underloaded';
      } else if (subjectCount > OPTIMAL_MAX) {
        status = 'overloaded';
      } else {
        status = 'optimal';
      }

      return {
        id: s.id,
        name: s.user.name,
        employeeId: s.employeeId,
        designation: s.designation,
        subjectCount,
        theoryCount,
        labCount,
        totalClassesPerWeek,
        status,
        subjects: s.teacherSubjects.map((ts) => ({
          code: ts.subject.code,
          name: ts.subject.name,
          isLab: ts.subject.isLab,
        })),
      };
    });

    return {
      department: department
        ? { id: department.id, name: department.name, code: department.code }
        : null,
      faculty: workloadData,
    };
  }
}
