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

    // Validate HOD exists if provided
    if (createDepartmentDto.hodId) {
      const hod = await this.prisma.staff.findFirst({
        where: { id: createDepartmentDto.hodId, tenantId },
      });
      if (!hod) {
        throw new NotFoundException('HOD staff member not found');
      }
    }

    const department = await this.prisma.department.create({
      data: {
        tenantId,
        name: createDepartmentDto.name,
        code: createDepartmentDto.code,
        hodId: createDepartmentDto.hodId,
      },
      include: {
        staff: {
          take: 1,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
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

    // Get HOD info if hodId is set
    let hodInfo = null;
    if (department.hodId) {
      hodInfo = await this.prisma.staff.findFirst({
        where: { id: department.hodId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    }

    return {
      ...department,
      hod: hodInfo,
    };
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

    // Get HOD info for each department
    const departmentsWithHod = await Promise.all(
      departments.map(async (dept) => {
        let hodInfo = null;
        if (dept.hodId) {
          hodInfo = await this.prisma.staff.findFirst({
            where: { id: dept.hodId },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          });
        }
        return {
          ...dept,
          hod: hodInfo,
        };
      }),
    );

    return {
      data: departmentsWithHod,
      total,
      limit,
      offset,
    };
  }

  async findOne(tenantId: string, id: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, tenantId },
      include: {
        staff: {
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
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

    // Get HOD info if hodId is set
    let hodInfo = null;
    if (department.hodId) {
      hodInfo = await this.prisma.staff.findFirst({
        where: { id: department.hodId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    }

    return {
      ...department,
      hod: hodInfo,
    };
  }

  async update(tenantId: string, id: string, updateDepartmentDto: UpdateDepartmentDto) {
    // Check if department exists
    const existing = await this.prisma.department.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Department not found');
    }

    // Validate HOD exists if provided
    if (updateDepartmentDto.hodId) {
      const hod = await this.prisma.staff.findFirst({
        where: { id: updateDepartmentDto.hodId, tenantId },
      });
      if (!hod) {
        throw new NotFoundException('HOD staff member not found');
      }
    }

    const department = await this.prisma.department.update({
      where: { id },
      data: {
        name: updateDepartmentDto.name,
        hodId: updateDepartmentDto.hodId,
      },
      include: {
        _count: {
          select: {
            staff: true,
            students: true,
          },
        },
      },
    });

    // Get HOD info if hodId is set
    let hodInfo = null;
    if (department.hodId) {
      hodInfo = await this.prisma.staff.findFirst({
        where: { id: department.hodId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    }

    return {
      ...department,
      hod: hodInfo,
    };
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
