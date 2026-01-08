import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  RequestMentorshipDto,
  RespondMentorshipDto,
  UpdateMentorshipDto,
  RateMentorshipDto,
  QueryMentorshipsDto,
  MentorshipStatus,
} from './dto/alumni.dto';

@Injectable()
export class MentorshipService {
  constructor(private readonly prisma: PrismaService) {}

  async requestMentorship(tenantId: string, studentId: string, dto: RequestMentorshipDto) {
    // Verify student exists
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Verify alumni exists and is open to mentoring
    const alumni = await this.prisma.alumniProfile.findFirst({
      where: {
        id: dto.alumniId,
        tenantId,
        registrationStatus: 'approved',
        openToMentoring: true,
      },
    });

    if (!alumni) {
      throw new NotFoundException('Alumni not found or not available for mentoring');
    }

    // Check if mentorship already exists
    const existing = await this.prisma.alumniMentorship.findUnique({
      where: {
        alumniId_studentId: {
          alumniId: dto.alumniId,
          studentId,
        },
      },
    });

    if (existing) {
      if (existing.status === 'active' || existing.status === 'pending') {
        throw new ConflictException('A mentorship request already exists with this mentor');
      }
    }

    return this.prisma.alumniMentorship.create({
      data: {
        tenantId,
        alumniId: dto.alumniId,
        studentId,
        focusArea: dto.focusArea,
        requestMessage: dto.requestMessage,
        status: 'pending',
      },
      include: {
        alumni: {
          select: {
            firstName: true,
            lastName: true,
            photoUrl: true,
            employmentHistory: {
              where: { isCurrent: true },
              select: { companyName: true, role: true },
              take: 1,
            },
          },
        },
        student: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true } },
          },
        },
      },
    });
  }

  async respondToRequest(tenantId: string, id: string, alumniId: string, dto: RespondMentorshipDto) {
    const mentorship = await this.prisma.alumniMentorship.findFirst({
      where: { id, tenantId, alumniId },
    });

    if (!mentorship) {
      throw new NotFoundException('Mentorship request not found');
    }

    if (mentorship.status !== 'pending') {
      throw new BadRequestException('This request has already been responded to');
    }

    const updateData: Prisma.AlumniMentorshipUpdateInput = {
      status: dto.status,
      responseMessage: dto.responseMessage,
    };

    if (dto.status === MentorshipStatus.ACTIVE) {
      updateData.startDate = new Date();
    }

    return this.prisma.alumniMentorship.update({
      where: { id },
      data: updateData,
      include: {
        alumni: {
          select: {
            firstName: true,
            lastName: true,
            photoUrl: true,
            email: true,
          },
        },
        student: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true } },
          },
        },
      },
    });
  }

  async updateMentorship(tenantId: string, id: string, dto: UpdateMentorshipDto) {
    const mentorship = await this.prisma.alumniMentorship.findFirst({
      where: { id, tenantId },
    });

    if (!mentorship) {
      throw new NotFoundException('Mentorship not found');
    }

    const updateData: Prisma.AlumniMentorshipUpdateInput = {};

    if (dto.status) {
      updateData.status = dto.status;
      if (dto.status === MentorshipStatus.COMPLETED || dto.status === MentorshipStatus.CANCELLED) {
        updateData.endDate = new Date();
      }
    }

    if (dto.meetingsCount !== undefined) {
      updateData.meetingsCount = dto.meetingsCount;
    }

    if (dto.endDate) {
      updateData.endDate = new Date(dto.endDate);
    }

    return this.prisma.alumniMentorship.update({
      where: { id },
      data: updateData,
      include: {
        alumni: {
          select: {
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
        student: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true } },
          },
        },
      },
    });
  }

  async incrementMeetings(tenantId: string, id: string) {
    const mentorship = await this.prisma.alumniMentorship.findFirst({
      where: { id, tenantId, status: 'active' },
    });

    if (!mentorship) {
      throw new NotFoundException('Active mentorship not found');
    }

    return this.prisma.alumniMentorship.update({
      where: { id },
      data: { meetingsCount: { increment: 1 } },
    });
  }

  async rateByStudent(tenantId: string, id: string, studentId: string, dto: RateMentorshipDto) {
    const mentorship = await this.prisma.alumniMentorship.findFirst({
      where: { id, tenantId, studentId },
    });

    if (!mentorship) {
      throw new NotFoundException('Mentorship not found');
    }

    if (mentorship.status !== 'completed') {
      throw new BadRequestException('Can only rate completed mentorships');
    }

    if (mentorship.studentRating) {
      throw new BadRequestException('You have already rated this mentorship');
    }

    return this.prisma.alumniMentorship.update({
      where: { id },
      data: {
        studentRating: dto.rating,
        studentReview: dto.review,
      },
    });
  }

  async rateByAlumni(tenantId: string, id: string, alumniId: string, dto: RateMentorshipDto) {
    const mentorship = await this.prisma.alumniMentorship.findFirst({
      where: { id, tenantId, alumniId },
    });

    if (!mentorship) {
      throw new NotFoundException('Mentorship not found');
    }

    if (mentorship.status !== 'completed') {
      throw new BadRequestException('Can only rate completed mentorships');
    }

    if (mentorship.alumniRating) {
      throw new BadRequestException('You have already rated this mentorship');
    }

    return this.prisma.alumniMentorship.update({
      where: { id },
      data: {
        alumniRating: dto.rating,
        alumniReview: dto.review,
      },
    });
  }

  async getMentorship(tenantId: string, id: string) {
    const mentorship = await this.prisma.alumniMentorship.findFirst({
      where: { id, tenantId },
      include: {
        alumni: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            email: true,
            graduationYear: true,
            batch: true,
            department: { select: { name: true } },
            employmentHistory: {
              where: { isCurrent: true },
              select: { companyName: true, role: true },
              take: 1,
            },
          },
        },
        student: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true } },
          },
        },
      },
    });

    if (!mentorship) {
      throw new NotFoundException('Mentorship not found');
    }

    return mentorship;
  }

  async queryMentorships(tenantId: string, query: QueryMentorshipsDto) {
    const where: Prisma.AlumniMentorshipWhereInput = { tenantId };

    if (query.alumniId) where.alumniId = query.alumniId;
    if (query.studentId) where.studentId = query.studentId;
    if (query.status) where.status = query.status;
    if (query.focusArea) where.focusArea = query.focusArea;

    const [data, total] = await Promise.all([
      this.prisma.alumniMentorship.findMany({
        where,
        include: {
          alumni: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              photoUrl: true,
              employmentHistory: {
                where: { isCurrent: true },
                select: { companyName: true, role: true },
                take: 1,
              },
            },
          },
          student: {
            include: {
              user: { select: { name: true, email: true } },
              department: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: query.limit || 20,
        skip: query.offset || 0,
      }),
      this.prisma.alumniMentorship.count({ where }),
    ]);

    return { data, total };
  }

  async getMyMentorshipsAsStudent(tenantId: string, studentId: string) {
    return this.prisma.alumniMentorship.findMany({
      where: { tenantId, studentId },
      include: {
        alumni: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            email: true,
            department: { select: { name: true } },
            employmentHistory: {
              where: { isCurrent: true },
              select: { companyName: true, role: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyMentorshipsAsAlumni(tenantId: string, alumniId: string) {
    return this.prisma.alumniMentorship.findMany({
      where: { tenantId, alumniId },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingRequestsForAlumni(tenantId: string, alumniId: string) {
    return this.prisma.alumniMentorship.findMany({
      where: { tenantId, alumniId, status: 'pending' },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMentorStats(tenantId: string, alumniId: string) {
    const [totalMentees, activeMentees, completedMentorships, avgRating] = await Promise.all([
      this.prisma.alumniMentorship.count({
        where: { tenantId, alumniId },
      }),
      this.prisma.alumniMentorship.count({
        where: { tenantId, alumniId, status: 'active' },
      }),
      this.prisma.alumniMentorship.count({
        where: { tenantId, alumniId, status: 'completed' },
      }),
      this.prisma.alumniMentorship.aggregate({
        where: { tenantId, alumniId, studentRating: { not: null } },
        _avg: { studentRating: true },
        _count: { studentRating: true },
      }),
    ]);

    return {
      totalMentees,
      activeMentees,
      completedMentorships,
      averageRating: avgRating._avg.studentRating,
      totalRatings: avgRating._count.studentRating,
    };
  }

  async getOverallMentorshipStats(tenantId: string) {
    const [total, active, completed, byFocusArea] = await Promise.all([
      this.prisma.alumniMentorship.count({ where: { tenantId } }),
      this.prisma.alumniMentorship.count({ where: { tenantId, status: 'active' } }),
      this.prisma.alumniMentorship.count({ where: { tenantId, status: 'completed' } }),
      this.prisma.alumniMentorship.groupBy({
        by: ['focusArea'],
        where: { tenantId },
        _count: true,
      }),
    ]);

    return {
      total,
      active,
      completed,
      byFocusArea: byFocusArea.reduce((acc, item) => {
        acc[item.focusArea] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
