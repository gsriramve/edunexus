import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createDepartmentDto: CreateDepartmentDto) {
    // Check if department code already exists for this tenant
    const existing = await this.prisma.department.findFirst({
      where: {
        tenantId,
        code: createDepartmentDto.code,
      },
    });

    if (existing) {
      throw new ConflictException('A department with this code already exists');
    }

    return this.prisma.department.create({
      data: {
        tenantId,
        name: createDepartmentDto.name,
        code: createDepartmentDto.code,
        description: createDepartmentDto.description,
        hodId: createDepartmentDto.hodId,
      },
      include: {
        hod: {
          select: {
            id: true,
            employeeId: true,
            designation: true,
            user: {
              select: {
                id: true,
                email: true,
                profile: true,
              },
            },
          },
        },
        _count: {
          select: {
            staff: true,
            students: true,
          },
        },
      },
    });
  }

  async findAll(tenantId: string, options?: { search?: string; limit?: number; offset?: number }) {
    const { search, limit = 50, offset = 0 } = options || {};

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [departments, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { name: 'asc' },
        include: {
          hod: {
            select: {
              id: true,
              employeeId: true,
              designation: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  profile: true,
                },
              },
            },
          },
          _count: {
            select: {
              staff: true,
              students: true,
            },
          },
        },
      }),
      this.prisma.department.count({ where }),
    ]);

    return {
      data: departments,
      total,
      limit,
      offset,
    };
  }

  async findOne(tenantId: string, id: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, tenantId },
      include: {
        hod: {
          select: {
            id: true,
            employeeId: true,
            designation: true,
            user: {
              select: {
                id: true,
                email: true,
                profile: true,
              },
            },
          },
        },
        staff: {
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: true,
              },
            },
          },
        },
        _count: {
          select: {
            staff: true,
            students: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(tenantId: string, id: string, updateDepartmentDto: UpdateDepartmentDto) {
    // Check if department exists
    const existing = await this.prisma.department.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Department not found');
    }

    return this.prisma.department.update({
      where: { id },
      data: updateDepartmentDto,
      include: {
        hod: {
          select: {
            id: true,
            employeeId: true,
            designation: true,
            user: {
              select: {
                id: true,
                email: true,
                profile: true,
              },
            },
          },
        },
        _count: {
          select: {
            staff: true,
            students: true,
          },
        },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.department.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: {
            staff: true,
            students: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Department not found');
    }

    // Check if department has staff or students
    if (existing._count.staff > 0 || existing._count.students > 0) {
      throw new ConflictException(
        'Cannot delete department with existing staff or students. Please reassign them first.',
      );
    }

    return this.prisma.department.delete({
      where: { id },
    });
  }

  async getStats(tenantId: string) {
    const [totalDepartments, departmentsWithHod, totalStaff, totalStudents] = await Promise.all([
      this.prisma.department.count({ where: { tenantId } }),
      this.prisma.department.count({ where: { tenantId, hodId: { not: null } } }),
      this.prisma.staff.count({ where: { tenantId } }),
      this.prisma.student.count({ where: { tenantId } }),
    ]);

    return {
      totalDepartments,
      departmentsWithHod,
      departmentsWithoutHod: totalDepartments - departmentsWithHod,
      totalStaff,
      totalStudents,
    };
  }
}
