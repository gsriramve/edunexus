import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Logger,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { InvitationsService } from '../invitations/invitations.service';
import * as crypto from 'crypto';

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{
      id: string;
      email_address: string;
      verification: { status: string };
    }>;
    first_name?: string;
    last_name?: string;
    username?: string;
    public_metadata?: Record<string, any>;
    private_metadata?: Record<string, any>;
    created_at?: number;
    updated_at?: number;
  };
}

@Controller('webhooks/clerk')
export class ClerkWebhookController {
  private readonly logger = new Logger(ClerkWebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly invitationsService: InvitationsService,
  ) {}

  @Post()
  async handleWebhook(
    @Body() event: ClerkWebhookEvent,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    // Verify webhook signature
    const webhookSecret = this.configService.get<string>('CLERK_WEBHOOK_SECRET');

    if (webhookSecret && req.rawBody) {
      const isValid = this.verifyWebhookSignature(
        req.rawBody.toString(),
        svixId,
        svixTimestamp,
        svixSignature,
        webhookSecret,
      );

      if (!isValid) {
        this.logger.warn('Invalid webhook signature');
        throw new UnauthorizedException('Invalid webhook signature');
      }
    }

    this.logger.log(`Received Clerk webhook: ${event.type}`);

    try {
      switch (event.type) {
        case 'user.created':
          await this.handleUserCreated(event.data);
          break;
        case 'user.updated':
          await this.handleUserUpdated(event.data);
          break;
        case 'user.deleted':
          await this.handleUserDeleted(event.data);
          break;
        default:
          this.logger.log(`Unhandled webhook event type: ${event.type}`);
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`Error handling webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle user.created event
   * - Check if user signed up via invitation
   * - If yes, create user record and update Clerk metadata
   * - If no, they'll be in "setup pending" state
   */
  private async handleUserCreated(data: ClerkWebhookEvent['data']) {
    const clerkUserId = data.id;
    const email = data.email_addresses?.[0]?.email_address;

    if (!email) {
      this.logger.warn(`No email found for Clerk user ${clerkUserId}`);
      return;
    }

    this.logger.log(`Processing user.created for ${email}`);

    // Check if this user already exists (shouldn't happen but be safe)
    const existingUser = await this.prisma.user.findFirst({
      where: { clerkUserId },
    });

    if (existingUser) {
      this.logger.log(`User already exists for Clerk ID ${clerkUserId}`);
      return;
    }

    // Check if there's a pending invitation for this email
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        email,
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
    });

    if (invitation) {
      // User signed up via invitation - create user record
      this.logger.log(`Found invitation for ${email}, creating user...`);

      try {
        const result = await this.invitationsService.accept(invitation.token, clerkUserId);

        // Update Clerk user metadata with role and tenantId
        await this.updateClerkUserMetadata(clerkUserId, {
          role: invitation.role,
          tenantId: invitation.tenantId,
        });

        this.logger.log(`User created successfully: ${result.user.id}`);
      } catch (error) {
        this.logger.error(`Error accepting invitation: ${error.message}`);
        throw error;
      }
    } else {
      // No invitation found - user signed up directly
      // They'll be stuck in "setup pending" state until an admin assigns them
      this.logger.log(`No invitation found for ${email}, user will be in setup-pending state`);
    }
  }

  /**
   * Handle user.updated event
   * - Sync profile changes to database
   */
  private async handleUserUpdated(data: ClerkWebhookEvent['data']) {
    const clerkUserId = data.id;

    const user = await this.prisma.user.findFirst({
      where: { clerkUserId },
    });

    if (!user) {
      this.logger.log(`No user found for Clerk ID ${clerkUserId}`);
      return;
    }

    // Update user name if changed
    const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ');
    if (fullName && fullName !== user.name) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { name: fullName },
      });
      this.logger.log(`Updated user name for ${user.id}`);
    }
  }

  /**
   * Handle user.deleted event
   * - Mark user as inactive in database
   */
  private async handleUserDeleted(data: ClerkWebhookEvent['data']) {
    const clerkUserId = data.id;

    const user = await this.prisma.user.findFirst({
      where: { clerkUserId },
    });

    if (!user) {
      this.logger.log(`No user found for deleted Clerk ID ${clerkUserId}`);
      return;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { status: 'inactive' },
    });

    this.logger.log(`Marked user ${user.id} as inactive`);
  }

  /**
   * Verify Svix webhook signature
   */
  private verifyWebhookSignature(
    payload: string,
    svixId: string,
    svixTimestamp: string,
    svixSignature: string,
    secret: string,
  ): boolean {
    try {
      const signedPayload = `${svixId}.${svixTimestamp}.${payload}`;
      const secretBytes = Buffer.from(secret.split('_')[1], 'base64');
      const expectedSignature = crypto
        .createHmac('sha256', secretBytes)
        .update(signedPayload)
        .digest('base64');

      // svixSignature format: "v1,signature1 v1,signature2 ..."
      const signatures = svixSignature.split(' ').map((s) => s.split(',')[1]);
      return signatures.some((sig) => sig === expectedSignature);
    } catch (error) {
      this.logger.error(`Signature verification error: ${error.message}`);
      return false;
    }
  }

  /**
   * Update Clerk user metadata via Clerk API
   * This sets the role and tenantId in Clerk so the frontend can access it
   */
  private async updateClerkUserMetadata(
    clerkUserId: string,
    metadata: { role: string; tenantId: string },
  ): Promise<void> {
    const clerkSecretKey = this.configService.get<string>('CLERK_SECRET_KEY');

    if (!clerkSecretKey) {
      this.logger.warn('CLERK_SECRET_KEY not configured, skipping metadata update');
      return;
    }

    try {
      const response = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${clerkSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_metadata: {
            role: metadata.role,
            tenantId: metadata.tenantId,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Clerk API error: ${error}`);
      }

      this.logger.log(`Updated Clerk metadata for user ${clerkUserId}`);
    } catch (error) {
      this.logger.error(`Failed to update Clerk metadata: ${error.message}`);
      // Don't throw - the user is still created, they just need manual metadata setup
    }
  }
}
