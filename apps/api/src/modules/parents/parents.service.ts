import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ParentChild {
  id: string;
  firstName: string;
  lastName: string;
  rollNo: string | null;
  email: string | null;
  phone: string | null;
  departmentId: string | null;
  departmentName: string | null;
  semester: number;
  section: string | null;
  status: string;
  admissionDate: Date | null;
}

export interface ParentProfile {
  id: string;
  userId: string;
  studentId: string;
  relation: string;
  studentName: string;
  studentRollNo: string | null;
}

@Injectable()
export class ParentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all children linked to a parent user
   */
  async getChildren(tenantId: string, clerkUserId: string): Promise<ParentChild[]> {
    // First find the user by clerkUserId
    const user = await this.prisma.user.findFirst({
      where: { clerkUserId, tenantId },
    });

    if (!user) {
      return [];
    }

    // Find all parent-student links for this user
    const parentLinks = await this.prisma.parent.findMany({
      where: {
        tenantId,
        userId: user.id,
      },
      include: {
        student: {
          include: {
            user: true,
            department: true,
          },
        },
      },
    });

    // Map to the expected format
    return parentLinks.map((link) => ({
      id: link.student.id,
      firstName: link.student.user?.name?.split(' ')[0] || '',
      lastName: link.student.user?.name?.split(' ').slice(1).join(' ') || '',
      rollNo: link.student.rollNo,
      email: link.student.user?.email || null,
      phone: null, // Phone is typically in contacts
      departmentId: link.student.departmentId,
      departmentName: link.student.department?.name || null,
      semester: link.student.semester || 1,
      section: link.student.section || null,
      status: link.student.status || 'active',
      admissionDate: link.student.admissionDate,
    }));
  }

  /**
   * Get parent profile by user ID
   */
  async getProfile(tenantId: string, clerkUserId: string): Promise<ParentProfile[]> {
    // First find the user by clerkUserId
    const user = await this.prisma.user.findFirst({
      where: { clerkUserId, tenantId },
    });

    if (!user) {
      return [];
    }

    const parentLinks = await this.prisma.parent.findMany({
      where: {
        tenantId,
        userId: user.id,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    return parentLinks.map((link) => ({
      id: link.id,
      userId: link.userId,
      studentId: link.studentId,
      relation: link.relation,
      studentName: link.student.user?.name || 'Unknown',
      studentRollNo: link.student.rollNo,
    }));
  }

  /**
   * Get a specific child's details (validates parent has access)
   */
  async getChild(
    tenantId: string,
    clerkUserId: string,
    studentId: string,
  ): Promise<ParentChild | null> {
    // First find the user by clerkUserId
    const user = await this.prisma.user.findFirst({
      where: { clerkUserId, tenantId },
    });

    if (!user) {
      return null;
    }

    // Verify parent has access to this student
    const parentLink = await this.prisma.parent.findFirst({
      where: {
        tenantId,
        userId: user.id,
        studentId,
      },
      include: {
        student: {
          include: {
            user: true,
            department: true,
          },
        },
      },
    });

    if (!parentLink) {
      return null;
    }

    return {
      id: parentLink.student.id,
      firstName: parentLink.student.user?.name?.split(' ')[0] || '',
      lastName: parentLink.student.user?.name?.split(' ').slice(1).join(' ') || '',
      rollNo: parentLink.student.rollNo,
      email: parentLink.student.user?.email || null,
      phone: null,
      departmentId: parentLink.student.departmentId,
      departmentName: parentLink.student.department?.name || null,
      semester: parentLink.student.semester || 1,
      section: parentLink.student.section || null,
      status: parentLink.student.status || 'active',
      admissionDate: parentLink.student.admissionDate,
    };
  }
}
