import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvitationDto, InvitationQueryDto } from './dto/invitation.dto';
import { UserRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InvitationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new invitation
   */
  async create(
    tenantId: string,
    createDto: CreateInvitationDto,
    invitedById: string,
    invitedByName: string,
  ) {
    // Check if there's already a pending invitation for this email
    const existingInvitation = await this.prisma.invitation.findUnique({
      where: {
        tenantId_email: { tenantId, email: createDto.email },
      },
    });

    if (existingInvitation) {
      if (existingInvitation.status === 'pending') {
        throw new ConflictException('An invitation for this email already exists and is pending.');
      }
      if (existingInvitation.status === 'accepted') {
        throw new ConflictException('This email has already been used to accept an invitation.');
      }
    }

    // Check if user already exists with this email
    const existingUser = await this.prisma.user.findUnique({
      where: {
        tenantId_email: { tenantId, email: createDto.email },
      },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }

    // Set expiration (default 7 days)
    const expiresAt = createDto.expiresAt
      ? new Date(createDto.expiresAt)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await this.prisma.invitation.create({
      data: {
        tenantId,
        email: createDto.email,
        role: createDto.role,
        invitedById,
        invitedByName,
        message: createDto.message,
        token: uuidv4(),
        expiresAt,
      },
    });

    // TODO: Send invitation email via notifications service
    // await this.notificationsService.sendInvitationEmail(invitation);

    return invitation;
  }

  /**
   * List all invitations for a tenant
   */
  async findAll(tenantId: string, query: InvitationQueryDto) {
    const where: any = { tenantId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.role) {
      where.role = query.role;
    }

    if (query.search) {
      where.email = { contains: query.search, mode: 'insensitive' };
    }

    const invitations = await this.prisma.invitation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return invitations;
  }

  /**
   * Get a single invitation by ID
   */
  async findOne(tenantId: string, id: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id, tenantId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    return invitation;
  }

  /**
   * Validate an invitation token (public - no tenantId required)
   */
  async validateToken(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException('Invalid invitation token');
    }

    if (invitation.status === 'accepted') {
      throw new BadRequestException('This invitation has already been used.');
    }

    if (invitation.status === 'cancelled') {
      throw new BadRequestException('This invitation has been cancelled.');
    }

    if (invitation.status === 'expired' || new Date() > invitation.expiresAt) {
      // Update status to expired if not already
      if (invitation.status !== 'expired') {
        await this.prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: 'expired' },
        });
      }
      throw new BadRequestException('This invitation has expired.');
    }

    // Get tenant info
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: invitation.tenantId },
      select: { id: true, name: true, displayName: true, logo: true },
    });

    return {
      valid: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        message: invitation.message,
        expiresAt: invitation.expiresAt,
      },
      tenant,
    };
  }

  /**
   * Accept an invitation (called after user signs up via Clerk webhook)
   */
  async accept(token: string, clerkUserId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException('Invalid invitation token');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException(`Invitation is ${invitation.status}`);
    }

    if (new Date() > invitation.expiresAt) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' },
      });
      throw new BadRequestException('This invitation has expired.');
    }

    // Create user in database with the assigned role
    const user = await this.prisma.user.create({
      data: {
        tenantId: invitation.tenantId,
        clerkUserId,
        email: invitation.email,
        name: invitation.email.split('@')[0], // Default name, will be updated by Clerk webhook
        role: invitation.role,
        status: 'active',
      },
    });

    // Mark invitation as accepted
    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'accepted',
        acceptedAt: new Date(),
      },
    });

    return { user, invitation };
  }

  /**
   * Resend invitation email
   */
  async resend(tenantId: string, id: string, message?: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id, tenantId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException(`Cannot resend ${invitation.status} invitation`);
    }

    // Generate new token and extend expiry
    const updatedInvitation = await this.prisma.invitation.update({
      where: { id },
      data: {
        token: uuidv4(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        message: message || invitation.message,
      },
    });

    // TODO: Send invitation email via notifications service
    // await this.notificationsService.sendInvitationEmail(updatedInvitation);

    return updatedInvitation;
  }

  /**
   * Cancel an invitation
   */
  async cancel(tenantId: string, id: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id, tenantId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException(`Cannot cancel ${invitation.status} invitation`);
    }

    return this.prisma.invitation.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  /**
   * Get invitation statistics for a tenant
   */
  async getStats(tenantId: string) {
    const [pending, accepted, expired, cancelled] = await Promise.all([
      this.prisma.invitation.count({ where: { tenantId, status: 'pending' } }),
      this.prisma.invitation.count({ where: { tenantId, status: 'accepted' } }),
      this.prisma.invitation.count({ where: { tenantId, status: 'expired' } }),
      this.prisma.invitation.count({ where: { tenantId, status: 'cancelled' } }),
    ]);

    return { pending, accepted, expired, cancelled, total: pending + accepted + expired + cancelled };
  }
}
