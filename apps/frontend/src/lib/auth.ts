import type { Database } from "@playground/supabase";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

/**
 * Detects whether a Supabase AuthError is caused by a network/connection failure
 * (e.g. Supabase not running locally, or database unreachable in production).
 *
 * The Supabase SDK never throws on network errors — it catches them and returns
 * { data: { user: null }, error: AuthError }. We inspect the error message to
 * distinguish a "DB down" scenario from a normal "not authenticated" scenario.
 */
function isConnectionError(error: unknown): boolean {
  if (!error) return false;
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error);

  return (
    msg.includes("fetch failed") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("Failed to fetch") ||
    msg.includes("network error")
  );
}

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
