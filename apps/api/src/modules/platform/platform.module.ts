import { Module } from '@nestjs/common';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';
import { InvitationsModule } from '../invitations/invitations.module';

/**
 * Platform Module
 *
 * Handles platform-level operations for Super Admin (Platform Owner):
 * - Tenant management (create, list, activate, suspend)
 * - Trial management (extend, expire)
 * - Principal invitations
 * - Platform audit logs
 *
 * All endpoints in this module require the 'platform_owner' role.
 */
@Module({
  imports: [InvitationsModule],
  controllers: [PlatformController],
  providers: [PlatformService],
  exports: [PlatformService],
})
export class PlatformModule {}
