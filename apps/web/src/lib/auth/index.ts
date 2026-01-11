export { AuthProvider, useAuth, useUser, useRole } from './auth-context';
export type { User } from './auth-context';
export {
  useRolePermissions,
  usePermission,
  useCanAccess,
  useRequiredRole,
  usePermissionScope,
  usePermissions,
} from './hooks';
export { UserRole, ROLE_DISPLAY_NAMES, ROLE_COLORS } from './roles';
export type { UserRoleType } from './roles';
