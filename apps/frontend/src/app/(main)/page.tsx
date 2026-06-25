import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthUser, getUserProfile } from "@/lib/auth";

/**
 * Root route for authenticated users.
 *
 * Redirects to the appropriate dashboard based on user role:
 * - translators → /translations
 * - everyone else → /documents
 *
 * Role is read from profiles (source of truth for RBAC).
 */
export default async function MainPage() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const user = await getAuthUser(supabase);
  const profile = await getUserProfile(supabase, user.id);
  const role = profile.role;

  if (role === "translator") {
    redirect("/translations");
  }

  redirect("/documents");
}
