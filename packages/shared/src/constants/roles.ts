/**
 * User Roles
 * The three roles a BOMO account can hold. Single source of truth for both the
 * runtime list (queries, validation) and the derived union type.
 * TODO
 * in apps/frontend/src/lib/profile.ts, packages/ui/.../UserCard.tsx and the
 * z.enum in apps/frontend/src/app/actions/users.ts should all derive from here
 * — separate refactor, deliberately out of this PR's scope.
 */

export const USER_ROLES = ["admin", "editor", "translator"] as const;

/** Union of all valid user roles. */
export type UserRole = (typeof USER_ROLES)[number];
