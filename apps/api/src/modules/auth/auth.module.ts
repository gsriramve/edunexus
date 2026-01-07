import { Module } from '@nestjs/common';
import { ClerkWebhookController } from './clerk-webhook.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { InvitationsModule } from '../invitations/invitations.module';

@Module({
  imports: [InvitationsModule],
  controllers: [ClerkWebhookController],
  providers: [PrismaService],
})
export class AuthModule {}
