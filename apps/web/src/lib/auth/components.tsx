"use client";

import { ReactNode } from "react";
import { usePermission, useRequiredRole, useCanAccess } from "./hooks";
import { ResourceType, ActionType, UserRoleType } from "./roles";

interface PermissionGateProps {
  resource: ResourceType;
  action: ActionType;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on permission
 */
export function PermissionGate({
  resource,
  action,
  children,
  fallback = null,
}: PermissionGateProps) {
  const hasAccess = usePermission(resource, action);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RoleGateProps {
  requiredRole: UserRoleType;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders based on minimum role requirement
 */
export function RoleGate({
  requiredRole,
  children,
  fallback = null,
}: RoleGateProps) {
  const meetsRequirement = useRequiredRole(requiredRole);

  if (!meetsRequirement) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface ResourceGateProps {
  resource: ResourceType;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders based on resource access
 */
export function ResourceGate({
  resource,
  children,
  fallback = null,
}: ResourceGateProps) {
  const canAccess = useCanAccess(resource);

  if (!canAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
