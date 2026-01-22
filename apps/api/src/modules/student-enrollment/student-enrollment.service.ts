import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EnrollmentStatus, UserRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../notifications/email.service';
import {
  InitiateEnrollmentDto,
  EnrollmentQueryDto,
  UpdateProfileDto,
  AdminReviewDto,
  ApprovalDto,
  StudentSignupDto,
} from './dto/enrollment.dto';

@Injectable()
export class StudentEnrollmentService {
  private readonly logger = new Logger(StudentEnrollmentService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Admin: Initiate a new student enrollment
   */
  async initiate(
    tenantId: string,
    dto: InitiateEnrollmentDto,
    createdById: string,
  ) {
    // Check if department exists and belongs to tenant
    const department = await this.prisma.department.findFirst({
      where: { id: dto.departmentId, tenantId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Check for existing enrollment with same email
    const existingEnrollment = await this.prisma.studentEnrollment.findFirst({
      where: {
        tenantId,
        email: dto.email,
        status: {
          notIn: [EnrollmentStatus.REJECTED, EnrollmentStatus.EXPIRED, EnrollmentStatus.COMPLETED],
        },
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('An enrollment for this email already exists and is in progress');
    }

    // Check if user already exists with this email
    const existingUser = await this.prisma.user.findFirst({
      where: { tenantId, email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists in this institution');
    }

    // Generate invitation token and set expiry (30 days)
    const invitationToken = uuidv4();
    const invitationExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const enrollment = await this.prisma.studentEnrollment.create({
      data: {
        tenantId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        mobileNumber: dto.mobileNumber,
        departmentId: dto.departmentId,
        academicYear: dto.academicYear,
        invitationToken,
        invitationExpiresAt,
        status: EnrollmentStatus.INITIATED,
        createdById,
      },
      include: {
        department: true,
      },
    });

    this.logger.log(`Enrollment initiated for ${dto.email} in tenant ${tenantId}`);

    return enrollment;
  }

  /**
   * Admin: Send or resend invitation email
   */
  async sendInvitation(tenantId: string, enrollmentId: string) {
    const enrollment = await this.prisma.studentEnrollment.findFirst({
      where: { id: enrollmentId, tenantId },
      include: { department: true },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.status === EnrollmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot send invitation for completed enrollment');
    }

    if (enrollment.status === EnrollmentStatus.REJECTED) {
      throw new BadRequestException('Cannot send invitation for rejected enrollment');
    }

    // Get tenant info
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, displayName: true, domain: true },
    });

    const collegeName = tenant?.displayName || tenant?.name || 'Your College';
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const enrollUrl = `${appUrl}/enroll/${enrollment.invitationToken}`;

    // Regenerate token if expired or close to expiry
    let token = enrollment.invitationToken;
    let expiresAt = enrollment.invitationExpiresAt;

    if (new Date() >= enrollment.invitationExpiresAt ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) >= enrollment.invitationExpiresAt) {
      token = uuidv4();
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    // Update enrollment status and token
    const updatedEnrollment = await this.prisma.studentEnrollment.update({
      where: { id: enrollmentId },
      data: {
        invitationToken: token,
        invitationExpiresAt: expiresAt,
        status: EnrollmentStatus.INVITATION_SENT,
      },
      include: { department: true },
    });

    // Send email
    try {
      await this.emailService.sendEmail({
        to: enrollment.email,
        subject: `Complete Your Enrollment at ${collegeName}`,
        templateType: 'ENROLLMENT_INVITATION' as any,
        templateData: {
          studentName: `${enrollment.firstName} ${enrollment.lastName}`,
          collegeName,
          departmentName: enrollment.department.name,
          academicYear: enrollment.academicYear,
          enrollUrl: `${appUrl}/enroll/${token}`,
          expiryDays: '30',
        },
        customHtml: this.getEnrollmentInvitationHtml({
          studentName: `${enrollment.firstName} ${enrollment.lastName}`,
          collegeName,
          departmentName: enrollment.department.name,
          academicYear: enrollment.academicYear,
          enrollUrl: `${appUrl}/enroll/${token}`,
        }),
      });

      this.logger.log(`Invitation email sent to ${enrollment.email}`);
    } catch (error) {
      this.logger.error(`Failed to send invitation email: ${error.message}`);
    }

    return updatedEnrollment;
  }

  /**
   * Get all enrollments for a tenant with filters
   */
  async findAll(tenantId: string, query: EnrollmentQueryDto) {
    const where: any = { tenantId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    if (query.academicYear) {
      where.academicYear = query.academicYear;
    }

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { mobileNumber: { contains: query.search } },
      ];
    }

    const enrollments = await this.prisma.studentEnrollment.findMany({
      where,
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return enrollments;
  }

  /**
   * Get a single enrollment by ID
   */
  async findOne(tenantId: string, id: string) {
    const enrollment = await this.prisma.studentEnrollment.findFirst({
      where: { id, tenantId },
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
        student: {
          select: { id: true, rollNo: true, userId: true },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return enrollment;
  }

  /**
   * Public: Verify enrollment token
   */
  async verifyToken(token: string) {
    const enrollment = await this.prisma.studentEnrollment.findUnique({
      where: { invitationToken: token },
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Invalid enrollment token');
    }

    if (new Date() > enrollment.invitationExpiresAt) {
      // Mark as expired
      await this.prisma.studentEnrollment.update({
        where: { id: enrollment.id },
        data: { status: EnrollmentStatus.EXPIRED },
      });
      throw new BadRequestException('This enrollment invitation has expired');
    }

    if (enrollment.status === EnrollmentStatus.REJECTED) {
      throw new BadRequestException('This enrollment has been rejected');
    }

    if (enrollment.status === EnrollmentStatus.COMPLETED) {
      throw new BadRequestException('This enrollment has already been completed');
    }

    // Get tenant info
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: enrollment.tenantId },
      select: { id: true, name: true, displayName: true, logo: true },
    });

    return {
      valid: true,
      enrollment: {
        id: enrollment.id,
        firstName: enrollment.firstName,
        lastName: enrollment.lastName,
        email: enrollment.email,
        departmentName: enrollment.department.name,
        academicYear: enrollment.academicYear,
        status: enrollment.status,
        personalDetails: enrollment.personalDetails,
        academicDetails: enrollment.academicDetails,
        documents: enrollment.documents,
      },
      tenant,
    };
  }

  /**
   * Public: Student signs up with Clerk and links to enrollment
   */
  async studentSignup(token: string, dto: StudentSignupDto) {
    const enrollment = await this.prisma.studentEnrollment.findUnique({
      where: { invitationToken: token },
    });

    if (!enrollment) {
      throw new NotFoundException('Invalid enrollment token');
    }

    if (enrollment.status === EnrollmentStatus.COMPLETED) {
      throw new BadRequestException('This enrollment has already been completed');
    }

    if (new Date() > enrollment.invitationExpiresAt) {
      throw new BadRequestException('This enrollment invitation has expired');
    }

    // Update enrollment status
    const updatedEnrollment = await this.prisma.studentEnrollment.update({
      where: { id: enrollment.id },
      data: { status: EnrollmentStatus.STUDENT_SIGNED_UP },
    });

    this.logger.log(`Student signed up for enrollment ${enrollment.id}`);

    return updatedEnrollment;
  }

  /**
   * Public: Update student profile during onboarding
   */
  async updateProfile(token: string, dto: UpdateProfileDto) {
    const enrollment = await this.prisma.studentEnrollment.findUnique({
      where: { invitationToken: token },
    });

    if (!enrollment) {
      throw new NotFoundException('Invalid enrollment token');
    }

    if (enrollment.status === EnrollmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot update profile for completed enrollment');
    }

    if (enrollment.status === EnrollmentStatus.REJECTED) {
      throw new BadRequestException('Cannot update profile for rejected enrollment');
    }

    // Merge with existing data
    const personalDetails = {
      ...(enrollment.personalDetails as object || {}),
      ...(dto.personalDetails || {}),
    };

    const academicDetails = {
      ...(enrollment.academicDetails as object || {}),
      ...(dto.academicDetails || {}),
    };

    const documents = {
      ...(enrollment.documents as object || {}),
      ...(dto.documents || {}),
    };

    const updatedEnrollment = await this.prisma.studentEnrollment.update({
      where: { id: enrollment.id },
      data: {
        personalDetails,
        academicDetails,
        documents,
        status: EnrollmentStatus.PROFILE_INCOMPLETE,
      },
      include: {
        department: true,
      },
    });

    return updatedEnrollment;
  }

  /**
   * Public: Student submits enrollment for review
   */
  async submitForReview(token: string) {
    const enrollment = await this.prisma.studentEnrollment.findUnique({
      where: { invitationToken: token },
      include: { department: true },
    });

    if (!enrollment) {
      throw new NotFoundException('Invalid enrollment token');
    }

    const validStatuses: EnrollmentStatus[] = [
      EnrollmentStatus.STUDENT_SIGNED_UP,
      EnrollmentStatus.PROFILE_INCOMPLETE,
      EnrollmentStatus.CHANGES_REQUESTED,
    ];

    if (!validStatuses.includes(enrollment.status)) {
      throw new BadRequestException(`Cannot submit enrollment in status: ${enrollment.status}`);
    }

    // Validate required fields
    const personalDetails = enrollment.personalDetails as any;
    const documents = enrollment.documents as any;

    if (!personalDetails?.dateOfBirth) {
      throw new BadRequestException('Date of birth is required');
    }

    if (!personalDetails?.gender) {
      throw new BadRequestException('Gender is required');
    }

    if (!documents?.photo) {
      throw new BadRequestException('Photo is required');
    }

    const updatedEnrollment = await this.prisma.studentEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: EnrollmentStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      include: { department: true },
    });

    // Notify admin about new submission
    // TODO: Send notification to admin

    this.logger.log(`Enrollment ${enrollment.id} submitted for review`);

    return updatedEnrollment;
  }

  /**
   * Admin: Review and approve/reject enrollment
   */
  async adminReview(tenantId: string, enrollmentId: string, dto: AdminReviewDto, reviewerId: string) {
    const enrollment = await this.prisma.studentEnrollment.findFirst({
      where: { id: enrollmentId, tenantId },
      include: { department: true },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.status !== EnrollmentStatus.SUBMITTED) {
      throw new BadRequestException(`Cannot review enrollment in status: ${enrollment.status}`);
    }

    let newStatus: EnrollmentStatus;
    switch (dto.action) {
      case 'ADMIN_APPROVED':
        newStatus = EnrollmentStatus.ADMIN_APPROVED;
        break;
      case 'CHANGES_REQUESTED':
        newStatus = EnrollmentStatus.CHANGES_REQUESTED;
        break;
      case 'REJECTED':
        newStatus = EnrollmentStatus.REJECTED;
        break;
    }

    const updatedEnrollment = await this.prisma.studentEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: newStatus,
        section: dto.section,
        adminReviewedAt: new Date(),
        adminReviewedById: reviewerId,
        adminNotes: dto.notes,
      },
      include: { department: true },
    });

    // Send notification to student
    if (dto.action === 'CHANGES_REQUESTED') {
      // TODO: Send email about changes needed
      this.logger.log(`Changes requested for enrollment ${enrollmentId}`);
    } else if (dto.action === 'REJECTED') {
      // TODO: Send rejection email
      this.logger.log(`Enrollment ${enrollmentId} rejected`);
    } else {
      // TODO: Notify HOD/Principal about pending approval
      this.logger.log(`Enrollment ${enrollmentId} approved by admin, pending final approval`);
    }

    return updatedEnrollment;
  }

  /**
   * Get enrollments pending approval (for HOD/Principal)
   */
  async getPendingApprovals(tenantId: string, userId: string, role: UserRole) {
    // Get user's department if HOD
    let departmentId: string | undefined;

    if (role === UserRole.hod) {
      const staff = await this.prisma.staff.findFirst({
        where: { userId },
        include: { department: true },
      });
      departmentId = staff?.departmentId || undefined;
    }

    const where: any = {
      tenantId,
      status: EnrollmentStatus.ADMIN_APPROVED,
    };

    // HOD can only see their department's enrollments
    if (departmentId) {
      where.departmentId = departmentId;
    }

    const enrollments = await this.prisma.studentEnrollment.findMany({
      where,
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { adminReviewedAt: 'asc' },
    });

    return enrollments;
  }

  /**
   * HOD/Principal: Approve or reject enrollment
   */
  async finalApproval(
    tenantId: string,
    enrollmentId: string,
    dto: ApprovalDto,
    approverId: string,
    approverRole: UserRole,
  ) {
    const enrollment = await this.prisma.studentEnrollment.findFirst({
      where: { id: enrollmentId, tenantId },
      include: { department: true },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Verify approver has access to this enrollment's department (for HOD)
    if (approverRole === UserRole.hod) {
      const staff = await this.prisma.staff.findFirst({
        where: { userId: approverId },
      });

      if (staff?.departmentId !== enrollment.departmentId) {
        throw new ForbiddenException('You can only approve enrollments for your department');
      }
    }

    // Check valid status for approval
    const validStatuses: EnrollmentStatus[] = [EnrollmentStatus.ADMIN_APPROVED];
    if (approverRole === UserRole.principal) {
      validStatuses.push(EnrollmentStatus.HOD_APPROVED);
    }

    if (!validStatuses.includes(enrollment.status)) {
      throw new BadRequestException(`Cannot approve enrollment in status: ${enrollment.status}`);
    }

    if (dto.action === 'reject') {
      const updatedEnrollment = await this.prisma.studentEnrollment.update({
        where: { id: enrollmentId },
        data: {
          status: EnrollmentStatus.REJECTED,
          ...(approverRole === UserRole.hod
            ? { hodApprovedById: approverId, hodNotes: dto.notes }
            : { principalApprovedById: approverId, principalNotes: dto.notes }),
        },
        include: { department: true },
      });

      // TODO: Send rejection notification
      return updatedEnrollment;
    }

    // Determine new status based on role
    let newStatus: EnrollmentStatus;
    const updateData: any = {};

    if (approverRole === UserRole.hod) {
      newStatus = EnrollmentStatus.HOD_APPROVED;
      updateData.hodApprovedAt = new Date();
      updateData.hodApprovedById = approverId;
      updateData.hodNotes = dto.notes;
    } else {
      // Principal approval = final approval, complete the enrollment
      newStatus = EnrollmentStatus.COMPLETED;
      updateData.principalApprovedAt = new Date();
      updateData.principalApprovedById = approverId;
      updateData.principalNotes = dto.notes;
      updateData.completedAt = new Date();
    }

    updateData.status = newStatus;

    // If completing, generate roll number and official email
    if (newStatus === EnrollmentStatus.COMPLETED) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { domain: true },
      });

      updateData.rollNumber = await this.generateRollNumber(
        tenantId,
        enrollment.departmentId,
        enrollment.academicYear,
      );

      updateData.officialEmail = await this.generateOfficialEmail(
        enrollment.firstName,
        enrollment.lastName,
        tenant?.domain || 'edu.in',
      );

      // Create User and Student records
      await this.createStudentRecords(enrollment, updateData.rollNumber, updateData.officialEmail);
    }

    const updatedEnrollment = await this.prisma.studentEnrollment.update({
      where: { id: enrollmentId },
      data: updateData,
      include: { department: true },
    });

    this.logger.log(`Enrollment ${enrollmentId} approved by ${approverRole}, status: ${newStatus}`);

    return updatedEnrollment;
  }

  /**
   * Cancel an enrollment (Admin only)
   */
  async cancel(tenantId: string, enrollmentId: string) {
    const enrollment = await this.prisma.studentEnrollment.findFirst({
      where: { id: enrollmentId, tenantId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.status === EnrollmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed enrollment');
    }

    await this.prisma.studentEnrollment.delete({
      where: { id: enrollmentId },
    });

    this.logger.log(`Enrollment ${enrollmentId} cancelled`);

    return { success: true };
  }

  /**
   * Get enrollment statistics for a tenant
   */
  async getStats(tenantId: string, academicYear?: string) {
    const where: any = { tenantId };
    if (academicYear) {
      where.academicYear = academicYear;
    }

    const [
      initiated,
      invitationSent,
      signedUp,
      profileIncomplete,
      submitted,
      adminApproved,
      changesRequested,
      hodApproved,
      completed,
      rejected,
      expired,
    ] = await Promise.all([
      this.prisma.studentEnrollment.count({ where: { ...where, status: EnrollmentStatus.INITIATED } }),
      this.prisma.studentEnrollment.count({ where: { ...where, status: EnrollmentStatus.INVITATION_SENT } }),
      this.prisma.studentEnrollment.count({ where: { ...where, status: EnrollmentStatus.STUDENT_SIGNED_UP } }),
      this.prisma.studentEnrollment.count({ where: { ...where, status: EnrollmentStatus.PROFILE_INCOMPLETE } }),
      this.prisma.studentEnrollment.count({ where: { ...where, status: EnrollmentStatus.SUBMITTED } }),
      this.prisma.studentEnrollment.count({ where: { ...where, status: EnrollmentStatus.ADMIN_APPROVED } }),
      this.prisma.studentEnrollment.count({ where: { ...where, status: EnrollmentStatus.CHANGES_REQUESTED } }),
      this.prisma.studentEnrollment.count({ where: { ...where, status: EnrollmentStatus.HOD_APPROVED } }),
      this.prisma.studentEnrollment.count({ where: { ...where, status: EnrollmentStatus.COMPLETED } }),
      this.prisma.studentEnrollment.count({ where: { ...where, status: EnrollmentStatus.REJECTED } }),
      this.prisma.studentEnrollment.count({ where: { ...where, status: EnrollmentStatus.EXPIRED } }),
    ]);

    return {
      initiated,
      invitationSent,
      signedUp,
      profileIncomplete,
      submitted,
      adminApproved,
      changesRequested,
      hodApproved,
      completed,
      rejected,
      expired,
      total: initiated + invitationSent + signedUp + profileIncomplete + submitted +
             adminApproved + changesRequested + hodApproved + completed + rejected + expired,
      pending: initiated + invitationSent + signedUp + profileIncomplete + submitted +
               adminApproved + changesRequested + hodApproved,
    };
  }

  // ================== Private Helper Methods ==================

  /**
   * Generate roll number in format: YYDDDSSS (e.g., 25CSE001)
   */
  private async generateRollNumber(
    tenantId: string,
    departmentId: string,
    academicYear: string,
  ): Promise<string> {
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Extract year prefix from academic year (e.g., "2025-26" → "25")
    const yearPrefix = academicYear.slice(2, 4);
    const deptCode = department.code.toUpperCase().slice(0, 3).padEnd(3, 'X');

    // Count existing completed enrollments in this dept/year
    const count = await this.prisma.studentEnrollment.count({
      where: {
        tenantId,
        departmentId,
        academicYear,
        status: EnrollmentStatus.COMPLETED,
      },
    });

    const sequenceNumber = String(count + 1).padStart(3, '0');
    return `${yearPrefix}${deptCode}${sequenceNumber}`;
  }

  /**
   * Generate official email in format: firstname.lastname@domain.edu
   */
  private async generateOfficialEmail(
    firstName: string,
    lastName: string,
    tenantDomain: string,
  ): Promise<string> {
    const base = `${firstName.toLowerCase().replace(/[^a-z]/g, '')}.${lastName.toLowerCase().replace(/[^a-z]/g, '')}`;
    let email = `${base}@${tenantDomain}`;

    // Check for duplicates and append number if needed
    const existing = await this.prisma.studentEnrollment.count({
      where: {
        officialEmail: { startsWith: base },
      },
    });

    if (existing > 0) {
      email = `${base}${existing + 1}@${tenantDomain}`;
    }

    return email;
  }

  /**
   * Create User and Student records upon enrollment completion
   */
  private async createStudentRecords(
    enrollment: any,
    rollNumber: string,
    officialEmail: string,
  ) {
    // Create User record
    const user = await this.prisma.user.create({
      data: {
        tenantId: enrollment.tenantId,
        email: enrollment.email,
        name: `${enrollment.firstName} ${enrollment.lastName}`,
        role: UserRole.student,
        status: 'active',
      },
    });

    // Create Student record
    const student = await this.prisma.student.create({
      data: {
        tenantId: enrollment.tenantId,
        userId: user.id,
        rollNo: rollNumber,
        batch: enrollment.academicYear,
        departmentId: enrollment.departmentId,
        semester: 1,
        section: enrollment.section,
        status: 'active',
        admissionDate: new Date(),
      },
    });

    // Link enrollment to student
    await this.prisma.studentEnrollment.update({
      where: { id: enrollment.id },
      data: { studentId: student.id },
    });

    this.logger.log(`Created User (${user.id}) and Student (${student.id}) for enrollment ${enrollment.id}`);

    return { user, student };
  }

  /**
   * Generate enrollment invitation email HTML
   */
  private getEnrollmentInvitationHtml(data: {
    studentName: string;
    collegeName: string;
    departmentName: string;
    academicYear: string;
    enrollUrl: string;
  }): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your Enrollment</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f7; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .email-wrapper { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .header .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
    .content { padding: 30px; }
    .content h2 { color: #4F46E5; margin-top: 0; }
    .info-box { background-color: #f8f9fa; border-left: 4px solid #4F46E5; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 0; }
    .footer { background-color: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 14px; color: #6c757d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <div class="logo">E</div>
        <h1>EduNexus</h1>
      </div>
      <div class="content">
        <h2>Complete Your Enrollment</h2>
        <p>Dear ${data.studentName},</p>
        <p>Congratulations! You have been invited to enroll at <strong>${data.collegeName}</strong>.</p>

        <div class="info-box">
          <p><strong>Department:</strong> ${data.departmentName}</p>
          <p><strong>Academic Year:</strong> ${data.academicYear}</p>
        </div>

        <p>To complete your enrollment, please click the button below to create your account and fill in your profile details.</p>

        <p style="text-align: center;">
          <a href="${data.enrollUrl}" class="btn">Complete Enrollment</a>
        </p>

        <p style="color: #6c757d; font-size: 14px;">This link will expire in 30 days. If you did not expect this invitation, please ignore this email.</p>
      </div>
      <div class="footer">
        <p>This is an automated message from EduNexus.</p>
        <p>&copy; ${new Date().getFullYear()} EduNexus. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }
}
