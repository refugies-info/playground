/**
 * User Roles
 * The roles a BOMO account can hold. Single source of truth for both the
 * runtime list (queries, validation) and the derived union type.
 */

export const USER_ROLES = [
  "admin",
  "editor",
  "translator",
  "business",
] as const;

/** Union of all valid user roles. */
export type UserRole = (typeof USER_ROLES)[number];

export const isAdmin = (role: string | null | undefined): boolean =>
  role === "admin";

export const canManageWidgets = (role: string | null | undefined): boolean =>
  isAdmin(role) || role === "business";
