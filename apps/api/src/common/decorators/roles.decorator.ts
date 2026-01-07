import { SetMetadata } from '@nestjs/common';

/**
 * Valid user roles in the system
 */
export type UserRole =
  | 'platform_owner'
  | 'principal'
  | 'hod'
  | 'admin_staff'
  | 'teacher'
  | 'lab_assistant'
  | 'student'
  | 'parent';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles can access an endpoint
 *
 * Usage:
 * @Roles('principal', 'admin_staff')
 * @UseGuards(RolesGuard)
 * async createUser() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Role hierarchy - higher roles can access lower role endpoints
 * This is used by RolesGuard to allow platform_owner to access all routes
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  platform_owner: 100,
  principal: 90,
  hod: 70,
  admin_staff: 60,
  teacher: 50,
  lab_assistant: 40,
  student: 20,
  parent: 10,
};

/**
 * Check if a role has higher or equal privilege than another
 */
export function hasEqualOrHigherRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
