import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto, SubscriptionPlan } from './dto/create-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    // Check if domain already exists
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { domain: createTenantDto.slug },
    });

    if (existingTenant) {
      throw new ConflictException('A college with this domain already exists');
    }

    // Create tenant in database
    const tenant = await this.prisma.tenant.create({
      data: {
        name: createTenantDto.name,
        domain: createTenantDto.slug,
        displayName: createTenantDto.name,
        logo: createTenantDto.logo,
        config: {
          location: createTenantDto.location,
          estimatedStudents: createTenantDto.estimatedStudents,
        },
        status: 'pending',
      },
    });

    // Create subscription
    const now = new Date();
    const trialEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days trial

    await this.prisma.tenantSubscription.create({
      data: {
        tenantId: tenant.id,
        plan: createTenantDto.subscriptionPlan || SubscriptionPlan.TRIAL,
        studentCount: createTenantDto.estimatedStudents || 0,
        amount: this.calculateAmount(createTenantDto.estimatedStudents || 0, createTenantDto.subscriptionPlan),
        startDate: now,
        endDate: trialEndDate,
        status: 'active',
      },
    });

    // TODO: Send invitation email to principal
    // await this.emailService.sendPrincipalInvitation(createTenantDto.principalEmail, tenant);

    return tenant;
  }

  async findAll(options?: { status?: string; limit?: number; offset?: number }) {
    const { status, limit = 10, offset = 0 } = options || {};

    const where = status ? { status } : undefined;

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: true,
        },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return {
      data: tenants,
      total,
      limit,
      offset,
    };
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        subscription: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('College not found');
    }

    return tenant;
  }

  async findByDomain(domain: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { domain },
      include: {
        subscription: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('College not found');
    }

    return tenant;
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.tenant.update({
      where: { id },
      data: { status },
    });
  }

  async getStats() {
    const [totalTenants, activeTenants, trialTenants, totalStudents, totalRevenue] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { status: 'active' } }),
      this.prisma.tenant.count({ where: { status: 'trial' } }),
      this.prisma.tenantSubscription.aggregate({
        _sum: { studentCount: true },
        where: { status: 'active' },
      }),
      this.prisma.tenantSubscription.aggregate({
        _sum: { amount: true },
        where: { status: 'active' },
      }),
    ]);

    return {
      totalTenants,
      activeTenants,
      trialTenants,
      totalStudents: totalStudents._sum.studentCount || 0,
      monthlyRevenue: Number(totalRevenue._sum.amount || 0) / 12, // Convert Decimal to number
    };
  }

  private calculateAmount(studentCount: number, plan?: SubscriptionPlan): number {
    if (plan === SubscriptionPlan.TRIAL) return 0;

    // Base price: ₹500/student/year
    let pricePerStudent = 500;

    // Volume discounts
    if (studentCount > 15000) {
      pricePerStudent = 400; // 20% off
    } else if (studentCount > 5000) {
      pricePerStudent = 450; // 10% off
    }

    return studentCount * pricePerStudent;
  }
}
