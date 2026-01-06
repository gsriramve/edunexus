// Role definitions and permissions
export {
  UserRole,
  Resource,
  Action,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  ROLE_DISPLAY_NAMES,
  ROLE_COLORS,
  hasPermission,
  canAccessResource,
  getRoleLevel,
  isRoleHigherOrEqual,
  getPermissionScope,
} from "./roles";

export type {
  UserRoleType,
  ResourceType,
  ActionType,
  Permission,
} from "./roles";

// React hooks
export {
  useRole,
  usePermission,
  useCanAccess,
  useRequiredRole,
  usePermissionScope,
  usePermissions,
} from "./hooks";

// React components
export { PermissionGate, RoleGate, ResourceGate } from "./components";
