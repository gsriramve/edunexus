import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { S3Service } from '../documents/s3.service';
import { Prisma } from '@prisma/client';
import {
  CreateAlumniProfileDto,
  UpdateAlumniProfileDto,
  ApproveAlumniDto,
  QueryAlumniDto,
  CreateEmploymentDto,
  UpdateEmploymentDto,
  CreateTestimonialDto,
  UpdateTestimonialDto,
  ApproveTestimonialDto,
  QueryTestimonialsDto,
  RegistrationStatus,
  AlumniStatsDto,
  AlumniDirectoryFiltersDto,
} from './dto/alumni.dto';

const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB

@Injectable()
export class AlumniService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  // ============ PROFILE OPERATIONS ============

  async createProfile(tenantId: string, dto: CreateAlumniProfileDto, userId?: string) {
    // Check if email already registered
    const existing = await this.prisma.alumniProfile.findFirst({
      where: { tenantId, email: dto.email },
    });

    if (existing) {
      throw new ConflictException('An alumni profile with this email already exists');
    }

    // Check if user already has a profile
    if (userId) {
      const existingByUser = await this.prisma.alumniProfile.findFirst({
        where: { tenantId, userId },
      });
      if (existingByUser) {
        throw new ConflictException('You already have an alumni profile');
      }
    }

    // If studentId provided, verify it exists and doesn't have an alumni profile
    if (dto.studentId) {
      const student = await this.prisma.student.findFirst({
        where: { id: dto.studentId, tenantId },
        include: { alumniProfile: true },
      });

      if (!student) {
        throw new NotFoundException('Student not found');
      }

      if (student.alumniProfile) {
        throw new ConflictException('This student already has an alumni profile');
      }
    }

    return this.prisma.alumniProfile.create({
      data: {
        tenantId,
        ...dto,
        userId,
        registrationDate: new Date(),
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async getProfile(tenantId: string, id: string) {
    const profile = await this.prisma.alumniProfile.findFirst({
      where: { id, tenantId },
      include: {
        department: { select: { id: true, name: true, code: true } },
        employmentHistory: {
          orderBy: { startDate: 'desc' },
        },
        mentorships: {
          where: { status: 'active' },
          include: {
            student: {
              include: {
                user: { select: { name: true, email: true } },
                department: { select: { name: true } },
              },
            },
          },
        },
        contributions: {
          where: { status: 'acknowledged' },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        testimonials: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Alumni profile not found');
    }

    return profile;
  }

  async getProfileByUserId(tenantId: string, userId: string) {
    const profile = await this.prisma.alumniProfile.findFirst({
      where: { tenantId, userId },
      include: {
        department: { select: { id: true, name: true, code: true } },
        employmentHistory: {
          orderBy: { startDate: 'desc' },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Alumni profile not found for this user');
    }

    return profile;
  }

  async updateProfile(tenantId: string, id: string, dto: UpdateAlumniProfileDto) {
    const profile = await this.prisma.alumniProfile.findFirst({
      where: { id, tenantId },
    });

    if (!profile) {
      throw new NotFoundException('Alumni profile not found');
    }

    return this.prisma.alumniProfile.update({
      where: { id },
      data: dto,
      include: {
        department: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async approveProfile(tenantId: string, id: string, approverId: string, dto: ApproveAlumniDto) {
    const profile = await this.prisma.alumniProfile.findFirst({
      where: { id, tenantId },
    });

    if (!profile) {
      throw new NotFoundException('Alumni profile not found');
    }

    if (profile.registrationStatus !== 'pending') {
      throw new BadRequestException('Profile is not pending approval');
    }

    return this.prisma.alumniProfile.update({
      where: { id },
      data: {
        registrationStatus: dto.status,
        approvedBy: dto.status === RegistrationStatus.APPROVED ? approverId : null,
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async queryProfiles(tenantId: string, query: QueryAlumniDto) {
    const where: Prisma.AlumniProfileWhereInput = {
      tenantId,
      registrationStatus: query.registrationStatus || 'approved',
      visibleInDirectory: query.registrationStatus ? undefined : true,
    };

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.batch) where.batch = query.batch;
    if (query.graduationYear) where.graduationYear = query.graduationYear;
    if (query.currentStatus) where.currentStatus = query.currentStatus;
    if (query.openToMentoring !== undefined) where.openToMentoring = query.openToMentoring;

    // Filter by company or industry (through employment)
    if (query.company || query.industry) {
      where.employmentHistory = {
        some: {
          isCurrent: true,
          ...(query.company && { companyName: { contains: query.company, mode: 'insensitive' } }),
          ...(query.industry && { industry: { contains: query.industry, mode: 'insensitive' } }),
        },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.alumniProfile.findMany({
        where,
        include: {
          department: { select: { id: true, name: true, code: true } },
          employmentHistory: {
            where: { isCurrent: true },
            take: 1,
          },
        },
        orderBy: { graduationYear: 'desc' },
        take: query.limit || 20,
        skip: query.offset || 0,
      }),
      this.prisma.alumniProfile.count({ where }),
    ]);

    return { data, total };
  }

  async getDirectory(tenantId: string, query: QueryAlumniDto) {
    // Force directory to only show approved and visible profiles
    return this.queryProfiles(tenantId, {
      ...query,
      registrationStatus: RegistrationStatus.APPROVED,
    });
  }

  async getMentors(tenantId: string, query: QueryAlumniDto) {
    const where: Prisma.AlumniProfileWhereInput = {
      tenantId,
      registrationStatus: 'approved',
      visibleInDirectory: true,
      openToMentoring: true,
    };

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.batch) where.batch = query.batch;
    if (query.industry) {
      where.employmentHistory = {
        some: {
          isCurrent: true,
          industry: { contains: query.industry, mode: 'insensitive' },
        },
      };
    }

    const mentors = await this.prisma.alumniProfile.findMany({
      where,
      include: {
        department: { select: { id: true, name: true, code: true } },
        employmentHistory: {
          where: { isCurrent: true },
          take: 1,
        },
        mentorships: {
          where: { status: 'active' },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit || 20,
      skip: query.offset || 0,
    });

    // Calculate average ratings for mentors
    const mentorIds = mentors.map(m => m.id);
    const ratings = await this.prisma.alumniMentorship.groupBy({
      by: ['alumniId'],
      where: {
        alumniId: { in: mentorIds },
        studentRating: { not: null },
      },
      _avg: { studentRating: true },
      _count: { studentRating: true },
    });

    const ratingMap = new Map(ratings.map(r => [r.alumniId, r._avg.studentRating]));

    return mentors.map(mentor => ({
      id: mentor.id,
      firstName: mentor.firstName,
      lastName: mentor.lastName,
      photoUrl: mentor.photoUrl,
      graduationYear: mentor.graduationYear,
      batch: mentor.batch,
      department: mentor.department,
      currentEmployment: mentor.employmentHistory[0]
        ? {
            companyName: mentor.employmentHistory[0].companyName,
            role: mentor.employmentHistory[0].role,
          }
        : null,
      mentorshipAreas: mentor.mentorshipAreas,
      bio: mentor.bio,
      activeMenteeCount: mentor.mentorships.length,
      averageRating: ratingMap.get(mentor.id) || null,
    }));
  }

  // ============ EMPLOYMENT OPERATIONS ============

  async addEmployment(tenantId: string, alumniId: string, dto: CreateEmploymentDto) {
    const profile = await this.prisma.alumniProfile.findFirst({
      where: { id: alumniId, tenantId },
    });

    if (!profile) {
      throw new NotFoundException('Alumni profile not found');
    }

    // If this is current employment, set other employments as not current
    if (dto.isCurrent) {
      await this.prisma.alumniEmployment.updateMany({
        where: { alumniId, isCurrent: true },
        data: { isCurrent: false, endDate: new Date() },
      });
    }

    return this.prisma.alumniEmployment.create({
      data: {
        tenantId,
        alumniId,
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }

  async updateEmployment(tenantId: string, id: string, dto: UpdateEmploymentDto) {
    const employment = await this.prisma.alumniEmployment.findFirst({
      where: { id, tenantId },
    });

    if (!employment) {
      throw new NotFoundException('Employment record not found');
    }

    // If setting as current, unset others
    if (dto.isCurrent) {
      await this.prisma.alumniEmployment.updateMany({
        where: { alumniId: employment.alumniId, isCurrent: true, id: { not: id } },
        data: { isCurrent: false, endDate: new Date() },
      });
    }

    return this.prisma.alumniEmployment.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async deleteEmployment(tenantId: string, id: string) {
    const employment = await this.prisma.alumniEmployment.findFirst({
      where: { id, tenantId },
    });

    if (!employment) {
      throw new NotFoundException('Employment record not found');
    }

    return this.prisma.alumniEmployment.delete({ where: { id } });
  }

  async verifyEmployment(tenantId: string, id: string, verifierId: string) {
    const employment = await this.prisma.alumniEmployment.findFirst({
      where: { id, tenantId },
    });

    if (!employment) {
      throw new NotFoundException('Employment record not found');
    }

    return this.prisma.alumniEmployment.update({
      where: { id },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });
  }

  // ============ TESTIMONIAL OPERATIONS ============

  async createTestimonial(tenantId: string, alumniId: string, dto: CreateTestimonialDto) {
    const profile = await this.prisma.alumniProfile.findFirst({
      where: { id: alumniId, tenantId },
    });

    if (!profile) {
      throw new NotFoundException('Alumni profile not found');
    }

    return this.prisma.alumniTestimonial.create({
      data: {
        tenantId,
        alumniId,
        ...dto,
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
    });
  }

  async updateTestimonial(tenantId: string, id: string, alumniId: string, dto: UpdateTestimonialDto) {
    const testimonial = await this.prisma.alumniTestimonial.findFirst({
      where: { id, tenantId, alumniId },
    });

    if (!testimonial) {
      throw new NotFoundException('Testimonial not found');
    }

    return this.prisma.alumniTestimonial.update({
      where: { id },
      data: dto,
    });
  }

  async approveTestimonial(tenantId: string, id: string, approverId: string, dto: ApproveTestimonialDto) {
    const testimonial = await this.prisma.alumniTestimonial.findFirst({
      where: { id, tenantId },
    });

    if (!testimonial) {
      throw new NotFoundException('Testimonial not found');
    }

    return this.prisma.alumniTestimonial.update({
      where: { id },
      data: {
        isApproved: dto.isApproved,
        approvedBy: dto.isApproved ? approverId : null,
        approvedAt: dto.isApproved ? new Date() : null,
        isFeatured: dto.isFeatured,
        displayOrder: dto.displayOrder,
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
    });
  }

  async queryTestimonials(tenantId: string, query: QueryTestimonialsDto) {
    const where: Prisma.AlumniTestimonialWhereInput = {
      tenantId,
    };

    if (query.alumniId) where.alumniId = query.alumniId;
    if (query.category) where.category = query.category;
    if (query.isApproved !== undefined) where.isApproved = query.isApproved;
    if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;

    const [data, total] = await Promise.all([
      this.prisma.alumniTestimonial.findMany({
        where,
        include: {
          alumni: {
            select: {
              firstName: true,
              lastName: true,
              photoUrl: true,
              graduationYear: true,
              batch: true,
              department: { select: { name: true } },
            },
          },
        },
        orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }, { createdAt: 'desc' }],
        take: query.limit || 20,
        skip: query.offset || 0,
      }),
      this.prisma.alumniTestimonial.count({ where }),
    ]);

    return { data, total };
  }

  async getPublicTestimonials(tenantId: string, limit: number = 10) {
    return this.prisma.alumniTestimonial.findMany({
      where: {
        tenantId,
        isApproved: true,
      },
      include: {
        alumni: {
          select: {
            firstName: true,
            lastName: true,
            photoUrl: true,
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
      },
      orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }, { createdAt: 'desc' }],
      take: limit,
    });
  }

  async deleteTestimonial(tenantId: string, id: string, alumniId?: string) {
    const where: Prisma.AlumniTestimonialWhereInput = { id, tenantId };
    if (alumniId) where.alumniId = alumniId;

    const testimonial = await this.prisma.alumniTestimonial.findFirst({ where });

    if (!testimonial) {
      throw new NotFoundException('Testimonial not found');
    }

    return this.prisma.alumniTestimonial.delete({ where: { id } });
  }

  // ============ STATS & FILTERS ============

  async getStats(tenantId: string): Promise<AlumniStatsDto> {
    const [
      totalAlumni,
      approvedCount,
      pendingCount,
      statusCounts,
      mentoringCount,
      activeMentorships,
      contributionsData,
      byYear,
      byDept,
      topCompanies,
      topIndustries,
    ] = await Promise.all([
      this.prisma.alumniProfile.count({ where: { tenantId } }),
      this.prisma.alumniProfile.count({ where: { tenantId, registrationStatus: 'approved' } }),
      this.prisma.alumniProfile.count({ where: { tenantId, registrationStatus: 'pending' } }),
      this.prisma.alumniProfile.groupBy({
        by: ['currentStatus'],
        where: { tenantId, registrationStatus: 'approved' },
        _count: true,
      }),
      this.prisma.alumniProfile.count({
        where: { tenantId, registrationStatus: 'approved', openToMentoring: true },
      }),
      this.prisma.alumniMentorship.count({
        where: { tenantId, status: 'active' },
      }),
      this.prisma.alumniContribution.aggregate({
        where: { tenantId, status: 'acknowledged' },
        _count: true,
        _sum: { amount: true },
      }),
      this.prisma.alumniProfile.groupBy({
        by: ['graduationYear'],
        where: { tenantId, registrationStatus: 'approved' },
        _count: true,
        orderBy: { graduationYear: 'desc' },
      }),
      this.prisma.alumniProfile.groupBy({
        by: ['departmentId'],
        where: { tenantId, registrationStatus: 'approved', departmentId: { not: null } },
        _count: true,
      }),
      this.prisma.alumniEmployment.groupBy({
        by: ['companyName'],
        where: { tenantId, isCurrent: true },
        _count: true,
        orderBy: { _count: { companyName: 'desc' } },
        take: 10,
      }),
      this.prisma.alumniEmployment.groupBy({
        by: ['industry'],
        where: { tenantId, isCurrent: true, industry: { not: null } },
        _count: true,
        orderBy: { _count: { industry: 'desc' } },
        take: 10,
      }),
    ]);

    // Get department names
    const deptIds = byDept.map(d => d.departmentId).filter((id): id is string => id !== null);
    const departments = await this.prisma.department.findMany({
      where: { id: { in: deptIds } },
      select: { id: true, name: true },
    });
    const deptMap = new Map(departments.map(d => [d.id, d.name]));

    const statusCountMap: Record<string, number> = {};
    statusCounts.forEach(s => {
      statusCountMap[s.currentStatus] = s._count;
    });

    const byYearMap: Record<number, number> = {};
    byYear.forEach(y => {
      byYearMap[y.graduationYear] = y._count;
    });

    return {
      totalAlumni,
      approvedCount,
      pendingCount,
      employedCount: statusCountMap['employed'] || 0,
      entrepreneurCount: statusCountMap['entrepreneur'] || 0,
      higherStudiesCount: statusCountMap['higher_studies'] || 0,
      openToMentoringCount: mentoringCount,
      activeMentorshipsCount: activeMentorships,
      totalContributions: contributionsData._count,
      totalContributionValue: Number(contributionsData._sum.amount || 0),
      byGraduationYear: byYearMap,
      byDepartment: byDept.map(d => ({
        departmentId: d.departmentId!,
        departmentName: deptMap.get(d.departmentId!) || 'Unknown',
        count: d._count,
      })),
      byCurrentStatus: statusCountMap,
      topCompanies: topCompanies.map(c => ({ company: c.companyName, count: c._count })),
      topIndustries: topIndustries.map(i => ({ industry: i.industry!, count: i._count })),
    };
  }

  async getDirectoryFilters(tenantId: string): Promise<AlumniDirectoryFiltersDto> {
    const [batches, years, departments, companies, industries, mentorshipAreas] = await Promise.all([
      this.prisma.alumniProfile.findMany({
        where: { tenantId, registrationStatus: 'approved' },
        select: { batch: true },
        distinct: ['batch'],
        orderBy: { batch: 'desc' },
      }),
      this.prisma.alumniProfile.findMany({
        where: { tenantId, registrationStatus: 'approved' },
        select: { graduationYear: true },
        distinct: ['graduationYear'],
        orderBy: { graduationYear: 'desc' },
      }),
      this.prisma.department.findMany({
        where: { tenantId },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.alumniEmployment.findMany({
        where: { tenantId, isCurrent: true },
        select: { companyName: true },
        distinct: ['companyName'],
        orderBy: { companyName: 'asc' },
        take: 50,
      }),
      this.prisma.alumniEmployment.findMany({
        where: { tenantId, isCurrent: true, industry: { not: null } },
        select: { industry: true },
        distinct: ['industry'],
        orderBy: { industry: 'asc' },
      }),
      this.prisma.alumniProfile.findMany({
        where: { tenantId, registrationStatus: 'approved', openToMentoring: true },
        select: { mentorshipAreas: true },
      }),
    ]);

    // Flatten and dedupe mentorship areas
    const allAreas = new Set<string>();
    mentorshipAreas.forEach(p => p.mentorshipAreas.forEach(a => allAreas.add(a)));

    return {
      batches: batches.map(b => b.batch),
      graduationYears: years.map(y => y.graduationYear),
      departments,
      companies: companies.map(c => c.companyName),
      industries: industries.map(i => i.industry!),
      mentorshipAreas: Array.from(allAreas).sort(),
    };
  }

  // ============ CONVERSION FROM STUDENT ============

  async convertStudentToAlumni(
    tenantId: string,
    studentId: string,
    graduationYear: number,
    finalCgpa?: number,
  ) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: {
        user: true,
        department: true,
        alumniProfile: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.alumniProfile) {
      throw new ConflictException('Student already has an alumni profile');
    }

    // Parse name
    const nameParts = (student.user?.name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return this.prisma.alumniProfile.create({
      data: {
        tenantId,
        studentId,
        userId: student.userId,
        firstName,
        lastName,
        email: student.user?.email || '',
        phone: null, // Student model doesn't have phone
        graduationYear,
        batch: student.batch || `${graduationYear - 4}-${graduationYear}`,
        departmentId: student.departmentId,
        degree: student.department?.name ? `B.Tech ${student.department.name}` : null,
        finalCgpa,
        registrationStatus: 'approved',
        currentStatus: 'employed',
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
      },
    });
  }

  /**
   * Upload profile photo for an alumni
   * Validates file type and size, uploads to S3, and updates AlumniProfile
   */
  async uploadProfilePhoto(
    tenantId: string,
    alumniId: string,
    file: Express.Multer.File,
  ): Promise<{ photoUrl: string }> {
    // Validate file type
    if (!ALLOWED_PHOTO_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed types: JPEG, PNG, WebP',
      );
    }

    // Validate file size
    if (file.size > MAX_PHOTO_SIZE) {
      throw new BadRequestException(
        'File size too large. Maximum size is 5MB',
      );
    }

    // Get alumni profile and verify they exist
    const profile = await this.prisma.alumniProfile.findFirst({
      where: { id: alumniId, tenantId },
    });

    if (!profile) {
      throw new NotFoundException('Alumni profile not found');
    }

    // Generate S3 key for profile photo
    const extension = file.mimetype.split('/')[1];
    const key = `tenants/${tenantId}/profiles/alumni-${alumniId}.${extension}`;

    // Upload to S3
    const uploadResult = await this.s3Service.uploadBuffer(
      key,
      file.buffer,
      file.mimetype,
      {
        'tenant-id': tenantId,
        'alumni-id': alumniId,
        'uploaded-at': new Date().toISOString(),
      },
    );

    // Update AlumniProfile with new photo URL
    await this.prisma.alumniProfile.update({
      where: { id: alumniId },
      data: { photoUrl: uploadResult.url },
    });

    return { photoUrl: uploadResult.url };
  }
}
