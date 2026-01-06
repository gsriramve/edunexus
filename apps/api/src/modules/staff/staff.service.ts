import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStaffDto, UpdateStaffDto, StaffQueryDto, StaffRole } from './dto/create-staff.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createStaffDto: CreateStaffDto) {
    // Check if employee ID already exists
    const existingEmployee = await this.prisma.staff.findFirst({
      where: { tenantId, employeeId: createStaffDto.employeeId },
    });

    if (existingEmployee) {
      throw new ConflictException('Employee ID already exists');
    }

    // Check if email already exists in this tenant
    const existingEmail = await this.prisma.user.findFirst({
      where: { tenantId, email: createStaffDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    // Verify department exists
    const department = await this.prisma.department.findFirst({
      where: { id: createStaffDto.departmentId, tenantId },
    });

    if (!department) {
      throw new BadRequestException('Department not found');
    }

    // Create user and staff in a transaction
    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create user account
      const user = await tx.user.create({
        data: {
          tenantId,
          email: createStaffDto.email,
          name: `${createStaffDto.firstName} ${createStaffDto.lastName}`,
          role: this.mapStaffRoleToUserRole(createStaffDto.role),
          status: 'active',
        },
      });

      // Create user profile
      await tx.userProfile.create({
        data: {
          userId: user.id,
        },
      });

      // Create staff record
      const staff = await tx.staff.create({
        data: {
          tenantId,
          userId: user.id,
          employeeId: createStaffDto.employeeId,
          designation: createStaffDto.designation,
          departmentId: createStaffDto.departmentId,
          joiningDate: new Date(createStaffDto.joiningDate),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              profile: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      return staff;
    });

    return result;
  }

  async findAll(tenantId: string, query: StaffQueryDto) {
    const { search, departmentId, role, status, limit = 20, offset = 0 } = query;

    const where: any = { tenantId };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (role || status) {
      where.user = {};
      if (role) {
        where.user.role = this.mapStaffRoleToUserRole(role);
      }
      if (status) {
        where.user.status = status;
      }
    }

    if (search) {
      where.OR = [
        { employeeId: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [staff, total] = await Promise.all([
      this.prisma.staff.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              profile: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
      this.prisma.staff.count({ where }),
    ]);

    return {
      data: staff,
      total,
      limit,
      offset,
    };
  }

  async findOne(tenantId: string, id: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { id, tenantId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            profile: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        teacherSubjects: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    return staff;
  }

  async update(tenantId: string, id: string, updateStaffDto: UpdateStaffDto) {
    const existing = await this.prisma.staff.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Staff member not found');
    }

    if (updateStaffDto.departmentId) {
      const department = await this.prisma.department.findFirst({
        where: { id: updateStaffDto.departmentId, tenantId },
      });

      if (!department) {
        throw new BadRequestException('Department not found');
      }
    }

    // Update staff and user in a transaction
    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update user name if firstName/lastName changed
      if (updateStaffDto.firstName || updateStaffDto.lastName) {
        const currentUser = await tx.user.findFirst({
          where: { id: existing.userId },
        });

        if (currentUser) {
          const nameParts = currentUser.name.split(' ');
          const firstName = updateStaffDto.firstName || nameParts[0] || '';
          const lastName = updateStaffDto.lastName || nameParts.slice(1).join(' ') || '';

          await tx.user.update({
            where: { id: existing.userId },
            data: {
              name: `${firstName} ${lastName}`.trim(),
            },
          });
        }
      }

      // Update staff record
      const staff = await tx.staff.update({
        where: { id },
        data: {
          designation: updateStaffDto.designation,
          departmentId: updateStaffDto.departmentId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              profile: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      return staff;
    });

    return result;
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.staff.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Staff member not found');
    }

    // Update user status to inactive (soft delete)
    return this.prisma.user.update({
      where: { id: existing.userId },
      data: { status: 'inactive' },
    });
  }

  async getStats(tenantId: string) {
    const [total, byRole, byDepartment] = await Promise.all([
      this.prisma.staff.count({ where: { tenantId } }),
      this.prisma.user.groupBy({
        by: ['role'],
        where: {
          tenantId,
          role: { in: [UserRole.principal, UserRole.hod, UserRole.admin_staff, UserRole.teacher, UserRole.lab_assistant] },
          status: 'active',
        },
        _count: true,
      }),
      this.prisma.staff.groupBy({
        by: ['departmentId'],
        where: { tenantId },
        _count: true,
      }),
    ]);

    // Count active users (staff roles)
    const activeStaff = await this.prisma.user.count({
      where: {
        tenantId,
        status: 'active',
        role: { in: [UserRole.principal, UserRole.hod, UserRole.admin_staff, UserRole.teacher, UserRole.lab_assistant] },
      },
    });

    return {
      total,
      active: activeStaff,
      inactive: total - activeStaff,
      byRole: byRole.map((r: { role: UserRole; _count: number }) => ({ role: r.role, count: r._count })),
      byDepartment,
    };
  }

  async getTeachers(tenantId: string, departmentId?: string) {
    const where: any = {
      tenantId,
      user: {
        role: { in: [UserRole.teacher, UserRole.hod] },
        status: 'active',
      },
    };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    return this.prisma.staff.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            profile: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  private mapStaffRoleToUserRole(staffRole: StaffRole): UserRole {
    const mapping: Record<StaffRole, UserRole> = {
      [StaffRole.PRINCIPAL]: UserRole.principal,
      [StaffRole.HOD]: UserRole.hod,
      [StaffRole.ADMIN_STAFF]: UserRole.admin_staff,
      [StaffRole.TEACHER]: UserRole.teacher,
      [StaffRole.LAB_ASSISTANT]: UserRole.lab_assistant,
    };
    return mapping[staffRole];
  }
}
