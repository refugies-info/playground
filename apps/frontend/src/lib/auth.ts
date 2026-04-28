import type { Database } from "@playground/supabase";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isConnectionError } from "./errors";

/**
 * Fetches the authenticated user's profile (role, language) from public.profiles.
 *
 * Use this in server components and server actions instead of reading
 * user.app_metadata or user.user_metadata — profiles is the single source of
 * truth for authorization data (role, language).
 *
 * Wrapped in React.cache() to deduplicate within the same server request:
 * layout.tsx and page.tsx both call getUserProfile() but only one DB query runs.
 */
export const getUserProfile = cache(
  async (
    supabase: SupabaseClient<Database>,
    userId: string,
  ): Promise<{ role: string | null; language: string | null } | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("role, language")
      .eq("id", userId)
      .single();

    if (error) return null;
    return data;
  },
);

/**
 * Server-side helper to get the authenticated user.
 *
 * - If Supabase is unreachable → redirects to /service-unavailable (never returns)
 * - If no session → returns null (caller handles redirect to /login)
 * - If authenticated → returns the User object
 *
 * Wrapped in React.cache() to deduplicate within the same server request:
 * (main)/layout.tsx et documents/[id]/layout.tsx s'exécutent tous les deux
 * pour les pages éditeur — un seul appel Supabase est effectué.
 *
 * Usage:
 * ```ts
 * const user = await getAuthUser(supabase);
 * if (!user) redirect("/login");
 * ```
 */
export const getAuthUser = cache(
  async (supabase: SupabaseClient<Database>): Promise<User | null> => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error && isConnectionError(error)) {
      redirect("/service-unavailable");
    }

    return user;
  },
);
