"use client";

import { useMemo } from "react";
import { useAuth } from "./auth-context";
import {
  UserRole,
  UserRoleType,
  ResourceType,
  ActionType,
  hasPermission,
  canAccessResource,
  isRoleHigherOrEqual,
  getPermissionScope,
  ROLE_DISPLAY_NAMES,
  ROLE_COLORS,
} from "./roles";

interface UserPermissions {
  role: UserRoleType;
  tenantId: string | null;
  departmentId: string | null;
}

/**
 * Hook to get current user's role and permissions
 */
export function useRolePermissions() {
  const { user, isLoading } = useAuth();

  const permissions = useMemo<UserPermissions | null>(() => {
    if (isLoading || !user) return null;

    return {
      role: (user.role as UserRoleType) || UserRole.STUDENT,
      tenantId: user.tenantId || null,
      departmentId: null, // Will be loaded from API if needed
    };
  }, [user, isLoading]);

  return {
    isLoaded: !isLoading,
    permissions,
    role: permissions?.role || null,
    tenantId: permissions?.tenantId || null,
    departmentId: permissions?.departmentId || null,
    roleName: permissions?.role ? ROLE_DISPLAY_NAMES[permissions.role] : null,
    roleColor: permissions?.role ? ROLE_COLORS[permissions.role] : null,
  };
}

/**
 * Hook to check if user has permission for a specific action on a resource
 */
export function usePermission(resource: ResourceType, action: ActionType) {
  const { role } = useRolePermissions();

  return useMemo(() => {
    if (!role) return false;
    return hasPermission(role, resource, action);
  }, [role, resource, action]);
}

/**
 * Hook to check if user can access a resource (any action)
 */
export function useCanAccess(resource: ResourceType) {
  const { role } = useRolePermissions();

  return useMemo(() => {
    if (!role) return false;
    return canAccessResource(role, resource);
  }, [role, resource]);
}

/**
 * Hook to check if user's role meets minimum required role
 */
export function useRequiredRole(requiredRole: UserRoleType) {
  const { role } = useRolePermissions();

  return useMemo(() => {
    if (!role) return false;
    return isRoleHigherOrEqual(role, requiredRole);
  }, [role, requiredRole]);
}

/**
 * Hook to get permission scope for a resource
 */
export function usePermissionScope(resource: ResourceType) {
  const { role } = useRolePermissions();

  return useMemo(() => {
    if (!role) return null;
    return getPermissionScope(role, resource);
  }, [role, resource]);
}

/**
 * Hook to check multiple permissions at once
 */
export function usePermissions(
  checks: Array<{ resource: ResourceType; action: ActionType }>
) {
  const { role } = useRolePermissions();

  return useMemo(() => {
    if (!role) return checks.map(() => false);
    return checks.map(({ resource, action }) =>
      hasPermission(role, resource, action)
    );
  }, [role, checks]);
}
