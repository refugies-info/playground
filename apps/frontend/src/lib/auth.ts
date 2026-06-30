import type { Database } from "@playground/supabase";
import { createSupabaseServerClient } from "@playground/supabase";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isConnectionError } from "./errors";

export interface CurrentUser {
  id: string;
  email: string | null;
  role: string | null;
  language: string | null;
  username: string | null;
}

/**
 * The single entry point for auth in server components and server actions.
 *
 * Creates the Supabase client, authenticates the user, and fetches their
 * profile in one cached call — deduplicated across all callers in the same
 * server request (layout + page + actions all share the same result).
 *
 * Redirects to /service-unavailable if Supabase is unreachable,
 * or to /login if there is no active session.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const user = await getAuthUser(supabase);

  const { data, error } = await supabase
    .from("profiles")
    .select("role, language, username")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    redirect("/service-unavailable");
  }

  return {
    id: user.id,
    email: user.email ?? null,
    role: data.role,
    language: data.language,
    username: data.username,
  };
});

const getAuthUser = cache(
  async (supabase: SupabaseClient<Database>): Promise<User> => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error && isConnectionError(error)) {
      redirect("/service-unavailable");
    }

    if (!user) {
      redirect("/login");
    }

    return user;
  },
);
