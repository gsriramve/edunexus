/**
 * EduNexus Role-Based Access Control (RBAC) System
 * 8 User Roles with hierarchical permissions
 */

// User roles in hierarchical order (highest to lowest)
export const UserRole = {
  PLATFORM_OWNER: "platform_owner",
  PRINCIPAL: "principal",
  HOD: "hod",
  ADMIN_STAFF: "admin_staff",
  TEACHER: "teacher",
  LAB_ASSISTANT: "lab_assistant",
  STUDENT: "student",
  PARENT: "parent",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// Role hierarchy levels (higher number = more permissions)
export const ROLE_HIERARCHY: Record<UserRoleType, number> = {
  [UserRole.PLATFORM_OWNER]: 100,
  [UserRole.PRINCIPAL]: 90,
  [UserRole.HOD]: 80,
  [UserRole.ADMIN_STAFF]: 70,
  [UserRole.TEACHER]: 60,
  [UserRole.LAB_ASSISTANT]: 50,
  [UserRole.STUDENT]: 20,
  [UserRole.PARENT]: 10,
};

// Resources that can be accessed
export const Resource = {
  // Platform level
  TENANTS: "tenants",
  PLATFORM_ANALYTICS: "platform_analytics",
  BILLING: "billing",

  // College level
  DEPARTMENTS: "departments",
  STAFF: "staff",
  STUDENTS: "students",
  PARENTS: "parents",

  // Academic
  COURSES: "courses",
  SUBJECTS: "subjects",
  ATTENDANCE: "attendance",
  EXAMS: "exams",
  RESULTS: "results",
  ASSIGNMENTS: "assignments",

  // Operations
  FEES: "fees",
  TRANSPORT: "transport",
  HOSTEL: "hostel",
  LIBRARY: "library",

  // AI Features
  PREDICTIONS: "predictions",
  PRACTICE_ZONE: "practice_zone",
  CAREER_HUB: "career_hub",

  // Communication
  ANNOUNCEMENTS: "announcements",
  MESSAGES: "messages",
  NOTIFICATIONS: "notifications",

  // Reports
  REPORTS: "reports",
  ANALYTICS: "analytics",
} as const;

export type ResourceType = (typeof Resource)[keyof typeof Resource];

// Actions that can be performed
export const Action = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage", // Full access (create, read, update, delete)
} as const;

export type ActionType = (typeof Action)[keyof typeof Action];

// Permission definition
export interface Permission {
  resource: ResourceType;
  actions: ActionType[];
  scope?: "own" | "department" | "college" | "platform"; // Scope of access
}

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<UserRoleType, Permission[]> = {
  [UserRole.PLATFORM_OWNER]: [
    { resource: Resource.TENANTS, actions: [Action.MANAGE], scope: "platform" },
    { resource: Resource.PLATFORM_ANALYTICS, actions: [Action.READ], scope: "platform" },
    { resource: Resource.BILLING, actions: [Action.MANAGE], scope: "platform" },
    // Platform owner can access everything
    ...Object.values(Resource).map((r) => ({
      resource: r,
      actions: [Action.MANAGE] as ActionType[],
      scope: "platform" as const,
    })),
  ],

  [UserRole.PRINCIPAL]: [
    { resource: Resource.DEPARTMENTS, actions: [Action.MANAGE], scope: "college" },
    { resource: Resource.STAFF, actions: [Action.MANAGE], scope: "college" },
    { resource: Resource.STUDENTS, actions: [Action.MANAGE], scope: "college" },
    { resource: Resource.COURSES, actions: [Action.MANAGE], scope: "college" },
    { resource: Resource.FEES, actions: [Action.MANAGE], scope: "college" },
    { resource: Resource.REPORTS, actions: [Action.READ], scope: "college" },
    { resource: Resource.ANALYTICS, actions: [Action.READ], scope: "college" },
    { resource: Resource.ANNOUNCEMENTS, actions: [Action.MANAGE], scope: "college" },
    { resource: Resource.EXAMS, actions: [Action.MANAGE], scope: "college" },
    { resource: Resource.RESULTS, actions: [Action.READ], scope: "college" },
    { resource: Resource.TRANSPORT, actions: [Action.MANAGE], scope: "college" },
    { resource: Resource.HOSTEL, actions: [Action.MANAGE], scope: "college" },
    { resource: Resource.LIBRARY, actions: [Action.MANAGE], scope: "college" },
  ],

  [UserRole.HOD]: [
    { resource: Resource.STAFF, actions: [Action.READ, Action.UPDATE], scope: "department" },
    { resource: Resource.STUDENTS, actions: [Action.READ, Action.UPDATE], scope: "department" },
    { resource: Resource.SUBJECTS, actions: [Action.MANAGE], scope: "department" },
    { resource: Resource.ATTENDANCE, actions: [Action.READ], scope: "department" },
    { resource: Resource.EXAMS, actions: [Action.MANAGE], scope: "department" },
    { resource: Resource.RESULTS, actions: [Action.READ], scope: "department" },
    { resource: Resource.REPORTS, actions: [Action.READ], scope: "department" },
    { resource: Resource.ANNOUNCEMENTS, actions: [Action.CREATE, Action.READ], scope: "department" },
  ],

  [UserRole.ADMIN_STAFF]: [
    { resource: Resource.STUDENTS, actions: [Action.MANAGE], scope: "college" },
    { resource: Resource.FEES, actions: [Action.MANAGE], scope: "college" },
    { resource: Resource.TRANSPORT, actions: [Action.MANAGE], scope: "college" },
    { resource: Resource.HOSTEL, actions: [Action.MANAGE], scope: "college" },
    { resource: Resource.LIBRARY, actions: [Action.MANAGE], scope: "college" },
    { resource: Resource.ANNOUNCEMENTS, actions: [Action.CREATE, Action.READ], scope: "college" },
    { resource: Resource.REPORTS, actions: [Action.READ], scope: "college" },
  ],

  [UserRole.TEACHER]: [
    { resource: Resource.STUDENTS, actions: [Action.READ], scope: "own" }, // Own subjects/classes
    { resource: Resource.ATTENDANCE, actions: [Action.CREATE, Action.READ, Action.UPDATE], scope: "own" },
    { resource: Resource.ASSIGNMENTS, actions: [Action.MANAGE], scope: "own" },
    { resource: Resource.EXAMS, actions: [Action.READ], scope: "own" },
    { resource: Resource.RESULTS, actions: [Action.CREATE, Action.READ, Action.UPDATE], scope: "own" },
    { resource: Resource.MESSAGES, actions: [Action.CREATE, Action.READ], scope: "own" },
    { resource: Resource.REPORTS, actions: [Action.READ], scope: "own" },
  ],

  [UserRole.LAB_ASSISTANT]: [
    { resource: Resource.STUDENTS, actions: [Action.READ], scope: "own" }, // Assigned labs
    { resource: Resource.ATTENDANCE, actions: [Action.CREATE, Action.READ, Action.UPDATE], scope: "own" },
    { resource: Resource.RESULTS, actions: [Action.CREATE, Action.READ], scope: "own" }, // Practical marks
  ],

  [UserRole.STUDENT]: [
    { resource: Resource.ATTENDANCE, actions: [Action.READ], scope: "own" },
    { resource: Resource.EXAMS, actions: [Action.READ], scope: "own" },
    { resource: Resource.RESULTS, actions: [Action.READ], scope: "own" },
    { resource: Resource.FEES, actions: [Action.READ], scope: "own" },
    { resource: Resource.ASSIGNMENTS, actions: [Action.READ], scope: "own" },
    { resource: Resource.PRACTICE_ZONE, actions: [Action.READ], scope: "own" },
    { resource: Resource.CAREER_HUB, actions: [Action.READ], scope: "own" },
    { resource: Resource.PREDICTIONS, actions: [Action.READ], scope: "own" },
    { resource: Resource.LIBRARY, actions: [Action.READ], scope: "own" },
    { resource: Resource.TRANSPORT, actions: [Action.READ], scope: "own" },
    { resource: Resource.HOSTEL, actions: [Action.READ], scope: "own" },
    { resource: Resource.MESSAGES, actions: [Action.CREATE, Action.READ], scope: "own" },
    { resource: Resource.NOTIFICATIONS, actions: [Action.READ], scope: "own" },
  ],

  [UserRole.PARENT]: [
    { resource: Resource.ATTENDANCE, actions: [Action.READ], scope: "own" }, // Child's data
    { resource: Resource.RESULTS, actions: [Action.READ], scope: "own" },
    { resource: Resource.FEES, actions: [Action.READ], scope: "own" },
    { resource: Resource.TRANSPORT, actions: [Action.READ], scope: "own" },
    { resource: Resource.MESSAGES, actions: [Action.CREATE, Action.READ], scope: "own" },
    { resource: Resource.NOTIFICATIONS, actions: [Action.READ], scope: "own" },
    { resource: Resource.PREDICTIONS, actions: [Action.READ], scope: "own" },
  ],
};

// Helper functions
export function hasPermission(
  userRole: UserRoleType,
  resource: ResourceType,
  action: ActionType
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions.some(
    (p) =>
      p.resource === resource &&
      (p.actions.includes(action) || p.actions.includes(Action.MANAGE))
  );
}

export function canAccessResource(
  userRole: UserRoleType,
  resource: ResourceType
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions.some((p) => p.resource === resource);
}

export function getRoleLevel(role: UserRoleType): number {
  return ROLE_HIERARCHY[role] || 0;
}

export function isRoleHigherOrEqual(
  userRole: UserRoleType,
  requiredRole: UserRoleType
): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}

export function getPermissionScope(
  userRole: UserRoleType,
  resource: ResourceType
): "own" | "department" | "college" | "platform" | null {
  const permissions = ROLE_PERMISSIONS[userRole];
  const permission = permissions.find((p) => p.resource === resource);
  return permission?.scope || null;
}

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRoleType, string> = {
  [UserRole.PLATFORM_OWNER]: "Platform Owner",
  [UserRole.PRINCIPAL]: "Principal",
  [UserRole.HOD]: "Head of Department",
  [UserRole.ADMIN_STAFF]: "Admin Staff",
  [UserRole.TEACHER]: "Teacher",
  [UserRole.LAB_ASSISTANT]: "Lab Assistant",
  [UserRole.STUDENT]: "Student",
  [UserRole.PARENT]: "Parent",
};

// Role colors for UI
export const ROLE_COLORS: Record<UserRoleType, string> = {
  [UserRole.PLATFORM_OWNER]: "bg-purple-500",
  [UserRole.PRINCIPAL]: "bg-red-500",
  [UserRole.HOD]: "bg-orange-500",
  [UserRole.ADMIN_STAFF]: "bg-blue-500",
  [UserRole.TEACHER]: "bg-green-500",
  [UserRole.LAB_ASSISTANT]: "bg-teal-500",
  [UserRole.STUDENT]: "bg-indigo-500",
  [UserRole.PARENT]: "bg-pink-500",
};
