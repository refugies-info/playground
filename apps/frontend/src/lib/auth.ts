import type { Database } from "@playground/supabase";
import { createSupabaseServerClient } from "@playground/supabase";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isConnectionError } from "./errors";
import { mapProfileDto, type Profile } from "./profile";

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
export const getCurrentUser = cache(async (): Promise<Profile> => {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const user = await getAuthUser(supabase);

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "role, language, username, first_name, last_name, created_at, avatar_url",
    )
    .eq("id", user.id)
    .single();

  if (error || !data) {
    redirect("/service-unavailable");
  }
  const currentUser = {
    id: user.id,
    email: user.email as string,
    role: data.role as Profile["role"],
    language: data.language,
    username: data.username,
    firstName: data.first_name,
    lastName: data.last_name,
    avatar_url: data.avatar_url,
    createdAt: data.created_at,
  };

  return mapProfileDto(currentUser);
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
