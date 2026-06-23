/** Minimal profile fields needed to derive a display name. */
export interface NameableProfile {
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  email?: string | null;
}

/**
 * Derive a human-readable name from a profile.
 * Priority: "Prénom Nom" > username > email prefix (capitalized).
 * Returns null when nothing usable is available (e.g. system/PapaIA).
 *
 * Single source of truth so names stay consistent across the UI
 * (editors list, activity journal, …).
 */
export function displayName(
  profile: NameableProfile | null | undefined,
): string | null {
  if (!profile) return null;
  const first = profile.first_name?.trim();
  const last = profile.last_name?.trim();
  if (first && last) return `${first} ${last}`;
  if (first || last) return (first || last) as string;
  if (profile.username) {
    return profile.username.charAt(0).toUpperCase() + profile.username.slice(1);
  }
  const prefix = (profile.email ?? "").split("@")[0];
  return prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1) : null;
}
