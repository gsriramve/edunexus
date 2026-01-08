import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import { randomUUID } from 'crypto';
import {
  GenerateIdCardDto,
  BulkGenerateIdCardsDto,
  RevokeIdCardDto,
  IdCardQueryDto,
  IdCardResponse,
  IdCardVerificationResponse,
  BulkGenerateResponse,
  IdCardStatsResponse,
  IdCardStatus,
} from './dto/id-cards.dto';

@Injectable()
export class IdCardsService {
  private readonly logger = new Logger(IdCardsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate an ID card for a single student
   */
  async generateIdCard(
    tenantId: string,
    studentId: string,
    dto: GenerateIdCardDto,
  ): Promise<IdCardResponse> {
    // Check if student exists
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: {
        user: true,
        department: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check if student already has an active ID card
    const existingCard = await this.prisma.studentIdCard.findUnique({
      where: { studentId },
    });

    if (existingCard && existingCard.status === 'active') {
      throw new ConflictException(
        'Student already has an active ID card. Revoke the existing card first.',
      );
    }

    // Generate card number
    const cardNumber = await this.generateCardNumber(tenantId);

    // Generate QR verification token
    const qrVerificationToken = randomUUID();

    // Generate QR code data (URL for verification)
    const qrCodeData = JSON.stringify({
      token: qrVerificationToken,
      cardNumber,
      studentId,
      tenantId,
    });

    // Calculate validity (default: end of current academic year or specified date)
    const validUntil = dto.validUntil
      ? new Date(dto.validUntil)
      : this.calculateDefaultValidity();

    // Get user profile for photo and blood group
    const userProfile = await this.prisma.userProfile.findUnique({
      where: { userId: student.userId },
      select: { photoUrl: true, bloodGroup: true },
    });

    // Create or update ID card
    const idCard = existingCard
      ? await this.prisma.studentIdCard.update({
          where: { studentId },
          data: {
            cardNumber,
            issueDate: new Date(),
            validUntil,
            qrCodeData,
            qrVerificationToken,
            status: 'active',
            cachedPhotoUrl: userProfile?.photoUrl,
            cachedName: student.user.name,
            cachedRollNo: student.rollNo,
            cachedDepartment: student.department.name,
            cachedBatch: student.batch,
            cachedBloodGroup: userProfile?.bloodGroup,
            pdfS3Key: null,
            pdfGeneratedAt: null,
          },
          include: {
            student: {
              include: {
                user: true,
                department: true,
              },
            },
          },
        })
      : await this.prisma.studentIdCard.create({
          data: {
            tenantId,
            studentId,
            cardNumber,
            validUntil,
            qrCodeData,
            qrVerificationToken,
            status: 'active',
            cachedPhotoUrl: userProfile?.photoUrl,
            cachedName: student.user.name,
            cachedRollNo: student.rollNo,
            cachedDepartment: student.department.name,
            cachedBatch: student.batch,
            cachedBloodGroup: userProfile?.bloodGroup,
          },
          include: {
            student: {
              include: {
                user: true,
                department: true,
              },
            },
          },
        });

    this.logger.log(`Generated ID card ${cardNumber} for student ${studentId}`);

    return this.mapToResponse(idCard);
  }

  /**
   * Bulk generate ID cards for multiple students
   */
  async bulkGenerateIdCards(
    tenantId: string,
    dto: BulkGenerateIdCardsDto,
  ): Promise<BulkGenerateResponse> {
    const results: BulkGenerateResponse = {
      total: dto.studentIds.length,
      generated: 0,
      skipped: 0,
      errors: [],
      cards: [],
    };

    for (const studentId of dto.studentIds) {
      try {
        const card = await this.generateIdCard(tenantId, studentId, {
          validUntil: dto.validUntil,
        });
        results.generated++;
        results.cards.push(card);
      } catch (error) {
        if (error instanceof ConflictException) {
          results.skipped++;
        } else {
          results.errors.push({
            studentId,
            error: error.message,
          });
        }
      }
    }

    this.logger.log(
      `Bulk generated ${results.generated} ID cards, skipped ${results.skipped}, errors: ${results.errors.length}`,
    );

    return results;
  }

  /**
   * Get ID card by student ID
   */
  async getIdCardByStudentId(
    tenantId: string,
    studentId: string,
  ): Promise<IdCardResponse> {
    const idCard = await this.prisma.studentIdCard.findFirst({
      where: { tenantId, studentId },
      include: {
        student: {
          include: {
            user: true,
            department: true,
          },
        },
      },
    });

    if (!idCard) {
      throw new NotFoundException('ID card not found for this student');
    }

    return this.mapToResponse(idCard);
  }

  /**
   * Get ID card by ID
   */
  async getIdCardById(tenantId: string, id: string): Promise<IdCardResponse> {
    const idCard = await this.prisma.studentIdCard.findFirst({
      where: { id, tenantId },
      include: {
        student: {
          include: {
            user: true,
            department: true,
          },
        },
      },
    });

    if (!idCard) {
      throw new NotFoundException('ID card not found');
    }

    return this.mapToResponse(idCard);
  }

  /**
   * List all ID cards with filters
   */
  async listIdCards(
    tenantId: string,
    query: IdCardQueryDto,
  ): Promise<{ cards: IdCardResponse[]; total: number }> {
    const { departmentId, batch, status, search, limit = 50, offset = 0 } = query;

    const where: any = {
      tenantId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { cardNumber: { contains: search, mode: 'insensitive' } },
          { cachedName: { contains: search, mode: 'insensitive' } },
          { cachedRollNo: { contains: search, mode: 'insensitive' } },
        ],
      }),
      student: {
        ...(departmentId && { departmentId }),
        ...(batch && { batch }),
      },
    };

    const [cards, total] = await Promise.all([
      this.prisma.studentIdCard.findMany({
        where,
        include: {
          student: {
            include: {
              user: true,
              department: true,
            },
          },
        },
        orderBy: { issueDate: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.studentIdCard.count({ where }),
    ]);

    return {
      cards: cards.map(this.mapToResponse),
      total,
    };
  }

  /**
   * Generate PDF for an ID card
   */
  async generatePdf(tenantId: string, id: string): Promise<Buffer> {
    const idCard = await this.getIdCardById(tenantId, id);

    // Get tenant info for college name
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, displayName: true, logo: true },
    });

    const collegeName = tenant?.displayName || tenant?.name || 'EduNexus College';

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(idCard.qrVerificationToken, {
      width: 100,
      margin: 1,
    });

    // Create PDF
    const pdfBuffer = await this.createIdCardPdf(idCard, collegeName, qrCodeDataUrl);

    // Update PDF generated timestamp
    await this.prisma.studentIdCard.update({
      where: { id },
      data: { pdfGeneratedAt: new Date() },
    });

    return pdfBuffer;
  }

  /**
   * Verify an ID card by token (public endpoint)
   */
  async verifyIdCard(token: string): Promise<IdCardVerificationResponse> {
    const idCard = await this.prisma.studentIdCard.findUnique({
      where: { qrVerificationToken: token },
    });

    if (!idCard) {
      return {
        valid: false,
        message: 'Invalid or unknown ID card',
      };
    }

    // Get tenant name
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: idCard.tenantId },
      select: { name: true, displayName: true },
    });

    const now = new Date();

    if (idCard.status === 'revoked') {
      return {
        valid: false,
        message: 'This ID card has been revoked',
        card: {
          cardNumber: idCard.cardNumber,
          studentName: idCard.cachedName,
          rollNo: idCard.cachedRollNo,
          department: idCard.cachedDepartment,
          batch: idCard.cachedBatch,
          status: idCard.status,
          validUntil: idCard.validUntil,
        },
        collegeName: tenant?.displayName || tenant?.name,
      };
    }

    if (idCard.validUntil < now) {
      return {
        valid: false,
        message: 'This ID card has expired',
        card: {
          cardNumber: idCard.cardNumber,
          studentName: idCard.cachedName,
          rollNo: idCard.cachedRollNo,
          department: idCard.cachedDepartment,
          batch: idCard.cachedBatch,
          status: 'expired',
          validUntil: idCard.validUntil,
        },
        collegeName: tenant?.displayName || tenant?.name,
      };
    }

    return {
      valid: true,
      message: 'ID card is valid',
      card: {
        cardNumber: idCard.cardNumber,
        studentName: idCard.cachedName,
        rollNo: idCard.cachedRollNo,
        department: idCard.cachedDepartment,
        batch: idCard.cachedBatch,
        status: idCard.status,
        validUntil: idCard.validUntil,
        photoUrl: idCard.cachedPhotoUrl || undefined,
      },
      collegeName: tenant?.displayName || tenant?.name,
    };
  }

  /**
   * Revoke an ID card
   */
  async revokeIdCard(
    tenantId: string,
    id: string,
    dto: RevokeIdCardDto,
  ): Promise<IdCardResponse> {
    const idCard = await this.prisma.studentIdCard.findFirst({
      where: { id, tenantId },
    });

    if (!idCard) {
      throw new NotFoundException('ID card not found');
    }

    if (idCard.status === 'revoked') {
      throw new BadRequestException('ID card is already revoked');
    }

    const updated = await this.prisma.studentIdCard.update({
      where: { id },
      data: { status: 'revoked' },
      include: {
        student: {
          include: {
            user: true,
            department: true,
          },
        },
      },
    });

    this.logger.log(`Revoked ID card ${idCard.cardNumber}. Reason: ${dto.reason || 'Not specified'}`);

    return this.mapToResponse(updated);
  }

  /**
   * Get ID card statistics
   */
  async getStats(tenantId: string): Promise<IdCardStatsResponse> {
    const [
      totalCards,
      activeCards,
      expiredCards,
      revokedCards,
      cardsByDepartment,
      cardsByBatch,
      recentCards,
    ] = await Promise.all([
      this.prisma.studentIdCard.count({ where: { tenantId } }),
      this.prisma.studentIdCard.count({
        where: { tenantId, status: 'active', validUntil: { gte: new Date() } },
      }),
      this.prisma.studentIdCard.count({
        where: { tenantId, validUntil: { lt: new Date() }, status: { not: 'revoked' } },
      }),
      this.prisma.studentIdCard.count({ where: { tenantId, status: 'revoked' } }),
      this.prisma.studentIdCard.groupBy({
        by: ['cachedDepartment'],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.studentIdCard.groupBy({
        by: ['cachedBatch'],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.studentIdCard.findMany({
        where: { tenantId },
        orderBy: { issueDate: 'desc' },
        take: 5,
        include: {
          student: {
            include: {
              user: true,
              department: true,
            },
          },
        },
      }),
    ]);

    return {
      totalCards,
      activeCards,
      expiredCards,
      revokedCards,
      cardsByDepartment: cardsByDepartment.reduce(
        (acc, item) => {
          acc[item.cachedDepartment] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      cardsByBatch: cardsByBatch.reduce(
        (acc, item) => {
          acc[item.cachedBatch] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      recentlyGenerated: recentCards.map(this.mapToResponse),
    };
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private async generateCardNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `STID${year}`;

    // Get the last card number for this year and tenant
    const lastCard = await this.prisma.studentIdCard.findFirst({
      where: {
        tenantId,
        cardNumber: { startsWith: prefix },
      },
      orderBy: { cardNumber: 'desc' },
    });

    let sequence = 1;
    if (lastCard) {
      const lastSequence = parseInt(lastCard.cardNumber.replace(prefix, ''), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  private calculateDefaultValidity(): Date {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Academic year ends in May
    // If we're after May, validity is until next May
    // If we're before May, validity is until this May
    const validityYear = month >= 5 ? year + 1 : year;
    return new Date(validityYear, 4, 31); // May 31
  }

  private async createIdCardPdf(
    idCard: IdCardResponse,
    collegeName: string,
    qrCodeDataUrl: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Credit card size: 85.6mm x 53.98mm (3.375" x 2.125")
        // In points (72 points per inch): 243 x 153
        const doc = new PDFDocument({
          size: [243, 153],
          margin: 10,
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Background
        doc.rect(0, 0, 243, 153).fill('#f8fafc');

        // Header background
        doc.rect(0, 0, 243, 35).fill('#1e40af');

        // College name
        doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
        doc.text(collegeName.toUpperCase(), 10, 8, {
          width: 223,
          align: 'center',
        });

        // ID Card title
        doc.fontSize(7).font('Helvetica');
        doc.text('STUDENT IDENTITY CARD', 10, 22, {
          width: 223,
          align: 'center',
        });

        // Photo placeholder (left side)
        doc.rect(12, 42, 50, 60).fill('#e2e8f0');
        doc.fillColor('#94a3b8').fontSize(6);
        doc.text('PHOTO', 12, 68, { width: 50, align: 'center' });

        // Student details (center)
        doc.fillColor('#1e293b');

        // Name
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text(idCard.cachedName.toUpperCase(), 68, 42, { width: 110 });

        // Roll Number
        doc.fontSize(7).font('Helvetica');
        doc.fillColor('#64748b').text('Roll No:', 68, 56);
        doc.fillColor('#1e293b').font('Helvetica-Bold');
        doc.text(idCard.cachedRollNo, 98, 56);

        // Department
        doc.font('Helvetica').fillColor('#64748b');
        doc.text('Dept:', 68, 67);
        doc.fillColor('#1e293b').font('Helvetica-Bold');
        doc.text(idCard.cachedDepartment, 88, 67, { width: 90 });

        // Batch
        doc.font('Helvetica').fillColor('#64748b');
        doc.text('Batch:', 68, 78);
        doc.fillColor('#1e293b').font('Helvetica-Bold');
        doc.text(idCard.cachedBatch, 93, 78);

        // Blood Group (if available)
        if (idCard.cachedBloodGroup) {
          doc.font('Helvetica').fillColor('#64748b');
          doc.text('Blood:', 68, 89);
          doc.fillColor('#dc2626').font('Helvetica-Bold');
          doc.text(idCard.cachedBloodGroup, 93, 89);
        }

        // QR Code (right side)
        // Convert data URL to buffer and embed
        const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
        doc.image(qrBuffer, 185, 42, { width: 48, height: 48 });

        // Card number and validity at bottom
        doc.rect(0, 118, 243, 35).fill('#f1f5f9');

        // Card Number
        doc.fillColor('#64748b').fontSize(6).font('Helvetica');
        doc.text('Card No:', 12, 124);
        doc.fillColor('#1e293b').font('Helvetica-Bold');
        doc.text(idCard.cardNumber, 42, 124);

        // Valid Until
        doc.fillColor('#64748b').font('Helvetica');
        doc.text('Valid Until:', 12, 135);
        doc.fillColor('#1e293b').font('Helvetica-Bold');
        const validDate = new Date(idCard.validUntil).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        doc.text(validDate, 48, 135);

        // Issue Date
        doc.fillColor('#64748b').font('Helvetica');
        doc.text('Issued:', 130, 124);
        doc.fillColor('#1e293b').font('Helvetica-Bold');
        const issueDate = new Date(idCard.issueDate).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        doc.text(issueDate, 158, 124);

        // Scan instruction
        doc.fillColor('#64748b').font('Helvetica').fontSize(5);
        doc.text('Scan QR to verify', 185, 92, { width: 48, align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private mapToResponse(idCard: any): IdCardResponse {
    return {
      id: idCard.id,
      tenantId: idCard.tenantId,
      studentId: idCard.studentId,
      cardNumber: idCard.cardNumber,
      issueDate: idCard.issueDate,
      validUntil: idCard.validUntil,
      qrVerificationToken: idCard.qrVerificationToken,
      status: idCard.status,
      cachedName: idCard.cachedName,
      cachedRollNo: idCard.cachedRollNo,
      cachedDepartment: idCard.cachedDepartment,
      cachedBatch: idCard.cachedBatch,
      cachedBloodGroup: idCard.cachedBloodGroup,
      cachedPhotoUrl: idCard.cachedPhotoUrl,
      pdfGeneratedAt: idCard.pdfGeneratedAt,
      createdAt: idCard.createdAt,
      updatedAt: idCard.updatedAt,
      student: idCard.student
        ? {
            id: idCard.student.id,
            rollNo: idCard.student.rollNo,
            batch: idCard.student.batch,
            semester: idCard.student.semester,
            section: idCard.student.section,
            user: idCard.student.user,
            department: idCard.student.department,
          }
        : undefined,
    };
  }
}
