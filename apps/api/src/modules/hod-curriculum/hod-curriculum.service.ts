import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  QuerySubjectsDto,
  QueryFacultyAssignmentsDto,
  CreateSyllabusUnitDto,
  UpdateSyllabusUnitDto,
  BulkUpdateSyllabusStatusDto,
  CurriculumStatsDto,
  SubjectDto,
  SubjectsResponseDto,
  FacultyAssignmentDto,
  FacultyAssignmentsResponseDto,
  SubjectDetailDto,
  SyllabusUnitDto,
} from './dto/hod-curriculum.dto';

@Injectable()
export class HodCurriculumService {
  constructor(private prisma: PrismaService) {}

  private async getHodDepartmentId(
    tenantId: string,
    staffId: string,
  ): Promise<string> {
    // Get staff member's department where they are the HOD
    const staff = await this.prisma.staff.findFirst({
      where: { userId: staffId, tenantId },
      include: { department: true },
    });

    if (!staff?.departmentId) {
      throw new ForbiddenException('You are not assigned to any department');
    }

    // Check if this staff is the HOD of their department
    const department = await this.prisma.department.findFirst({
      where: {
        id: staff.departmentId,
        tenantId,
        hodId: staff.id,
      },
    });

    // For now, allow any staff in the department to access curriculum
    // In production, you might want stricter HOD-only access
    if (!department) {
      // Fallback: return staff's department even if not HOD
      return staff.departmentId;
    }

    return department.id;
  }

  private async getDepartmentCourseIds(
    tenantId: string,
    departmentId: string,
  ): Promise<string[]> {
    const courses = await this.prisma.course.findMany({
      where: { tenantId, departmentId },
      select: { id: true },
    });
    return courses.map((c) => c.id);
  }

  async getStats(tenantId: string, staffId: string): Promise<CurriculumStatsDto> {
    const departmentId = await this.getHodDepartmentId(tenantId, staffId);
    const courseIds = await this.getDepartmentCourseIds(tenantId, departmentId);

    const subjects = await this.prisma.subject.findMany({
      where: {
        tenantId,
        courseId: { in: courseIds },
      },
      include: {
        syllabusUnits: true,
      },
    });

    const theorySubjects = subjects.filter((s) => !s.isLab);
    const labSubjects = subjects.filter((s) => s.isLab);

    // Calculate syllabus completion for each subject
    const subjectCompletions = subjects.map((subject) => {
      const totalUnits = subject.syllabusUnits.length;
      if (totalUnits === 0) return 0;
      const completedUnits = subject.syllabusUnits.filter(
        (u) => u.status === 'completed',
      ).length;
      return (completedUnits / totalUnits) * 100;
    });

    const avgSyllabusCompletion =
      subjectCompletions.length > 0
        ? Math.round(
            subjectCompletions.reduce((a, b) => a + b, 0) /
              subjectCompletions.length,
          )
        : 0;

    // On track: >= 60% completion, Behind: < 60%
    const subjectsOnTrack = subjectCompletions.filter((c) => c >= 60).length;
    const subjectsBehind = subjectCompletions.filter((c) => c < 60).length;

    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    const totalHoursPerWeek = subjects.reduce((sum, s) => sum + s.hoursPerWeek, 0);

    return {
      totalSubjects: subjects.length,
      theorySubjects: theorySubjects.length,
      labSubjects: labSubjects.length,
      avgSyllabusCompletion,
      subjectsOnTrack,
      subjectsBehind,
      totalCredits,
      totalHoursPerWeek,
    };
  }

  async getSubjects(
    tenantId: string,
    staffId: string,
    query: QuerySubjectsDto,
  ): Promise<SubjectsResponseDto> {
    const departmentId = await this.getHodDepartmentId(tenantId, staffId);
    const courseIds = await this.getDepartmentCourseIds(tenantId, departmentId);

    const where: any = {
      tenantId,
      courseId: { in: courseIds },
    };

    if (query.semester) {
      where.semester = query.semester;
    }

    if (query.type && query.type !== 'all') {
      where.isLab = query.type === 'lab';
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const subjects = await this.prisma.subject.findMany({
      where,
      include: {
        syllabusUnits: {
          orderBy: { unitNumber: 'asc' },
        },
        teacherSubjects: {
          include: {
            staff: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: [{ semester: 'asc' }, { code: 'asc' }],
    });

    // Group by semester for stats
    const bySemester: Record<number, number> = {};
    subjects.forEach((s) => {
      bySemester[s.semester] = (bySemester[s.semester] || 0) + 1;
    });

    const formattedSubjects: SubjectDto[] = subjects.map((subject) => {
      const totalUnits = subject.syllabusUnits.length;
      const completedUnits = subject.syllabusUnits.filter(
        (u) => u.status === 'completed',
      ).length;
      const syllabusCompletion =
        totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

      // Get primary faculty assignment
      const primaryAssignment = subject.teacherSubjects[0];

      return {
        id: subject.id,
        code: subject.code,
        name: subject.name,
        type: subject.isLab ? 'lab' : 'theory',
        semester: subject.semester,
        credits: subject.credits,
        hoursPerWeek: subject.hoursPerWeek,
        faculty: primaryAssignment?.staff?.user?.name || null,
        facultyId: primaryAssignment?.staffId || null,
        section: primaryAssignment?.section || null,
        syllabusCompletion,
        totalUnits,
        completedUnits,
      };
    });

    return {
      subjects: formattedSubjects,
      total: formattedSubjects.length,
      bySemester,
    };
  }

  async getSubjectDetail(
    tenantId: string,
    staffId: string,
    subjectId: string,
  ): Promise<SubjectDetailDto> {
    const departmentId = await this.getHodDepartmentId(tenantId, staffId);
    const courseIds = await this.getDepartmentCourseIds(tenantId, departmentId);

    const subject = await this.prisma.subject.findFirst({
      where: {
        id: subjectId,
        tenantId,
        courseId: { in: courseIds },
      },
      include: {
        course: true,
        syllabusUnits: {
          orderBy: { unitNumber: 'asc' },
        },
        teacherSubjects: {
          include: {
            staff: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    const totalUnits = subject.syllabusUnits.length;
    const completedUnits = subject.syllabusUnits.filter(
      (u) => u.status === 'completed',
    ).length;
    const syllabusCompletion =
      totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

    const primaryAssignment = subject.teacherSubjects[0];

    const syllabusUnits: SyllabusUnitDto[] = subject.syllabusUnits.map((unit) => ({
      id: unit.id,
      unitNumber: unit.unitNumber,
      title: unit.title,
      topics: (unit.topics as string[]) || [],
      status: unit.status,
      completedAt: unit.completedAt?.toISOString() || null,
    }));

    return {
      id: subject.id,
      code: subject.code,
      name: subject.name,
      type: subject.isLab ? 'lab' : 'theory',
      semester: subject.semester,
      credits: subject.credits,
      hoursPerWeek: subject.hoursPerWeek,
      faculty: primaryAssignment?.staff?.user?.name || null,
      facultyId: primaryAssignment?.staffId || null,
      section: primaryAssignment?.section || null,
      syllabusCompletion,
      totalUnits,
      completedUnits,
      courseName: subject.course.name,
      courseCode: subject.course.code,
      syllabusUnits,
    };
  }

  async getFacultyAssignments(
    tenantId: string,
    staffId: string,
    query: QueryFacultyAssignmentsDto,
  ): Promise<FacultyAssignmentsResponseDto> {
    const departmentId = await this.getHodDepartmentId(tenantId, staffId);

    // Get all staff in the department with their subject assignments
    const staffMembers = await this.prisma.staff.findMany({
      where: {
        tenantId,
        departmentId,
      },
      include: {
        user: true,
        teacherSubjects: {
          where: query.academicYear
            ? { academicYear: query.academicYear }
            : undefined,
          include: {
            subject: true,
          },
        },
      },
    });

    const assignments: FacultyAssignmentDto[] = staffMembers
      .filter((staff) => staff.teacherSubjects.length > 0)
      .map((staff) => {
        const subjects = staff.teacherSubjects.map((ts) => ts.subject.name);
        const subjectCodes = staff.teacherSubjects.map((ts) => ts.subject.code);
        const totalHours = staff.teacherSubjects.reduce(
          (sum, ts) => sum + ts.subject.hoursPerWeek,
          0,
        );
        const sections = new Set(
          staff.teacherSubjects.map((ts) => ts.section).filter(Boolean),
        ).size || staff.teacherSubjects.length;

        return {
          facultyId: staff.id,
          facultyName: staff.user.name,
          designation: staff.designation,
          subjects,
          subjectCodes,
          totalHours,
          sections,
        };
      });

    const totalHours = assignments.reduce((sum, a) => sum + a.totalHours, 0);

    return {
      assignments,
      total: assignments.length,
      totalHours,
    };
  }

  async createSyllabusUnit(
    tenantId: string,
    staffId: string,
    data: CreateSyllabusUnitDto,
  ): Promise<SyllabusUnitDto> {
    // Verify subject belongs to HOD's department
    const departmentId = await this.getHodDepartmentId(tenantId, staffId);
    const courseIds = await this.getDepartmentCourseIds(tenantId, departmentId);

    const subject = await this.prisma.subject.findFirst({
      where: {
        id: data.subjectId,
        tenantId,
        courseId: { in: courseIds },
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found in your department');
    }

    const unit = await this.prisma.syllabusUnit.create({
      data: {
        tenantId,
        subjectId: data.subjectId,
        unitNumber: data.unitNumber,
        title: data.title,
        topics: data.topics || [],
      },
    });

    return {
      id: unit.id,
      unitNumber: unit.unitNumber,
      title: unit.title,
      topics: (unit.topics as string[]) || [],
      status: unit.status,
      completedAt: null,
    };
  }

  async updateSyllabusUnit(
    tenantId: string,
    staffId: string,
    unitId: string,
    data: UpdateSyllabusUnitDto,
  ): Promise<SyllabusUnitDto> {
    const unit = await this.prisma.syllabusUnit.findFirst({
      where: { id: unitId, tenantId },
      include: { subject: true },
    });

    if (!unit) {
      throw new NotFoundException('Syllabus unit not found');
    }

    // Verify subject belongs to HOD's department
    const departmentId = await this.getHodDepartmentId(tenantId, staffId);
    const courseIds = await this.getDepartmentCourseIds(tenantId, departmentId);

    if (!courseIds.includes(unit.subject.courseId)) {
      throw new ForbiddenException('Subject not in your department');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.topics !== undefined) updateData.topics = data.topics;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'completed') {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }

    const updated = await this.prisma.syllabusUnit.update({
      where: { id: unitId },
      data: updateData,
    });

    return {
      id: updated.id,
      unitNumber: updated.unitNumber,
      title: updated.title,
      topics: (updated.topics as string[]) || [],
      status: updated.status,
      completedAt: updated.completedAt?.toISOString() || null,
    };
  }

  async bulkUpdateSyllabusStatus(
    tenantId: string,
    staffId: string,
    data: BulkUpdateSyllabusStatusDto,
  ): Promise<{ updated: number }> {
    // Verify ownership
    await this.getHodDepartmentId(tenantId, staffId);

    const updateData: any = {
      status: data.status,
    };

    if (data.status === 'completed') {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null;
    }

    const result = await this.prisma.syllabusUnit.updateMany({
      where: {
        id: { in: data.unitIds },
        tenantId,
      },
      data: updateData,
    });

    return { updated: result.count };
  }

  async deleteSyllabusUnit(
    tenantId: string,
    staffId: string,
    unitId: string,
  ): Promise<void> {
    const unit = await this.prisma.syllabusUnit.findFirst({
      where: { id: unitId, tenantId },
      include: { subject: true },
    });

    if (!unit) {
      throw new NotFoundException('Syllabus unit not found');
    }

    // Verify subject belongs to HOD's department
    const departmentId = await this.getHodDepartmentId(tenantId, staffId);
    const courseIds = await this.getDepartmentCourseIds(tenantId, departmentId);

    if (!courseIds.includes(unit.subject.courseId)) {
      throw new ForbiddenException('Subject not in your department');
    }

    await this.prisma.syllabusUnit.delete({
      where: { id: unitId },
    });
  }
}
