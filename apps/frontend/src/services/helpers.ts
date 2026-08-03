/**
 * Extracts author information from a potentially array or object user_profile relation.
 * Supabase joins can return arrays or single objects depending on relationship definition.
 * Also handles JSONB profile data from views where fields may be optional.
 */
export function extractAuthorProfile(
  userProfile:
    | { email: string; role: string; avatar_url?: string | null }
    | { email: string; role: string; avatar_url?: string | null }[]
    | { email?: string; role?: string; avatar_url?: string | null }
    | null
    | undefined,
): { email: string; role: string; avatarUrl?: string } {
  if (!userProfile) {
    return { email: "", role: "", avatarUrl: "" };
  }

  const profile = Array.isArray(userProfile) ? userProfile[0] : userProfile;

  return {
    email: profile?.email || "",
    role: profile?.role || "",
    avatarUrl: profile?.avatar_url || undefined,
  };
}
