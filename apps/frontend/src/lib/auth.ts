import type { Database } from "@playground/supabase";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { isConnectionError } from "./errors";

/**
 * Server-side helper to get the authenticated user.
 *
 * - If Supabase is unreachable → redirects to /service-unavailable (never returns)
 * - If no session → returns null (caller handles redirect to /login)
 * - If authenticated → returns the User object
 *
 * Usage:
 * ```ts
 * const user = await getAuthUser(supabase);
 * if (!user) redirect("/login");
 * ```
 */
export async function getAuthUser(
  supabase: SupabaseClient<Database>,
): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error && isConnectionError(error)) {
    redirect("/service-unavailable");
  }

  return user;
}
