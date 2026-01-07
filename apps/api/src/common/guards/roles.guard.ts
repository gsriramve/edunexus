import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, UserRole, hasEqualOrHigherRole } from '../decorators/roles.decorator';

/**
 * Guard that checks if the user has the required role(s) to access an endpoint
 *
 * The role is expected to be passed via the 'x-user-role' header, which should
 * be set by the frontend based on Clerk authentication metadata.
 *
 * Usage:
 * @UseGuards(RolesGuard)
 * @Roles('principal', 'admin_staff')
 * async createUser() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the required roles from the @Roles decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are specified, allow access (public endpoint)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Get user role from request headers
    const userRole = request.headers['x-user-role'] as UserRole;

    // If no role is provided, deny access
    if (!userRole) {
      throw new UnauthorizedException('User role not provided. Please sign in.');
    }

    // Check if user's role is in the required roles list
    const hasRole = requiredRoles.some((role) => {
      // Direct match
      if (userRole === role) {
        return true;
      }
      // Check hierarchy - platform_owner can access everything
      return hasEqualOrHigherRole(userRole, role);
    });

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. Your role: ${userRole}`,
      );
    }

    return true;
  }
}
