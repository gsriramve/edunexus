"use client";

// TEMPORARY: Mock auth hooks for local testing without Clerk
// TODO: Re-enable Clerk integration when valid keys are available
// import { useUser } from "@clerk/nextjs";
import { useMemo } from "react";
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
 * TEMPORARY: Returns mock admin_staff role for testing
 */
export function useRole() {
  // Mock user for testing - returns admin_staff role
  const mockPermissions: UserPermissions = {
    role: UserRole.ADMIN_STAFF,
    tenantId: "tenant-1",
    departmentId: null,
  };

  return {
    isLoaded: true,
    permissions: mockPermissions,
    role: mockPermissions.role,
    tenantId: mockPermissions.tenantId,
    departmentId: mockPermissions.departmentId,
    roleName: ROLE_DISPLAY_NAMES[mockPermissions.role],
    roleColor: ROLE_COLORS[mockPermissions.role],
  };
}

/*
// Original Clerk-based useRole - uncomment when Clerk is configured
export function useRole() {
  const { user, isLoaded } = useUser();

  const permissions = useMemo<UserPermissions | null>(() => {
    if (!isLoaded || !user) return null;

    // Get role from Clerk's public metadata
    const metadata = user.publicMetadata as {
      role?: UserRoleType;
      tenantId?: string;
      departmentId?: string;
    };

    return {
      role: metadata.role || UserRole.STUDENT,
      tenantId: metadata.tenantId || null,
      departmentId: metadata.departmentId || null,
    };
  }, [user, isLoaded]);

  return {
    isLoaded,
    permissions,
    role: permissions?.role || null,
    tenantId: permissions?.tenantId || null,
    departmentId: permissions?.departmentId || null,
    roleName: permissions?.role ? ROLE_DISPLAY_NAMES[permissions.role] : null,
    roleColor: permissions?.role ? ROLE_COLORS[permissions.role] : null,
  };
}
*/

/**
 * Hook to check if user has permission for a specific action on a resource
 */
export function usePermission(resource: ResourceType, action: ActionType) {
  const { role } = useRole();

  return useMemo(() => {
    if (!role) return false;
    return hasPermission(role, resource, action);
  }, [role, resource, action]);
}

/**
 * Hook to check if user can access a resource (any action)
 */
export function useCanAccess(resource: ResourceType) {
  const { role } = useRole();

  return useMemo(() => {
    if (!role) return false;
    return canAccessResource(role, resource);
  }, [role, resource]);
}

/**
 * Hook to check if user's role meets minimum required role
 */
export function useRequiredRole(requiredRole: UserRoleType) {
  const { role } = useRole();

  return useMemo(() => {
    if (!role) return false;
    return isRoleHigherOrEqual(role, requiredRole);
  }, [role, requiredRole]);
}

/**
 * Hook to get permission scope for a resource
 */
export function usePermissionScope(resource: ResourceType) {
  const { role } = useRole();

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
  const { role } = useRole();

  return useMemo(() => {
    if (!role) return checks.map(() => false);
    return checks.map(({ resource, action }) =>
      hasPermission(role, resource, action)
    );
  }, [role, checks]);
}
