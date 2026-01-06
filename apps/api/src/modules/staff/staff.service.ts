import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
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

    // Check if email already exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: createStaffDto.email },
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
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user account
      const user = await tx.user.create({
        data: {
          tenantId,
          email: createStaffDto.email,
          role: this.mapStaffRoleToUserRole(createStaffDto.role),
          profile: {
            firstName: createStaffDto.firstName,
            lastName: createStaffDto.lastName,
            phone: createStaffDto.phone,
          },
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
          qualification: createStaffDto.qualification,
          specialization: createStaffDto.specialization,
          experience: createStaffDto.experience,
          status: 'ACTIVE',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
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

    if (status) {
      where.status = status.toUpperCase();
    }

    if (role) {
      where.user = {
        role: this.mapStaffRoleToUserRole(role),
      };
    }

    if (search) {
      where.OR = [
        { employeeId: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { profile: { path: ['firstName'], string_contains: search } } },
        { user: { profile: { path: ['lastName'], string_contains: search } } },
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

    // Update staff and user profile
    const result = await this.prisma.$transaction(async (tx) => {
      // Update user profile if name/phone changed
      if (updateStaffDto.firstName || updateStaffDto.lastName || updateStaffDto.phone) {
        const currentUser = await tx.user.findFirst({
          where: { id: existing.userId },
        });

        const currentProfile = (currentUser?.profile as any) || {};

        await tx.user.update({
          where: { id: existing.userId },
          data: {
            profile: {
              ...currentProfile,
              ...(updateStaffDto.firstName && { firstName: updateStaffDto.firstName }),
              ...(updateStaffDto.lastName && { lastName: updateStaffDto.lastName }),
              ...(updateStaffDto.phone && { phone: updateStaffDto.phone }),
            },
          },
        });
      }

      // Update staff record
      const staff = await tx.staff.update({
        where: { id },
        data: {
          designation: updateStaffDto.designation,
          departmentId: updateStaffDto.departmentId,
          status: updateStaffDto.status?.toUpperCase(),
          qualification: updateStaffDto.qualification,
          specialization: updateStaffDto.specialization,
          experience: updateStaffDto.experience,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
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

    // Soft delete by setting status to RESIGNED
    return this.prisma.staff.update({
      where: { id },
      data: { status: 'RESIGNED' },
    });
  }

  async getStats(tenantId: string) {
    const [total, active, byRole, byDepartment] = await Promise.all([
      this.prisma.staff.count({ where: { tenantId } }),
      this.prisma.staff.count({ where: { tenantId, status: 'ACTIVE' } }),
      this.prisma.user.groupBy({
        by: ['role'],
        where: {
          tenantId,
          role: { in: ['PRINCIPAL', 'HOD', 'ADMIN_STAFF', 'TEACHER', 'LAB_ASSISTANT'] },
        },
        _count: true,
      }),
      this.prisma.staff.groupBy({
        by: ['departmentId'],
        where: { tenantId, status: 'ACTIVE' },
        _count: true,
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      byRole: byRole.map((r) => ({ role: r.role, count: r._count })),
      byDepartment,
    };
  }

  async getTeachers(tenantId: string, departmentId?: string) {
    const where: any = {
      tenantId,
      status: 'ACTIVE',
      user: {
        role: { in: ['TEACHER', 'HOD'] },
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

  private mapStaffRoleToUserRole(staffRole: StaffRole): string {
    const mapping: Record<StaffRole, string> = {
      [StaffRole.PRINCIPAL]: 'PRINCIPAL',
      [StaffRole.HOD]: 'HOD',
      [StaffRole.ADMIN_STAFF]: 'ADMIN_STAFF',
      [StaffRole.TEACHER]: 'TEACHER',
      [StaffRole.LAB_ASSISTANT]: 'LAB_ASSISTANT',
    };
    return mapping[staffRole];
  }
}
