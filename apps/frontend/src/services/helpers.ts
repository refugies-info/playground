/**
 * Extracts author information from a potentially array or object user_profile relation.
 * Supabase joins can return arrays or single objects depending on relationship definition.
 */
export function extractAuthorProfile(
  userProfile:
    | { email: string; role: string }
    | { email: string; role: string }[]
    | null
    | undefined,
): { email: string; role: string } {
  if (!userProfile) {
    return { email: "", role: "" };
  }

  const profile = Array.isArray(userProfile) ? userProfile[0] : userProfile;

  return {
    email: profile?.email || "",
    role: profile?.role || "",
  };
}
