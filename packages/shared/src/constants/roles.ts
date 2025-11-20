/**
 * Role Definitions and Permissions
 * Shared constants for role-based access control
 */

/**
 * Available roles in the system
 */
export const ROLES = {
  EDITOR: "editor",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Role permissions matrix
 * Defines what actions each role can perform
 */
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [ROLES.EDITOR]: [
    "content:create",
    "content:read:own",
    "content:update:own",
    "content:delete:own",
    "content:submit_for_review",
    "profile:read:own",
    "profile:update:own",
    "audit_log:read:own",
  ],
  [ROLES.ADMIN]: [
    "user:create",
    "user:read:all",
    "user:update:all",
    "user:delete:all",
    "user:assign_role",
    "user:deactivate",
    "content:read:all",
    "content:update:all",
    "content:delete:all",
    "profile:read:all",
    "profile:update:all",
    "audit_log:read:all",
    "system:manage",
  ],
};

/**
 * Role display names
 */
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  [ROLES.EDITOR]: "Editor",
  [ROLES.ADMIN]: "Administrator",
};

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  [ROLES.EDITOR]: "Can create and edit content, submit for review",
  [ROLES.ADMIN]: "Can manage users, roles, and system settings",
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): string[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role: Role): string {
  return ROLE_DISPLAY_NAMES[role] ?? role;
}

/**
 * Get description for a role
 */
export function getRoleDescription(role: Role): string {
  return ROLE_DESCRIPTIONS[role] ?? "";
}

/**
 * Check if a role is valid
 */
export function isValidRole(role: string): role is Role {
  return Object.values(ROLES).includes(role as Role);
}

/**
 * Get all available roles
 */
export function getAllRoles(): Role[] {
  return Object.values(ROLES);
}
