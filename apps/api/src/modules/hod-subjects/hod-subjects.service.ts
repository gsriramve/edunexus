import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  QuerySubjectsDto,
  CreateSubjectDto,
  UpdateSubjectDto,
  AssignFacultyDto,
} from './dto/hod-subjects.dto';

@Injectable()
export class HodSubjectsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get HoD's department ID from their staff record
   */
  private async getHodDepartment(tenantId: string, userId: string) {
    // Find user with HoD role - support both internal auth (id) and Clerk auth (clerkUserId)
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
   * Get all subjects for the HoD's department
   */
  async getSubjects(tenantId: string, userId: string, query: QuerySubjectsDto) {
    const { departmentId, department } = await this.getHodDepartment(tenantId, userId);

    // Get courses under this department
    const courses = await this.prisma.course.findMany({
      where: { tenantId, departmentId },
    });

    const courseIds = courses.map((c) => c.id);

    if (courseIds.length === 0) {
      return {
        department,
        courses: courses.map((c) => ({ id: c.id, name: c.name, code: c.code })),
        subjects: [],
        stats: {
          totalSubjects: 0,
          coreSubjects: 0,
          electiveSubjects: 0,
          labSubjects: 0,
          totalCredits: 0,
          totalFacultyAssignments: 0,
        },
      };
    }

    // Build subject filter
    const whereClause: any = {
      tenantId,
      courseId: { in: courseIds },
    };

    if (query.search) {
      whereClause.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.semester) {
      whereClause.semester = parseInt(query.semester);
    }

    if (query.courseId) {
      whereClause.courseId = query.courseId;
    }

    // Get subjects with faculty count
    const subjects = await this.prisma.subject.findMany({
      where: whereClause,
      include: {
        course: true,
        teacherSubjects: {
          where: { tenantId },
          include: {
            staff: {
              include: {
                user: true,
              },
            },
          },
        },
        _count: {
          select: {
            teacherSubjects: true,
            exams: true,
          },
        },
      },
      orderBy: [{ semester: 'asc' }, { code: 'asc' }],
    });

    // Get student count per department
    const studentCount = await this.prisma.student.count({
      where: {
        tenantId,
        departmentId,
        status: 'active',
      },
    });

    // Transform subjects
    const transformedSubjects = subjects.map((subject) => {
      // Determine subject type based on isLab or naming convention
      const subjectType = subject.isLab ? 'lab' :
        subject.code.includes('EL') || subject.name.toLowerCase().includes('elective')
          ? 'elective'
          : 'core';

      // Get unique sections
      const sections = [...new Set(subject.teacherSubjects.map((ts) => ts.section).filter(Boolean))];

      return {
        id: subject.id,
        code: subject.code,
        name: subject.name,
        semester: subject.semester,
        credits: subject.credits,
        isLab: subject.isLab,
        type: subjectType,
        courseId: subject.courseId,
        courseName: subject.course.name,
        courseCode: subject.course.code,
        facultyCount: subject._count.teacherSubjects,
        sections: sections.length || 1,
        studentsEnrolled: studentCount,
        examCount: subject._count.exams,
        lectureHours: subject.isLab ? 0 : 3,
        tutorialHours: subject.isLab ? 0 : 1,
        labHours: subject.isLab ? 3 : 0,
        faculty: subject.teacherSubjects.map((ts) => ({
          teacherSubjectId: ts.id,
          staffId: ts.staff.id,
          name: ts.staff.user.name,
          employeeId: ts.staff.employeeId,
          section: ts.section,
          academicYear: ts.academicYear,
        })),
      };
    });

    // Apply type filter after transformation
    let filteredSubjects = transformedSubjects;
    if (query.type && query.type !== 'all') {
      filteredSubjects = transformedSubjects.filter((s) => s.type === query.type);
    }

    // Calculate stats
    const stats = {
      totalSubjects: subjects.length,
      coreSubjects: transformedSubjects.filter((s) => s.type === 'core').length,
      electiveSubjects: transformedSubjects.filter((s) => s.type === 'elective').length,
      labSubjects: transformedSubjects.filter((s) => s.type === 'lab').length,
      totalCredits: subjects.reduce((sum, s) => sum + s.credits, 0),
      totalFacultyAssignments: subjects.reduce((sum, s) => sum + s._count.teacherSubjects, 0),
    };

    return {
      department,
      courses: courses.map((c) => ({ id: c.id, name: c.name, code: c.code })),
      subjects: filteredSubjects,
      stats,
    };
  }

  /**
   * Get single subject details
   */
  async getSubjectById(tenantId: string, userId: string, subjectId: string) {
    const { departmentId } = await this.getHodDepartment(tenantId, userId);

    const subject = await this.prisma.subject.findFirst({
      where: {
        id: subjectId,
        tenantId,
        course: { departmentId },
      },
      include: {
        course: true,
        teacherSubjects: {
          where: { tenantId },
          include: {
            staff: {
              include: {
                user: true,
              },
            },
          },
        },
        exams: {
          where: { tenantId },
          orderBy: { date: 'desc' },
          take: 5,
        },
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return {
      id: subject.id,
      code: subject.code,
      name: subject.name,
      semester: subject.semester,
      credits: subject.credits,
      isLab: subject.isLab,
      syllabus: subject.syllabus,
      course: { id: subject.course.id, name: subject.course.name, code: subject.course.code },
      faculty: subject.teacherSubjects.map((ts) => ({
        teacherSubjectId: ts.id,
        staffId: ts.staff.id,
        name: ts.staff.user.name,
        employeeId: ts.staff.employeeId,
        email: ts.staff.user.email,
        section: ts.section,
        academicYear: ts.academicYear,
      })),
      recentExams: subject.exams.map((e) => ({
        id: e.id,
        name: e.name,
        type: e.type,
        date: e.date,
        totalMarks: e.totalMarks,
      })),
    };
  }

  /**
   * Create a new subject
   */
  async createSubject(tenantId: string, userId: string, dto: CreateSubjectDto) {
    const { departmentId } = await this.getHodDepartment(tenantId, userId);

    // Verify course belongs to HoD's department
    const course = await this.prisma.course.findFirst({
      where: {
        id: dto.courseId,
        tenantId,
        departmentId,
      },
    });

    if (!course) {
      throw new BadRequestException('Course not found or not in your department');
    }

    // Check for duplicate code
    const existing = await this.prisma.subject.findFirst({
      where: { tenantId, code: dto.code },
    });

    if (existing) {
      throw new BadRequestException(`Subject with code ${dto.code} already exists`);
    }

    const subject = await this.prisma.subject.create({
      data: {
        tenantId,
        courseId: dto.courseId,
        code: dto.code,
        name: dto.name,
        semester: dto.semester,
        credits: dto.credits,
        isLab: dto.isLab || false,
        syllabus: dto.syllabus,
      },
      include: {
        course: true,
      },
    });

    return {
      id: subject.id,
      code: subject.code,
      name: subject.name,
      semester: subject.semester,
      credits: subject.credits,
      isLab: subject.isLab,
      course: { id: subject.course.id, name: subject.course.name, code: subject.course.code },
    };
  }

  /**
   * Update a subject
   */
  async updateSubject(
    tenantId: string,
    userId: string,
    subjectId: string,
    dto: UpdateSubjectDto
  ) {
    const { departmentId } = await this.getHodDepartment(tenantId, userId);

    // Verify subject belongs to HoD's department
    const subject = await this.prisma.subject.findFirst({
      where: {
        id: subjectId,
        tenantId,
        course: { departmentId },
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    const updated = await this.prisma.subject.update({
      where: { id: subjectId },
      data: {
        name: dto.name,
        semester: dto.semester,
        credits: dto.credits,
        isLab: dto.isLab,
        syllabus: dto.syllabus,
      },
      include: {
        course: true,
      },
    });

    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      semester: updated.semester,
      credits: updated.credits,
      isLab: updated.isLab,
      course: { id: updated.course.id, name: updated.course.name, code: updated.course.code },
    };
  }

  /**
   * Delete a subject
   */
  async deleteSubject(tenantId: string, userId: string, subjectId: string) {
    const { departmentId } = await this.getHodDepartment(tenantId, userId);

    // Verify subject belongs to HoD's department
    const subject = await this.prisma.subject.findFirst({
      where: {
        id: subjectId,
        tenantId,
        course: { departmentId },
      },
      include: {
        _count: {
          select: {
            teacherSubjects: true,
            exams: true,
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    // Check for dependencies
    if (subject._count.teacherSubjects > 0) {
      throw new BadRequestException(
        'Cannot delete subject with faculty assignments. Remove assignments first.'
      );
    }

    if (subject._count.exams > 0) {
      throw new BadRequestException(
        'Cannot delete subject with existing exams. Delete exams first.'
      );
    }

    await this.prisma.subject.delete({
      where: { id: subjectId },
    });

    return { success: true };
  }

  /**
   * Assign faculty to a subject
   */
  async assignFaculty(
    tenantId: string,
    userId: string,
    subjectId: string,
    dto: AssignFacultyDto
  ) {
    const { departmentId } = await this.getHodDepartment(tenantId, userId);

    // Verify subject belongs to HoD's department
    const subject = await this.prisma.subject.findFirst({
      where: {
        id: subjectId,
        tenantId,
        course: { departmentId },
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    // Verify staff exists and belongs to same department
    const staff = await this.prisma.staff.findFirst({
      where: {
        id: dto.staffId,
        tenantId,
        departmentId,
      },
    });

    if (!staff) {
      throw new BadRequestException('Staff not found or not in your department');
    }

    const academicYear = dto.academicYear || new Date().getFullYear().toString();

    // Check for existing assignment
    const existing = await this.prisma.teacherSubject.findFirst({
      where: {
        tenantId,
        staffId: dto.staffId,
        subjectId,
        section: dto.section || null,
        academicYear,
      },
    });

    if (existing) {
      throw new BadRequestException('Faculty already assigned to this subject/section');
    }

    const assignment = await this.prisma.teacherSubject.create({
      data: {
        tenantId,
        staffId: dto.staffId,
        subjectId,
        section: dto.section || null,
        academicYear,
      },
      include: {
        staff: {
          include: {
            user: true,
          },
        },
        subject: true,
      },
    });

    return {
      teacherSubjectId: assignment.id,
      staffId: assignment.staff.id,
      name: assignment.staff.user.name,
      employeeId: assignment.staff.employeeId,
      subject: {
        id: assignment.subject.id,
        code: assignment.subject.code,
        name: assignment.subject.name,
      },
      section: assignment.section,
      academicYear: assignment.academicYear,
    };
  }

  /**
   * Remove faculty from a subject
   */
  async removeFaculty(
    tenantId: string,
    userId: string,
    teacherSubjectId: string
  ) {
    const { departmentId } = await this.getHodDepartment(tenantId, userId);

    // Verify assignment exists and belongs to HoD's department
    const assignment = await this.prisma.teacherSubject.findFirst({
      where: {
        id: teacherSubjectId,
        tenantId,
        subject: {
          course: { departmentId },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Faculty assignment not found');
    }

    await this.prisma.teacherSubject.delete({
      where: { id: teacherSubjectId },
    });

    return { success: true };
  }

  /**
   * Get available faculty for assignment
   */
  async getAvailableFaculty(tenantId: string, userId: string) {
    const { departmentId } = await this.getHodDepartment(tenantId, userId);

    const faculty = await this.prisma.staff.findMany({
      where: {
        tenantId,
        departmentId,
      },
      include: {
        user: true,
        _count: {
          select: { teacherSubjects: true },
        },
      },
    });

    // Filter to only teacher/hod roles
    return faculty
      .filter((f) => f.user.role === 'teacher' || f.user.role === 'hod')
      .map((f) => ({
        id: f.id,
        name: f.user.name,
        employeeId: f.employeeId,
        email: f.user.email,
        designation: f.designation,
        subjectsAssigned: f._count.teacherSubjects,
      }));
  }
}
