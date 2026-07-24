export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  language?: string;
  username?: string;
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  createdAt: string | null;
}

export type UserRole = "admin" | "editor" | "translator";

/**
 * A profile whose display name has already been resolved (via {@link displayName}).
 * Single source of truth for the shape passed to UI lists, dropdowns and filters
 * (editors list, assignee dropdown, activity journal, …).
 */
export interface Profile extends CurrentUser {
  displayName?: string;
}

/**
 * Derive a human-readable name from a profile.
 * Priority: "Prénom Nom" > username > email prefix (capitalized).
 * Returns null when nothing usable is available (e.g. system/PapaIA).
 *
 * Single source of truth so names stay consistent across the UI
 * (editors list, activity journal, …).
 */

export const mapProfileDto = (user: any): Profile => ({
  id: user.id,
  email: user.email,
  role: user.role,
  language: user.language,
  username: user.username,
  avatarUrl: user.avatar_url ?? undefined,
  firstName: user.first_name,
  lastName: user.last_name,
  createdAt: user.created_at,
  displayName: displayName({
    email: user.email,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
  }),
});

export function displayName(
  profile:
    | Partial<
        Pick<CurrentUser, "firstName" | "lastName" | "username" | "email">
      >
    | null
    | undefined,
): string | undefined {
  if (!profile) return undefined;
  const first = profile.firstName?.trim();
  const last = profile.lastName?.trim();
  if (first && last) return `${first} ${last}`;
  if (first || last) return (first || last) as string;
  if (profile.username) {
    return profile.username.charAt(0).toUpperCase() + profile.username.slice(1);
  }
  const prefix = (profile.email ?? "").split("@")[0];
  return prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1) : undefined;
}
