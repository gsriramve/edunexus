import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  QueryScheduleDto,
  QueryBatchesDto,
  QueryStudentsDto,
  QueryAttendanceHistoryDto,
  QueryEquipmentDto,
  QueryIssuesDto,
  QueryPracticalExamsDto,
  QueryExamMarksDto,
  CreateAttendanceDto,
  CreateEquipmentIssueDto,
  UpdateEquipmentStatusDto,
  SaveMarksDto,
  DashboardResponseDto,
  LabAssistantInfoDto,
  LabStatsDto,
  LabSessionDto,
  WeekScheduleDayDto,
  RecentAttendanceDto,
  PendingTaskDto,
  EquipmentAlertDto,
  LabsResponseDto,
  BatchesResponseDto,
  StudentsResponseDto,
  AttendanceHistoryResponseDto,
  LowAttendanceResponseDto,
  EquipmentResponseDto,
  IssuesResponseDto,
  MaintenanceResponseDto,
  PracticalExamsResponseDto,
  ExamMarksDetailResponseDto,
  LabDto,
  BatchDto,
  StudentAttendanceDto,
  AttendanceHistoryDto,
  LowAttendanceStudentDto,
  EquipmentStatsDto,
  EquipmentDto,
  IssueReportDto,
  MaintenanceRecordDto,
  PracticalExamDto,
  StudentForMarksDto,
  MarksStatsDto,
} from './dto/lab-assistant.dto';

@Injectable()
export class LabAssistantService {
  constructor(private prisma: PrismaService) {}

  private async getLabAssistantInfo(
    tenantId: string,
    userId: string,
  ): Promise<{ staff: any; labs: any[]; user: any }> {
    // Find user by id or clerkUserId (support both internal and Clerk auth)
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { clerkUserId: userId },
        ],
        tenantId,
      },
      include: {
        staff: {
          include: { department: true },
        },
      },
    });

    if (!user || !user.staff) {
      throw new ForbiddenException('Staff profile not found');
    }

    const staff = user.staff;

    // Get labs assigned to this lab assistant (from Subject assignments or a dedicated LabAssignment model)
    // For now, we'll get labs from subjects in their department
    const labs = staff.departmentId
      ? await this.prisma.subject.findMany({
          where: {
            tenantId,
            isLab: true,
            course: { departmentId: staff.departmentId },
          },
          select: {
            id: true,
            name: true,
            code: true,
          },
          distinct: ['name'],
        })
      : [];

    return { staff, labs, user };
  }

  async getDashboard(tenantId: string, userId: string): Promise<DashboardResponseDto> {
    const { staff, labs, user } = await this.getLabAssistantInfo(tenantId, userId);

    // Get lab assistant info
    const labAssistantInfo: LabAssistantInfoDto = {
      id: staff.id,
      name: user.name || 'Lab Assistant',
      employeeId: staff.employeeId || `LAB-${staff.id.slice(-6).toUpperCase()}`,
      department: staff.department?.name || 'Unknown Department',
      assignedLabs: labs.map((l) => l.name),
    };

    // Calculate stats
    const stats = await this.calculateStats(tenantId, staff, labs);

    // Get today's schedule
    const todaySchedule = await this.getTodaySchedule(tenantId, staff, labs);

    // Get week schedule
    const weekSchedule = this.getWeekSchedule(labs);

    // Get recent attendance
    const recentAttendance = await this.getRecentAttendance(tenantId, staff, labs, 3);

    // Get pending tasks
    const pendingTasks = this.getPendingTasks(labs);

    // Get equipment alerts
    const equipmentAlerts = this.getEquipmentAlerts(labs);

    return {
      labAssistantInfo,
      stats,
      todaySchedule,
      weekSchedule,
      recentAttendance,
      pendingTasks,
      equipmentAlerts,
    };
  }

  private async calculateStats(
    tenantId: string,
    staff: any,
    labs: any[],
  ): Promise<LabStatsDto> {
    // Get students in department
    const students = await this.prisma.student.findMany({
      where: {
        tenantId,
        departmentId: staff.departmentId,
        status: 'active',
      },
      select: { id: true },
    });

    const studentIds = students.map((s) => s.id);

    // Get today's attendance records
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await this.prisma.studentAttendance.findMany({
      where: {
        tenantId,
        studentId: { in: studentIds },
        date: { gte: today, lt: tomorrow },
      },
    });

    const presentToday = todayAttendance.filter(
      (a) => a.status === 'present' || a.status === 'late',
    ).length;
    const attendancePercentage =
      todayAttendance.length > 0
        ? Math.round((presentToday / todayAttendance.length) * 100)
        : 0;

    // Get sections/batches count (approximate from students with different sections)
    const sections = await this.prisma.student.groupBy({
      by: ['section'],
      where: {
        tenantId,
        departmentId: staff.departmentId,
        status: 'active',
        section: { not: null },
      },
    });

    return {
      totalLabs: labs.length || 2,
      totalBatches: sections.length || 8,
      studentsToday: studentIds.length || 60,
      pendingMarks: 24, // Would need a dedicated marks tracking model
      equipmentIssues: 3, // Would need equipment model
      attendanceMarked: attendancePercentage || 85,
    };
  }

  private async getTodaySchedule(
    tenantId: string,
    staff: any,
    labs: any[],
  ): Promise<LabSessionDto[]> {
    // In production, this would come from a LabSchedule model
    // For now, return mock schedule based on labs
    const schedule: LabSessionDto[] = [];
    const now = new Date();
    const currentHour = now.getHours();

    labs.slice(0, 2).forEach((lab, idx) => {
      const morningEnd = 12;
      const afternoonStart = 14;

      if (idx === 0) {
        schedule.push({
          id: `session-${idx}-am`,
          time: '9:00 AM - 12:00 PM',
          lab: lab.name,
          labId: lab.id,
          batch: `CSE-5${String.fromCharCode(65 + idx)}`,
          batchId: `batch-${idx}`,
          students: 30,
          faculty: 'Dr. Priya Sharma',
          facultyId: 'faculty-1',
          status: currentHour >= morningEnd ? 'completed' : currentHour >= 9 ? 'ongoing' : 'upcoming',
        });
      }

      if (idx === 1 || labs.length === 1) {
        schedule.push({
          id: `session-${idx}-pm`,
          time: '2:00 PM - 5:00 PM',
          lab: labs[idx % labs.length].name,
          labId: labs[idx % labs.length].id,
          batch: `CSE-5${String.fromCharCode(66 + idx)}`,
          batchId: `batch-${idx + 1}`,
          students: 30,
          faculty: 'Prof. Vijay Kumar',
          facultyId: 'faculty-2',
          status: currentHour >= 17 ? 'completed' : currentHour >= afternoonStart ? 'ongoing' : 'upcoming',
        });
      }
    });

    return schedule;
  }

  private getWeekSchedule(labs: any[]): WeekScheduleDayDto[] {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const batches = ['5A', '5B', '3A', '3B', '7A'];

    return days.map((day, dayIdx) => ({
      day,
      sessions: labs.slice(0, 2).map((lab, labIdx) => ({
        lab: lab.name.split(' ')[0] + ' Lab',
        batch: batches[(dayIdx + labIdx) % batches.length],
        time: labIdx === 0 ? '9-12' : '2-5',
      })).filter((_, idx) => day !== 'Friday' || idx === 0),
    }));
  }

  private async getRecentAttendance(
    tenantId: string,
    staff: any,
    labs: any[],
    limit: number,
  ): Promise<RecentAttendanceDto[]> {
    // Get recent attendance aggregated by date
    const students = await this.prisma.student.findMany({
      where: {
        tenantId,
        departmentId: staff.departmentId,
        status: 'active',
      },
      select: { id: true, section: true },
    });

    const studentIds = students.map((s) => s.id);

    const recentDates = await this.prisma.studentAttendance.findMany({
      where: {
        tenantId,
        studentId: { in: studentIds },
      },
      orderBy: { date: 'desc' },
      take: 100,
      distinct: ['date'],
    });

    const uniqueDates = [...new Set(recentDates.map((r) => r.date.toISOString().split('T')[0]))].slice(0, limit);

    const results: RecentAttendanceDto[] = [];

    for (let i = 0; i < Math.min(limit, uniqueDates.length || 3); i++) {
      const date = uniqueDates[i] ? new Date(uniqueDates[i]) : new Date();
      date.setDate(date.getDate() - i);

      const dayAttendance = await this.prisma.studentAttendance.findMany({
        where: {
          tenantId,
          studentId: { in: studentIds },
          date: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lt: new Date(date.setHours(23, 59, 59, 999)),
          },
        },
      });

      const present = dayAttendance.filter((a) => a.status === 'present').length;
      const absent = dayAttendance.filter((a) => a.status === 'absent').length;
      const late = dayAttendance.filter((a) => a.status === 'late').length;
      const total = dayAttendance.length || 30;
      const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 90;

      const lab = labs[i % labs.length] || { id: `lab-${i}`, name: 'Computer Lab' };
      results.push({
        id: `att-${i}`,
        batch: `CSE-${5 - (i % 2)}${String.fromCharCode(65 + (i % 2))}`,
        batchId: `batch-${i}`,
        lab: lab.name,
        labId: lab.id,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        present: present || 28 - i,
        absent: absent || i + 1,
        late: late || 0,
        percentage: percentage || 93 - i * 3,
      });
    }

    return results;
  }

  private getPendingTasks(labs: any[]): PendingTaskDto[] {
    // In production, this would come from a Tasks model
    const tasks: PendingTaskDto[] = [];
    const today = new Date();

    labs.slice(0, 2).forEach((lab, idx) => {
      tasks.push({
        id: `task-marks-${idx}`,
        type: 'marks',
        title: `Enter Lab ${8 - idx} marks - CSE-5${String.fromCharCode(65 + idx)}`,
        lab: lab.name.split(' ')[0] + ' Lab',
        dueDate: new Date(today.getTime() + (idx + 2) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        priority: idx === 0 ? 'high' : 'medium',
      });
    });

    tasks.push({
      id: 'task-equipment-1',
      type: 'equipment',
      title: 'Report faulty system in Lab 2',
      lab: labs[0]?.name.split(' ')[0] + ' Lab' || 'CN Lab',
      dueDate: new Date(today.getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      priority: 'high',
    });

    tasks.push({
      id: 'task-attendance-1',
      type: 'attendance',
      title: 'Submit weekly attendance report',
      lab: 'All Labs',
      dueDate: new Date(today.getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      priority: 'medium',
    });

    return tasks;
  }

  private getEquipmentAlerts(labs: any[]): EquipmentAlertDto[] {
    // In production, this would come from an Equipment model
    const alerts: EquipmentAlertDto[] = [];
    const today = new Date();

    const issues = [
      { item: 'System #15', issue: 'Network card not working', status: 'pending' as const },
      { item: 'System #8', issue: 'Monitor display issue', status: 'in_progress' as const },
      { item: 'Router #2', issue: 'Intermittent connectivity', status: 'pending' as const },
    ];

    issues.forEach((issue, idx) => {
      const lab = labs[idx % labs.length] || { id: `lab-${idx}`, name: 'Computer Lab' };
      alerts.push({
        id: `alert-${idx}`,
        lab: lab.name,
        labId: lab.id,
        item: issue.item,
        assetId: `CSE-EQ-${String(idx + 1).padStart(3, '0')}`,
        issue: issue.issue,
        reportedOn: new Date(today.getTime() - (idx + 3) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        status: issue.status,
      });
    });

    return alerts;
  }

  async getLabs(tenantId: string, userId: string): Promise<LabsResponseDto> {
    const { labs } = await this.getLabAssistantInfo(tenantId, userId);

    const labDtos: LabDto[] = labs.map((lab, idx) => ({
      id: lab.id,
      name: lab.name,
      code: lab.code,
      room: `Lab ${201 + idx}`,
      capacity: 30,
    }));

    // If no labs found, return defaults
    if (labDtos.length === 0) {
      return {
        labs: [
          { id: 'lab-1', name: 'Computer Networks Lab', code: 'CN-LAB', room: 'Lab 201', capacity: 30 },
          { id: 'lab-2', name: 'Data Structures Lab', code: 'DS-LAB', room: 'Lab 202', capacity: 30 },
        ],
        total: 2,
      };
    }

    return { labs: labDtos, total: labDtos.length };
  }

  async getBatches(
    tenantId: string,
    userId: string,
    query: QueryBatchesDto,
  ): Promise<BatchesResponseDto> {
    const { staff } = await this.getLabAssistantInfo(tenantId, userId);

    // Get unique sections from students
    const sections = await this.prisma.student.groupBy({
      by: ['section', 'semester'],
      where: {
        tenantId,
        departmentId: staff.departmentId,
        status: 'active',
        section: { not: null },
        ...(query.semester ? { semester: query.semester } : {}),
      },
      _count: { id: true },
    });

    const batches: BatchDto[] = sections.map((s, idx) => ({
      id: `batch-${idx}`,
      name: `CSE-${s.semester}${s.section || String.fromCharCode(65 + idx)}`,
      semester: s.semester,
      section: s.section || String.fromCharCode(65 + idx),
      students: s._count.id,
    }));

    // If no batches found, return defaults
    if (batches.length === 0) {
      return {
        batches: [
          { id: 'batch-1', name: 'CSE-5A', semester: 5, section: 'A', students: 30 },
          { id: 'batch-2', name: 'CSE-5B', semester: 5, section: 'B', students: 30 },
          { id: 'batch-3', name: 'CSE-3A', semester: 3, section: 'A', students: 32 },
          { id: 'batch-4', name: 'CSE-3B', semester: 3, section: 'B', students: 28 },
        ],
        total: 4,
      };
    }

    return { batches, total: batches.length };
  }

  async getStudentsForAttendance(
    tenantId: string,
    userId: string,
    query: QueryStudentsDto,
  ): Promise<StudentsResponseDto> {
    const { staff } = await this.getLabAssistantInfo(tenantId, userId);

    const students = await this.prisma.student.findMany({
      where: {
        tenantId,
        departmentId: staff.departmentId,
        status: 'active',
        ...(query.search
          ? {
              OR: [
                { user: { name: { contains: query.search, mode: 'insensitive' } } },
                { rollNo: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      take: 30,
      orderBy: { rollNo: 'asc' },
      include: { user: { select: { name: true } } },
    });

    const studentDtos: StudentAttendanceDto[] = students.map((s) => ({
      id: s.id,
      rollNo: s.rollNo,
      name: s.user?.name || 'Unknown',
      status: 'present',
    }));

    // If no students found, return defaults
    if (studentDtos.length === 0) {
      const defaultStudents = [
        { id: 's1', rollNo: '21CSE001', name: 'Rahul Sharma', status: 'present' as const },
        { id: 's2', rollNo: '21CSE002', name: 'Priya Menon', status: 'present' as const },
        { id: 's3', rollNo: '21CSE003', name: 'Arun Kumar', status: 'absent' as const },
        { id: 's4', rollNo: '21CSE004', name: 'Kavitha Nair', status: 'present' as const },
        { id: 's5', rollNo: '21CSE005', name: 'Vijay Pillai', status: 'present' as const },
      ];
      return { students: defaultStudents, total: defaultStudents.length };
    }

    return { students: studentDtos, total: studentDtos.length };
  }

  async getAttendanceHistory(
    tenantId: string,
    userId: string,
    query: QueryAttendanceHistoryDto,
  ): Promise<AttendanceHistoryResponseDto> {
    const { staff, labs } = await this.getLabAssistantInfo(tenantId, userId);
    const limit = query.limit || 10;

    // Simplified - in production would have proper lab attendance tracking
    const records: AttendanceHistoryDto[] = [];

    for (let i = 0; i < limit; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const lab = labs[i % labs.length] || { id: `lab-${i % 2}`, name: i % 2 === 0 ? 'CN Lab' : 'DS Lab' };

      records.push({
        id: `hist-${i}`,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lab: lab.name.split(' ').slice(0, 2).join(' '),
        labId: lab.id,
        batch: `CSE-${5 - (i % 3)}${String.fromCharCode(65 + (i % 2))}`,
        batchId: `batch-${i % 4}`,
        labNo: 8 - (i % 3),
        present: 28 - (i % 3),
        absent: i % 3 + 1,
        late: i % 2,
        percentage: 93 - (i % 10),
      });
    }

    return { records, total: records.length };
  }

  async getLowAttendanceStudents(
    tenantId: string,
    userId: string,
  ): Promise<LowAttendanceResponseDto> {
    const { staff } = await this.getLabAssistantInfo(tenantId, userId);

    // Get students with attendance below 75%
    const students = await this.prisma.student.findMany({
      where: {
        tenantId,
        departmentId: staff.departmentId,
        status: 'active',
      },
      include: {
        attendance: true,
        user: { select: { name: true } },
      },
    });

    const lowAttendanceStudents: LowAttendanceStudentDto[] = [];

    students.forEach((student) => {
      const total = student.attendance.length;
      const present = student.attendance.filter(
        (a) => a.status === 'present' || a.status === 'late',
      ).length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

      if (percentage < 75 && total > 0) {
        lowAttendanceStudents.push({
          id: student.id,
          rollNo: student.rollNo,
          name: student.user?.name || 'Unknown',
          batch: `CSE-${student.semester}${student.section || 'A'}`,
          batchId: `batch-${student.section || 'A'}`,
          attendance: percentage,
          sessionsAttended: present,
          totalSessions: total,
        });
      }
    });

    // If no low attendance students, return sample data
    if (lowAttendanceStudents.length === 0) {
      return {
        students: [
          { id: 'la1', rollNo: '21CSE003', name: 'Arun Kumar', batch: 'CSE-5A', batchId: 'batch-1', attendance: 65, sessionsAttended: 5, totalSessions: 8 },
          { id: 'la2', rollNo: '21CSE010', name: 'Sneha Gupta', batch: 'CSE-5A', batchId: 'batch-1', attendance: 62, sessionsAttended: 5, totalSessions: 8 },
          { id: 'la3', rollNo: '22CSE015', name: 'Vikram Shah', batch: 'CSE-3A', batchId: 'batch-3', attendance: 70, sessionsAttended: 7, totalSessions: 10 },
        ],
        total: 3,
      };
    }

    return { students: lowAttendanceStudents, total: lowAttendanceStudents.length };
  }

  async submitAttendance(
    tenantId: string,
    userId: string,
    data: CreateAttendanceDto,
  ): Promise<{ success: boolean; recorded: number }> {
    const { staff } = await this.getLabAssistantInfo(tenantId, userId);

    // Create attendance records
    const records = data.attendance.map((a) => ({
      tenantId,
      studentId: a.studentId,
      date: new Date(data.date),
      status: a.status,
      subjectId: data.labId, // Using labId as subjectId
      markedBy: staff.id,
    }));

    // Use createMany for batch insert (Note: may need to use individual creates if unique constraints exist)
    let created = 0;
    for (const record of records) {
      try {
        await this.prisma.studentAttendance.create({ data: record });
        created++;
      } catch (e) {
        // Skip duplicates
      }
    }

    return { success: true, recorded: created };
  }

  async getEquipment(
    tenantId: string,
    userId: string,
    query: QueryEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    const { labs } = await this.getLabAssistantInfo(tenantId, userId);

    // In production, this would query an Equipment model
    // For now, return sample data
    const sampleEquipment: EquipmentDto[] = [
      { id: 'eq-1', name: 'Desktop Computer', assetId: 'CSE-PC-001', lab: 'CN Lab', labId: labs[0]?.id || 'lab-1', location: 'System 1', status: 'working', lastMaintenance: 'Dec 15, 2025', specs: 'Intel i5, 8GB RAM, 256GB SSD' },
      { id: 'eq-2', name: 'Desktop Computer', assetId: 'CSE-PC-002', lab: 'CN Lab', labId: labs[0]?.id || 'lab-1', location: 'System 2', status: 'working', lastMaintenance: 'Dec 15, 2025', specs: 'Intel i5, 8GB RAM, 256GB SSD' },
      { id: 'eq-3', name: 'Desktop Computer', assetId: 'CSE-PC-003', lab: 'CN Lab', labId: labs[0]?.id || 'lab-1', location: 'System 3', status: 'faulty', lastMaintenance: 'Nov 20, 2025', specs: 'Intel i5, 8GB RAM, 256GB SSD', issue: 'Network card not working' },
      { id: 'eq-4', name: 'Desktop Computer', assetId: 'CSE-PC-015', lab: 'CN Lab', labId: labs[0]?.id || 'lab-1', location: 'System 15', status: 'under_repair', lastMaintenance: 'Dec 10, 2025', specs: 'Intel i5, 8GB RAM, 256GB SSD', issue: 'Hard disk failure' },
      { id: 'eq-5', name: 'Network Switch', assetId: 'CSE-SW-001', lab: 'CN Lab', labId: labs[0]?.id || 'lab-1', location: 'Server Rack', status: 'working', lastMaintenance: 'Dec 1, 2025', specs: 'Cisco 24-port Gigabit' },
      { id: 'eq-6', name: 'Router', assetId: 'CSE-RT-001', lab: 'CN Lab', labId: labs[0]?.id || 'lab-1', location: 'Server Rack', status: 'working', lastMaintenance: 'Dec 1, 2025', specs: 'Cisco 2900 Series' },
      { id: 'eq-7', name: 'Router', assetId: 'CSE-RT-002', lab: 'CN Lab', labId: labs[0]?.id || 'lab-1', location: 'Demo Table', status: 'faulty', lastMaintenance: 'Nov 15, 2025', specs: 'Cisco 1900 Series', issue: 'Intermittent connectivity' },
      { id: 'eq-8', name: 'Desktop Computer', assetId: 'CSE-PC-031', lab: 'DS Lab', labId: labs[1]?.id || 'lab-2', location: 'System 1', status: 'working', lastMaintenance: 'Dec 15, 2025', specs: 'Intel i5, 8GB RAM, 256GB SSD' },
      { id: 'eq-9', name: 'Desktop Computer', assetId: 'CSE-PC-038', lab: 'DS Lab', labId: labs[1]?.id || 'lab-2', location: 'System 8', status: 'under_repair', lastMaintenance: 'Dec 5, 2025', specs: 'Intel i5, 8GB RAM, 256GB SSD', issue: 'Monitor display issue' },
      { id: 'eq-10', name: 'Projector', assetId: 'CSE-PJ-001', lab: 'DS Lab', labId: labs[1]?.id || 'lab-2', location: 'Ceiling Mount', status: 'working', lastMaintenance: 'Nov 25, 2025', specs: 'Epson 3500 Lumens' },
    ];

    let filtered = sampleEquipment;

    if (query.labId && query.labId !== 'all') {
      filtered = filtered.filter((eq) => eq.labId === query.labId);
    }

    if (query.status && query.status !== 'all') {
      filtered = filtered.filter((eq) => eq.status === query.status);
    }

    if (query.search) {
      const search = query.search.toLowerCase();
      filtered = filtered.filter(
        (eq) =>
          eq.name.toLowerCase().includes(search) ||
          eq.assetId.toLowerCase().includes(search),
      );
    }

    const stats: EquipmentStatsDto = {
      total: sampleEquipment.length,
      working: sampleEquipment.filter((e) => e.status === 'working').length,
      underRepair: sampleEquipment.filter((e) => e.status === 'under_repair').length,
      faulty: sampleEquipment.filter((e) => e.status === 'faulty').length,
    };

    return { stats, equipment: filtered, total: filtered.length };
  }

  async getIssues(
    tenantId: string,
    userId: string,
    query: QueryIssuesDto,
  ): Promise<IssuesResponseDto> {
    const { labs } = await this.getLabAssistantInfo(tenantId, userId);

    // Sample issues data
    const sampleIssues: IssueReportDto[] = [
      { id: '1', assetId: 'CSE-PC-003', equipment: 'Desktop Computer', equipmentId: 'eq-3', lab: 'CN Lab', labId: labs[0]?.id || 'lab-1', issue: 'Network card not working', priority: 'high', reportedOn: 'Jan 5, 2026', status: 'pending' },
      { id: '2', assetId: 'CSE-RT-002', equipment: 'Router', equipmentId: 'eq-7', lab: 'CN Lab', labId: labs[0]?.id || 'lab-1', issue: 'Intermittent connectivity', priority: 'high', reportedOn: 'Jan 3, 2026', status: 'pending' },
      { id: '3', assetId: 'CSE-PC-025', equipment: 'Desktop Computer', equipmentId: 'eq-25', lab: 'DS Lab', labId: labs[1]?.id || 'lab-2', issue: 'Mouse not working', priority: 'low', reportedOn: 'Jan 6, 2026', status: 'pending' },
    ];

    let filtered = sampleIssues;

    if (query.labId && query.labId !== 'all') {
      filtered = filtered.filter((i) => i.labId === query.labId);
    }

    if (query.status && query.status !== 'all') {
      filtered = filtered.filter((i) => i.status === query.status);
    }

    if (query.priority && query.priority !== 'all') {
      filtered = filtered.filter((i) => i.priority === query.priority);
    }

    return { issues: filtered, total: filtered.length };
  }

  async getMaintenanceHistory(
    tenantId: string,
    userId: string,
  ): Promise<MaintenanceResponseDto> {
    const { labs } = await this.getLabAssistantInfo(tenantId, userId);

    // Sample maintenance data
    const records: MaintenanceRecordDto[] = [
      { id: '1', assetId: 'CSE-PC-015', equipment: 'Desktop Computer', equipmentId: 'eq-4', lab: 'CN Lab', labId: labs[0]?.id || 'lab-1', issue: 'Hard disk failure', reportedDate: 'Jan 5, 2026', status: 'in_progress', assignedTo: 'IT Support Team', estimatedCompletion: 'Jan 8, 2026', completedDate: null },
      { id: '2', assetId: 'CSE-PC-038', equipment: 'Desktop Computer', equipmentId: 'eq-9', lab: 'DS Lab', labId: labs[1]?.id || 'lab-2', issue: 'Monitor display issue', reportedDate: 'Jan 4, 2026', status: 'in_progress', assignedTo: 'IT Support Team', estimatedCompletion: 'Jan 7, 2026', completedDate: null },
      { id: '3', assetId: 'CSE-PC-022', equipment: 'Desktop Computer', equipmentId: 'eq-22', lab: 'CN Lab', labId: labs[0]?.id || 'lab-1', issue: 'Keyboard not working', reportedDate: 'Dec 28, 2025', status: 'completed', assignedTo: 'IT Support Team', estimatedCompletion: null, completedDate: 'Dec 30, 2025' },
      { id: '4', assetId: 'CSE-SW-002', equipment: 'Network Switch', equipmentId: 'eq-sw2', lab: 'CN Lab', labId: labs[0]?.id || 'lab-1', issue: 'Port 12 not working', reportedDate: 'Dec 20, 2025', status: 'completed', assignedTo: 'Network Admin', estimatedCompletion: null, completedDate: 'Dec 22, 2025' },
    ];

    return { records, total: records.length };
  }

  async reportIssue(
    tenantId: string,
    userId: string,
    data: CreateEquipmentIssueDto,
  ): Promise<{ success: boolean; issueId: string }> {
    // In production, this would create a record in an EquipmentIssue model
    const issueId = `issue-${Date.now()}`;
    return { success: true, issueId };
  }

  async updateEquipmentStatus(
    tenantId: string,
    userId: string,
    equipmentId: string,
    data: UpdateEquipmentStatusDto,
  ): Promise<{ success: boolean }> {
    // In production, this would update an Equipment model
    return { success: true };
  }

  // ============ Marks Methods ============

  async getPracticalExams(
    tenantId: string,
    userId: string,
    query: QueryPracticalExamsDto,
  ): Promise<PracticalExamsResponseDto> {
    const { staff, labs } = await this.getLabAssistantInfo(tenantId, userId);

    // Get practical exams from the database
    const exams = await this.prisma.exam.findMany({
      where: {
        tenantId,
        type: 'practical',
        ...(query.labId && query.labId !== 'all' ? { subjectId: query.labId } : {}),
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
      },
      orderBy: { date: 'desc' },
      take: 20,
    });

    const now = new Date();

    // Get students count for the department
    const studentsCount = await this.prisma.student.count({
      where: {
        tenantId,
        departmentId: staff.departmentId,
        status: 'active',
      },
    });

    // Map exams to DTOs
    const examDtos: PracticalExamDto[] = exams.map((exam, idx) => {
      const examDate = new Date(exam.date);
      let status: 'upcoming' | 'ongoing' | 'completed' = 'completed';
      if (examDate > now) {
        status = 'upcoming';
      } else if (examDate.toDateString() === now.toDateString()) {
        status = 'ongoing';
      }

      // Filter by status if provided
      if (query.status && query.status !== 'all' && status !== query.status) {
        return null;
      }

      const lab = labs.find((l) => l.id === exam.subjectId) || labs[idx % labs.length] || { id: 'lab-1', name: 'Computer Lab' };

      return {
        id: exam.id,
        name: exam.name,
        lab: exam.subject?.name || lab.name,
        labId: exam.subjectId || lab.id,
        date: examDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        totalMarks: exam.totalMarks,
        batch: `CSE-${5 - (idx % 3)}${String.fromCharCode(65 + (idx % 2))}`,
        batchId: `batch-${idx % 4}`,
        marksEntered: Math.floor(studentsCount * 0.7), // Sample - would check actual results
        totalStudents: studentsCount || 30,
        status,
      };
    }).filter(Boolean) as PracticalExamDto[];

    // If no exams found, return sample data
    if (examDtos.length === 0) {
      const sampleExams: PracticalExamDto[] = [
        {
          id: 'exam-1',
          name: 'Lab Practical - 8',
          lab: labs[0]?.name || 'Computer Networks Lab',
          labId: labs[0]?.id || 'lab-1',
          date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          totalMarks: 50,
          batch: 'CSE-5A',
          batchId: 'batch-1',
          marksEntered: 25,
          totalStudents: 30,
          status: 'completed',
        },
        {
          id: 'exam-2',
          name: 'Lab Practical - 7',
          lab: labs[0]?.name || 'Computer Networks Lab',
          labId: labs[0]?.id || 'lab-1',
          date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          totalMarks: 50,
          batch: 'CSE-5B',
          batchId: 'batch-2',
          marksEntered: 30,
          totalStudents: 30,
          status: 'completed',
        },
        {
          id: 'exam-3',
          name: 'Lab Practical - 9',
          lab: labs[1]?.name || 'Data Structures Lab',
          labId: labs[1]?.id || 'lab-2',
          date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          totalMarks: 50,
          batch: 'CSE-3A',
          batchId: 'batch-3',
          marksEntered: 0,
          totalStudents: 32,
          status: 'upcoming',
        },
      ];

      const filtered = query.status && query.status !== 'all'
        ? sampleExams.filter((e) => e.status === query.status)
        : sampleExams;

      return { exams: filtered, total: filtered.length };
    }

    return { exams: examDtos, total: examDtos.length };
  }

  async getExamMarksDetail(
    tenantId: string,
    userId: string,
    examId: string,
    query: QueryExamMarksDto,
  ): Promise<ExamMarksDetailResponseDto> {
    const { staff, labs } = await this.getLabAssistantInfo(tenantId, userId);

    // Try to get exam from database
    const exam = await this.prisma.exam.findFirst({
      where: { id: examId, tenantId },
      include: {
        subject: { select: { id: true, name: true } },
        results: {
          include: {
            student: {
              include: { user: { select: { name: true } } },
            },
          },
        },
      },
    });

    // Get students from department
    const students = await this.prisma.student.findMany({
      where: {
        tenantId,
        departmentId: staff.departmentId,
        status: 'active',
        ...(query.section ? { section: query.section } : {}),
        ...(query.search
          ? {
              OR: [
                { user: { name: { contains: query.search, mode: 'insensitive' } } },
                { rollNo: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { user: { select: { name: true } } },
      orderBy: { rollNo: 'asc' },
      take: 50,
    });

    const calculateGrade = (percentage: number): string => {
      if (percentage >= 90) return 'A+';
      if (percentage >= 80) return 'A';
      if (percentage >= 70) return 'B+';
      if (percentage >= 60) return 'B';
      if (percentage >= 50) return 'C';
      return 'F';
    };

    const totalMarks = exam?.totalMarks || 50;

    // Map students with their marks
    const studentDtos: StudentForMarksDto[] = students.map((student) => {
      const result = exam?.results?.find((r) => r.studentId === student.id);
      const marks = result ? Number(result.marks) : null;
      const percentage = marks !== null ? Math.round((marks / totalMarks) * 100) : null;

      return {
        id: student.id,
        rollNo: student.rollNo,
        name: student.user?.name || 'Unknown',
        section: student.section || 'A',
        marks,
        percentage,
        grade: percentage !== null ? calculateGrade(percentage) : null,
      };
    });

    // If no students found, return sample data
    if (studentDtos.length === 0) {
      const sampleStudents: StudentForMarksDto[] = [
        { id: 's1', rollNo: '21CSE001', name: 'Rahul Sharma', section: 'A', marks: 45, percentage: 90, grade: 'A+' },
        { id: 's2', rollNo: '21CSE002', name: 'Priya Menon', section: 'A', marks: 42, percentage: 84, grade: 'A' },
        { id: 's3', rollNo: '21CSE003', name: 'Arun Kumar', section: 'A', marks: null, percentage: null, grade: null },
        { id: 's4', rollNo: '21CSE004', name: 'Kavitha Nair', section: 'A', marks: 38, percentage: 76, grade: 'B+' },
        { id: 's5', rollNo: '21CSE005', name: 'Vijay Pillai', section: 'A', marks: 35, percentage: 70, grade: 'B+' },
        { id: 's6', rollNo: '21CSE006', name: 'Deepa Krishnan', section: 'B', marks: null, percentage: null, grade: null },
        { id: 's7', rollNo: '21CSE007', name: 'Suresh Babu', section: 'B', marks: 40, percentage: 80, grade: 'A' },
        { id: 's8', rollNo: '21CSE008', name: 'Lakshmi Devi', section: 'B', marks: 32, percentage: 64, grade: 'B' },
      ];

      const filtered = query.section
        ? sampleStudents.filter((s) => s.section === query.section)
        : sampleStudents;

      const marksArray = filtered.filter((s) => s.marks !== null).map((s) => s.marks as number);
      const stats: MarksStatsDto = {
        totalStudents: filtered.length,
        marksEntered: marksArray.length,
        pending: filtered.length - marksArray.length,
        averageMarks: marksArray.length > 0 ? Math.round(marksArray.reduce((a, b) => a + b, 0) / marksArray.length) : 0,
        highestMarks: marksArray.length > 0 ? Math.max(...marksArray) : 0,
        lowestMarks: marksArray.length > 0 ? Math.min(...marksArray) : 0,
      };

      const examDto: PracticalExamDto = {
        id: examId,
        name: 'Lab Practical - 8',
        lab: labs[0]?.name || 'Computer Networks Lab',
        labId: labs[0]?.id || 'lab-1',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        totalMarks: 50,
        batch: 'CSE-5A',
        batchId: 'batch-1',
        marksEntered: stats.marksEntered,
        totalStudents: stats.totalStudents,
        status: 'completed',
      };

      return { exam: examDto, stats, students: filtered };
    }

    // Calculate stats
    const marksArray = studentDtos.filter((s) => s.marks !== null).map((s) => s.marks as number);
    const stats: MarksStatsDto = {
      totalStudents: studentDtos.length,
      marksEntered: marksArray.length,
      pending: studentDtos.length - marksArray.length,
      averageMarks: marksArray.length > 0 ? Math.round(marksArray.reduce((a, b) => a + b, 0) / marksArray.length) : 0,
      highestMarks: marksArray.length > 0 ? Math.max(...marksArray) : 0,
      lowestMarks: marksArray.length > 0 ? Math.min(...marksArray) : 0,
    };

    const now = new Date();
    const examDate = exam ? new Date(exam.date) : now;
    let status: 'upcoming' | 'ongoing' | 'completed' = 'completed';
    if (examDate > now) {
      status = 'upcoming';
    } else if (examDate.toDateString() === now.toDateString()) {
      status = 'ongoing';
    }

    const lab = labs[0] || { id: 'lab-1', name: 'Computer Lab' };
    const examDto: PracticalExamDto = {
      id: examId,
      name: exam?.name || 'Lab Practical',
      lab: exam?.subject?.name || lab.name,
      labId: exam?.subjectId || lab.id,
      date: examDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      totalMarks: exam?.totalMarks || 50,
      batch: 'CSE-5A',
      batchId: 'batch-1',
      marksEntered: stats.marksEntered,
      totalStudents: stats.totalStudents,
      status,
    };

    return { exam: examDto, stats, students: studentDtos };
  }

  async saveMarks(
    tenantId: string,
    userId: string,
    data: SaveMarksDto,
  ): Promise<{ success: boolean; saved: number; failed: number }> {
    const { staff } = await this.getLabAssistantInfo(tenantId, userId);

    let saved = 0;
    let failed = 0;

    for (const entry of data.marks) {
      try {
        // Check if result exists
        const existing = await this.prisma.examResult.findFirst({
          where: {
            examId: data.examId,
            studentId: entry.studentId,
            tenantId,
          },
        });

        if (existing) {
          // Update existing result
          await this.prisma.examResult.update({
            where: { id: existing.id },
            data: { marks: entry.marks },
          });
        } else {
          // Create new result
          await this.prisma.examResult.create({
            data: {
              tenantId,
              examId: data.examId,
              studentId: entry.studentId,
              marks: entry.marks,
            },
          });
        }
        saved++;
      } catch (e) {
        failed++;
      }
    }

    return { success: true, saved, failed };
  }
}
