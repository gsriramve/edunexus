import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateContributionDto,
  UpdateContributionDto,
  ProcessContributionDto,
  QueryContributionsDto,
  ContributionStatus,
} from './dto/alumni.dto';

@Injectable()
export class ContributionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createContribution(tenantId: string, alumniId: string, dto: CreateContributionDto) {
    // Verify alumni exists
    const alumni = await this.prisma.alumniProfile.findFirst({
      where: { id: alumniId, tenantId, registrationStatus: 'approved' },
    });

    if (!alumni) {
      throw new NotFoundException('Alumni profile not found');
    }

    return this.prisma.alumniContribution.create({
      data: {
        tenantId,
        alumniId,
        contributionType: dto.contributionType,
        title: dto.title,
        description: dto.description,
        amount: dto.amount,
        currency: dto.currency || 'INR',
        estimatedValue: dto.estimatedValue,
        hoursContributed: dto.hoursContributed,
        allocatedTo: dto.allocatedTo,
        beneficiaryInfo: dto.beneficiaryInfo,
        isPubliclyAcknowledged: dto.isPubliclyAcknowledged ?? true,
        status: 'pending',
      },
      include: {
        alumni: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            graduationYear: true,
            batch: true,
          },
        },
      },
    });
  }

  async updateContribution(
    tenantId: string,
    id: string,
    alumniId: string,
    dto: UpdateContributionDto,
  ) {
    const contribution = await this.prisma.alumniContribution.findFirst({
      where: { id, tenantId, alumniId },
    });

    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }

    if (contribution.status !== 'pending') {
      throw new BadRequestException('Can only update pending contributions');
    }

    return this.prisma.alumniContribution.update({
      where: { id },
      data: dto,
      include: {
        alumni: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async processContribution(
    tenantId: string,
    id: string,
    processorId: string,
    dto: ProcessContributionDto,
  ) {
    const contribution = await this.prisma.alumniContribution.findFirst({
      where: { id, tenantId },
    });

    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }

    const updateData: Prisma.AlumniContributionUpdateInput = {
      status: dto.status,
    };

    if (dto.status === ContributionStatus.RECEIVED) {
      updateData.receivedDate = new Date();
    }

    if (dto.status === ContributionStatus.ACKNOWLEDGED) {
      updateData.acknowledgedBy = processorId;
      updateData.acknowledgementText = dto.acknowledgementText;
      if (!contribution.receivedDate) {
        updateData.receivedDate = new Date();
      }
    }

    return this.prisma.alumniContribution.update({
      where: { id },
      data: updateData,
      include: {
        alumni: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            graduationYear: true,
            batch: true,
          },
        },
      },
    });
  }

  async getContribution(tenantId: string, id: string) {
    const contribution = await this.prisma.alumniContribution.findFirst({
      where: { id, tenantId },
      include: {
        alumni: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            photoUrl: true,
            graduationYear: true,
            batch: true,
            department: { select: { name: true } },
          },
        },
      },
    });

    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }

    return contribution;
  }

  async queryContributions(tenantId: string, query: QueryContributionsDto) {
    const where: Prisma.AlumniContributionWhereInput = { tenantId };

    if (query.alumniId) where.alumniId = query.alumniId;
    if (query.contributionType) where.contributionType = query.contributionType;
    if (query.status) where.status = query.status;
    if (query.allocatedTo) where.allocatedTo = query.allocatedTo;

    const [data, total] = await Promise.all([
      this.prisma.alumniContribution.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        take: query.limit || 20,
        skip: query.offset || 0,
      }),
      this.prisma.alumniContribution.count({ where }),
    ]);

    return { data, total };
  }

  async getMyContributions(tenantId: string, alumniId: string) {
    return this.prisma.alumniContribution.findMany({
      where: { tenantId, alumniId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPublicContributions(tenantId: string, limit: number = 20) {
    return this.prisma.alumniContribution.findMany({
      where: {
        tenantId,
        status: 'acknowledged',
        isPubliclyAcknowledged: true,
      },
      include: {
        alumni: {
          select: {
            firstName: true,
            lastName: true,
            photoUrl: true,
            graduationYear: true,
            batch: true,
          },
        },
      },
      orderBy: { receivedDate: 'desc' },
      take: limit,
    });
  }

  async deleteContribution(tenantId: string, id: string, alumniId?: string) {
    const where: Prisma.AlumniContributionWhereInput = { id, tenantId };
    if (alumniId) where.alumniId = alumniId;

    const contribution = await this.prisma.alumniContribution.findFirst({ where });

    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }

    if (contribution.status !== 'pending') {
      throw new BadRequestException('Can only delete pending contributions');
    }

    return this.prisma.alumniContribution.delete({ where: { id } });
  }

  // ============ STATS ============

  async getContributionStats(tenantId: string) {
    const [
      totalCount,
      acknowledgedCount,
      pendingCount,
      byType,
      totalMonetary,
      byAllocation,
      recentContributors,
    ] = await Promise.all([
      this.prisma.alumniContribution.count({ where: { tenantId } }),
      this.prisma.alumniContribution.count({ where: { tenantId, status: 'acknowledged' } }),
      this.prisma.alumniContribution.count({ where: { tenantId, status: 'pending' } }),
      this.prisma.alumniContribution.groupBy({
        by: ['contributionType'],
        where: { tenantId },
        _count: true,
        _sum: { amount: true },
      }),
      this.prisma.alumniContribution.aggregate({
        where: {
          tenantId,
          contributionType: 'monetary',
          status: 'acknowledged',
        },
        _sum: { amount: true },
      }),
      this.prisma.alumniContribution.groupBy({
        by: ['allocatedTo'],
        where: { tenantId, status: 'acknowledged', allocatedTo: { not: null } },
        _count: true,
        _sum: { amount: true },
      }),
      this.prisma.alumniContribution.findMany({
        where: {
          tenantId,
          status: 'acknowledged',
          isPubliclyAcknowledged: true,
        },
        select: {
          alumni: {
            select: {
              firstName: true,
              lastName: true,
              photoUrl: true,
              graduationYear: true,
            },
          },
          contributionType: true,
          amount: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const byTypeMap: Record<string, { count: number; amount: number }> = {};
    byType.forEach(item => {
      byTypeMap[item.contributionType] = {
        count: item._count,
        amount: Number(item._sum.amount || 0),
      };
    });

    const byAllocationMap: Record<string, { count: number; amount: number }> = {};
    byAllocation.forEach(item => {
      if (item.allocatedTo) {
        byAllocationMap[item.allocatedTo] = {
          count: item._count,
          amount: Number(item._sum.amount || 0),
        };
      }
    });

    return {
      totalCount,
      acknowledgedCount,
      pendingCount,
      totalMonetaryValue: Number(totalMonetary._sum.amount || 0),
      byType: byTypeMap,
      byAllocation: byAllocationMap,
      recentContributors,
    };
  }

  async getTopContributors(tenantId: string, limit: number = 10) {
    const contributors = await this.prisma.alumniContribution.groupBy({
      by: ['alumniId'],
      where: {
        tenantId,
        status: 'acknowledged',
      },
      _count: true,
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: limit,
    });

    const alumniIds = contributors.map(c => c.alumniId);
    const alumni = await this.prisma.alumniProfile.findMany({
      where: { id: { in: alumniIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        graduationYear: true,
        batch: true,
      },
    });

    const alumniMap = new Map(alumni.map(a => [a.id, a]));

    return contributors.map(c => ({
      alumni: alumniMap.get(c.alumniId),
      contributionCount: c._count,
      totalAmount: Number(c._sum.amount || 0),
    }));
  }

  async getContributionsByYear(tenantId: string) {
    const contributions = await this.prisma.alumniContribution.findMany({
      where: {
        tenantId,
        status: 'acknowledged',
      },
      select: {
        createdAt: true,
        amount: true,
        contributionType: true,
      },
    });

    const byYear: Record<number, { count: number; amount: number }> = {};
    contributions.forEach(c => {
      const year = c.createdAt.getFullYear();
      if (!byYear[year]) {
        byYear[year] = { count: 0, amount: 0 };
      }
      byYear[year].count++;
      byYear[year].amount += Number(c.amount || 0);
    });

    return byYear;
  }
}
