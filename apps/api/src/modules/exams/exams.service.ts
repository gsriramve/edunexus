import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExamDto, UpdateExamDto, ExamQueryDto, ExamStatsDto } from './dto/exam.dto';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createExamDto: CreateExamDto) {
    // Verify subject exists and belongs to tenant
    const subject = await this.prisma.subject.findFirst({
      where: { id: createExamDto.subjectId, tenantId },
    });

    if (!subject) {
      throw new BadRequestException('Subject not found');
    }

    const exam = await this.prisma.exam.create({
      data: {
        tenantId,
        name: createExamDto.name,
        subjectId: createExamDto.subjectId,
        type: createExamDto.type,
        date: new Date(createExamDto.date),
        totalMarks: createExamDto.totalMarks,
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            semester: true,
          },
        },
      },
    });

    return exam;
  }

  async findAll(tenantId: string, query: ExamQueryDto) {
    const { search, subjectId, type, dateFrom, dateTo, semester, limit = 20, offset = 0 } = query;

    const where: any = { tenantId };

    if (subjectId) {
      where.subjectId = subjectId;
    }

    if (type) {
      where.type = type;
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo);
      }
    }

    if (semester) {
      where.subject = { semester };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subject: { name: { contains: search, mode: 'insensitive' } } },
        { subject: { code: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [exams, total] = await Promise.all([
      this.prisma.exam.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { date: 'asc' },
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
              semester: true,
            },
          },
          _count: {
            select: { results: true },
          },
        },
      }),
      this.prisma.exam.count({ where }),
    ]);

    return {
      data: exams,
      total,
      limit,
      offset,
    };
  }

  async findOne(tenantId: string, id: string) {
    const exam = await this.prisma.exam.findFirst({
      where: { id, tenantId },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            semester: true,
            credits: true,
          },
        },
        _count: {
          select: { results: true },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return exam;
  }

  async update(tenantId: string, id: string, updateExamDto: UpdateExamDto) {
    const existing = await this.prisma.exam.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Exam not found');
    }

    const exam = await this.prisma.exam.update({
      where: { id },
      data: {
        name: updateExamDto.name,
        type: updateExamDto.type,
        date: updateExamDto.date ? new Date(updateExamDto.date) : undefined,
        totalMarks: updateExamDto.totalMarks,
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            semester: true,
          },
        },
      },
    });

    return exam;
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.exam.findFirst({
      where: { id, tenantId },
      include: {
        _count: { select: { results: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException('Exam not found');
    }

    // Check if exam has results
    if (existing._count.results > 0) {
      throw new BadRequestException(
        'Cannot delete exam with existing results. Delete results first.',
      );
    }

    await this.prisma.exam.delete({ where: { id } });
  }

  async getUpcoming(tenantId: string, studentId?: string, days: number = 30) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const where: any = {
      tenantId,
      date: {
        gte: now,
        lte: futureDate,
      },
    };

    // If studentId is provided, filter by student's current semester subjects
    if (studentId) {
      const student = await this.prisma.student.findFirst({
        where: { id: studentId, tenantId },
        select: { semester: true },
      });

      if (student) {
        where.subject = { semester: student.semester };
      }
    }

    const exams = await this.prisma.exam.findMany({
      where,
      orderBy: { date: 'asc' },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            semester: true,
          },
        },
      },
    });

    return exams;
  }

  async getBySubject(tenantId: string, subjectId: string) {
    const exams = await this.prisma.exam.findMany({
      where: { tenantId, subjectId },
      orderBy: { date: 'desc' },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            semester: true,
          },
        },
        _count: {
          select: { results: true },
        },
      },
    });

    return exams;
  }

  async getStats(tenantId: string): Promise<ExamStatsDto> {
    const now = new Date();

    const [total, upcoming, byType] = await Promise.all([
      this.prisma.exam.count({ where: { tenantId } }),
      this.prisma.exam.count({
        where: { tenantId, date: { gte: now } },
      }),
      this.prisma.exam.groupBy({
        by: ['type'],
        where: { tenantId },
        _count: true,
      }),
    ]);

    const typeCount: Record<string, number> = {};
    byType.forEach((item: { type: string; _count: number }) => {
      typeCount[item.type] = item._count;
    });

    return {
      total,
      upcoming,
      completed: total - upcoming,
      byType: typeCount,
    };
  }
}
