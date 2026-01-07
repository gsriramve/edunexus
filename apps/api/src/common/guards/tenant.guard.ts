import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '../decorators/roles.decorator';

/**
 * Guard that ensures tenant isolation
 *
 * - Platform owners don't need a tenant ID (they manage all tenants)
 * - All other users MUST have a tenant ID that matches their assigned tenant
 *
 * The tenant ID is expected via the 'x-tenant-id' header.
 * The user's assigned tenant is expected via the 'x-user-tenant-id' header.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const userRole = request.headers['x-user-role'] as UserRole;
    const requestedTenantId = request.headers['x-tenant-id'] as string;
    const userTenantId = request.headers['x-user-tenant-id'] as string;

    // If no role, deny access
    if (!userRole) {
      throw new UnauthorizedException('User role not provided.');
    }

    // Platform owners don't need tenant validation
    // They can access tenant management endpoints without x-tenant-id
    if (userRole === 'platform_owner') {
      return true;
    }

    // All other users MUST have a tenant ID
    if (!requestedTenantId) {
      throw new ForbiddenException('Tenant ID is required for this operation.');
    }

    // User's assigned tenant must match the requested tenant
    if (!userTenantId) {
      throw new ForbiddenException('User is not assigned to any tenant.');
    }

    if (requestedTenantId !== userTenantId) {
      throw new ForbiddenException('Access denied. You can only access your own tenant\'s data.');
    }

    return true;
  }
}
