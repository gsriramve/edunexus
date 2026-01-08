import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateEventDto,
  UpdateEventDto,
  QueryEventsDto,
  EventFeedbackDto,
  MarkAttendanceDto,
  EventStatus,
} from './dto/alumni.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(tenantId: string, creatorId: string, dto: CreateEventDto) {
    return this.prisma.alumniEvent.create({
      data: {
        tenantId,
        createdById: creatorId,
        title: dto.title,
        description: dto.description,
        eventType: dto.eventType,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        venue: dto.venue,
        isVirtual: dto.isVirtual || false,
        meetLink: dto.meetLink,
        registrationDeadline: dto.registrationDeadline ? new Date(dto.registrationDeadline) : null,
        maxAttendees: dto.maxAttendees,
        registrationFee: dto.registrationFee,
        targetBatches: dto.targetBatches || [],
        targetDepartments: dto.targetDepartments || [],
        status: dto.status || EventStatus.DRAFT,
      },
      include: {
        _count: { select: { attendances: true } },
      },
    });
  }

  async updateEvent(tenantId: string, id: string, dto: UpdateEventDto) {
    const event = await this.prisma.alumniEvent.findFirst({
      where: { id, tenantId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.alumniEvent.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        registrationDeadline: dto.registrationDeadline ? new Date(dto.registrationDeadline) : undefined,
      },
      include: {
        _count: { select: { attendances: true } },
      },
    });
  }

  async getEvent(tenantId: string, id: string) {
    const event = await this.prisma.alumniEvent.findFirst({
      where: { id, tenantId },
      include: {
        attendances: {
          include: {
            alumni: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                photoUrl: true,
                graduationYear: true,
                batch: true,
              },
            },
          },
          orderBy: { registeredAt: 'desc' },
        },
        _count: { select: { attendances: true } },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async queryEvents(tenantId: string, query: QueryEventsDto) {
    const where: Prisma.AlumniEventWhereInput = { tenantId };

    if (query.eventType) where.eventType = query.eventType;
    if (query.status) where.status = query.status;
    if (query.isVirtual !== undefined) where.isVirtual = query.isVirtual;

    if (query.startAfter) {
      where.startDate = { gte: new Date(query.startAfter) };
    }

    if (query.startBefore) {
      where.startDate = { ...where.startDate as any, lte: new Date(query.startBefore) };
    }

    if (query.upcoming) {
      where.startDate = { gte: new Date() };
      where.status = { in: ['published', 'ongoing'] };
    }

    if (query.targetBatch) {
      where.OR = [
        { targetBatches: { isEmpty: true } },
        { targetBatches: { has: query.targetBatch } },
      ];
    }

    if (query.targetDepartment) {
      where.OR = [
        ...(where.OR || []),
        { targetDepartments: { isEmpty: true } },
        { targetDepartments: { has: query.targetDepartment } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.alumniEvent.findMany({
        where,
        include: {
          _count: { select: { attendances: true } },
        },
        orderBy: { startDate: query.upcoming ? 'asc' : 'desc' },
        take: query.limit || 20,
        skip: query.offset || 0,
      }),
      this.prisma.alumniEvent.count({ where }),
    ]);

    return { data, total };
  }

  async getUpcomingEvents(tenantId: string, limit: number = 10) {
    return this.prisma.alumniEvent.findMany({
      where: {
        tenantId,
        startDate: { gte: new Date() },
        status: { in: ['published', 'ongoing'] },
      },
      include: {
        _count: { select: { attendances: true } },
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    });
  }

  async publishEvent(tenantId: string, id: string) {
    const event = await this.prisma.alumniEvent.findFirst({
      where: { id, tenantId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== 'draft') {
      throw new BadRequestException('Only draft events can be published');
    }

    return this.prisma.alumniEvent.update({
      where: { id },
      data: { status: 'published' },
    });
  }

  async cancelEvent(tenantId: string, id: string) {
    const event = await this.prisma.alumniEvent.findFirst({
      where: { id, tenantId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status === 'completed' || event.status === 'cancelled') {
      throw new BadRequestException('Cannot cancel a completed or already cancelled event');
    }

    return this.prisma.alumniEvent.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  async deleteEvent(tenantId: string, id: string) {
    const event = await this.prisma.alumniEvent.findFirst({
      where: { id, tenantId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only allow deletion of draft events
    if (event.status !== 'draft') {
      throw new BadRequestException('Only draft events can be deleted');
    }

    return this.prisma.alumniEvent.delete({ where: { id } });
  }

  // ============ REGISTRATION ============

  async registerForEvent(tenantId: string, eventId: string, alumniId: string) {
    const event = await this.prisma.alumniEvent.findFirst({
      where: { id: eventId, tenantId },
      include: { _count: { select: { attendances: true } } },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== 'published') {
      throw new BadRequestException('Cannot register for this event');
    }

    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      throw new BadRequestException('Registration deadline has passed');
    }

    if (event.maxAttendees && event._count.attendances >= event.maxAttendees) {
      throw new BadRequestException('Event is at full capacity');
    }

    // Verify alumni
    const alumni = await this.prisma.alumniProfile.findFirst({
      where: { id: alumniId, tenantId, registrationStatus: 'approved' },
    });

    if (!alumni) {
      throw new NotFoundException('Alumni profile not found');
    }

    // Check target restrictions
    if (event.targetBatches.length > 0 && !event.targetBatches.includes(alumni.batch)) {
      throw new BadRequestException('This event is not available for your batch');
    }

    if (event.targetDepartments.length > 0 && alumni.departmentId &&
        !event.targetDepartments.includes(alumni.departmentId)) {
      throw new BadRequestException('This event is not available for your department');
    }

    // Check if already registered
    const existing = await this.prisma.alumniEventAttendance.findUnique({
      where: {
        eventId_alumniId: { eventId, alumniId },
      },
    });

    if (existing) {
      throw new ConflictException('Already registered for this event');
    }

    return this.prisma.alumniEventAttendance.create({
      data: {
        tenantId,
        eventId,
        alumniId,
      },
      include: {
        event: {
          select: {
            title: true,
            startDate: true,
            venue: true,
            isVirtual: true,
            meetLink: true,
          },
        },
      },
    });
  }

  async cancelRegistration(tenantId: string, eventId: string, alumniId: string) {
    const registration = await this.prisma.alumniEventAttendance.findFirst({
      where: { eventId, alumniId, tenantId },
      include: { event: true },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.event.status === 'completed') {
      throw new BadRequestException('Cannot cancel registration for completed events');
    }

    return this.prisma.alumniEventAttendance.delete({
      where: { id: registration.id },
    });
  }

  async getMyRegistrations(tenantId: string, alumniId: string) {
    return this.prisma.alumniEventAttendance.findMany({
      where: { tenantId, alumniId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            eventType: true,
            startDate: true,
            endDate: true,
            venue: true,
            isVirtual: true,
            meetLink: true,
            status: true,
          },
        },
      },
      orderBy: { event: { startDate: 'desc' } },
    });
  }

  async getEventAttendees(tenantId: string, eventId: string) {
    return this.prisma.alumniEventAttendance.findMany({
      where: { tenantId, eventId },
      include: {
        alumni: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            photoUrl: true,
            graduationYear: true,
            batch: true,
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { registeredAt: 'asc' },
    });
  }

  // ============ ATTENDANCE & FEEDBACK ============

  async markAttendance(tenantId: string, eventId: string, dto: MarkAttendanceDto) {
    const event = await this.prisma.alumniEvent.findFirst({
      where: { id: eventId, tenantId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.prisma.alumniEventAttendance.updateMany({
      where: {
        tenantId,
        eventId,
        alumniId: { in: dto.alumniIds },
      },
      data: {
        attended: dto.attended,
        attendedAt: dto.attended ? new Date() : null,
      },
    });

    return { updated: dto.alumniIds.length };
  }

  async submitFeedback(tenantId: string, eventId: string, alumniId: string, dto: EventFeedbackDto) {
    const registration = await this.prisma.alumniEventAttendance.findFirst({
      where: { eventId, alumniId, tenantId },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (!registration.attended) {
      throw new BadRequestException('Can only submit feedback if you attended the event');
    }

    return this.prisma.alumniEventAttendance.update({
      where: { id: registration.id },
      data: {
        rating: dto.rating,
        feedback: dto.feedback,
      },
    });
  }

  // ============ STATS ============

  async getEventStats(tenantId: string, eventId: string) {
    const event = await this.prisma.alumniEvent.findFirst({
      where: { id: eventId, tenantId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const [totalRegistered, attendedCount, feedbackData, byBatch, byDepartment] = await Promise.all([
      this.prisma.alumniEventAttendance.count({
        where: { tenantId, eventId },
      }),
      this.prisma.alumniEventAttendance.count({
        where: { tenantId, eventId, attended: true },
      }),
      this.prisma.alumniEventAttendance.aggregate({
        where: { tenantId, eventId, rating: { not: null } },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      this.prisma.alumniEventAttendance.findMany({
        where: { tenantId, eventId },
        select: {
          alumni: { select: { batch: true } },
        },
      }),
      this.prisma.alumniEventAttendance.findMany({
        where: { tenantId, eventId },
        select: {
          alumni: { select: { departmentId: true } },
        },
      }),
    ]);

    // Count by batch
    const batchCounts: Record<string, number> = {};
    byBatch.forEach(a => {
      const batch = a.alumni.batch;
      batchCounts[batch] = (batchCounts[batch] || 0) + 1;
    });

    // Count by department
    const deptCounts: Record<string, number> = {};
    byDepartment.forEach(a => {
      const deptId = a.alumni.departmentId;
      if (deptId) {
        deptCounts[deptId] = (deptCounts[deptId] || 0) + 1;
      }
    });

    return {
      eventId,
      totalRegistered,
      attendedCount,
      attendanceRate: totalRegistered > 0 ? (attendedCount / totalRegistered) * 100 : 0,
      averageRating: feedbackData._avg.rating,
      totalFeedback: feedbackData._count.rating,
      byBatch: batchCounts,
      byDepartment: deptCounts,
    };
  }

  async getOverallEventStats(tenantId: string) {
    const [total, published, completed, cancelled, totalAttendees, avgAttendance] = await Promise.all([
      this.prisma.alumniEvent.count({ where: { tenantId } }),
      this.prisma.alumniEvent.count({ where: { tenantId, status: 'published' } }),
      this.prisma.alumniEvent.count({ where: { tenantId, status: 'completed' } }),
      this.prisma.alumniEvent.count({ where: { tenantId, status: 'cancelled' } }),
      this.prisma.alumniEventAttendance.count({ where: { tenantId } }),
      this.prisma.alumniEventAttendance.aggregate({
        where: { tenantId, attended: true },
        _count: true,
      }),
    ]);

    const byType = await this.prisma.alumniEvent.groupBy({
      by: ['eventType'],
      where: { tenantId },
      _count: true,
    });

    return {
      total,
      published,
      completed,
      cancelled,
      totalRegistrations: totalAttendees,
      totalAttended: avgAttendance._count,
      byEventType: byType.reduce((acc, item) => {
        acc[item.eventType] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
