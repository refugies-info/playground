"use server";

import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import { mapProfileDto, type Profile } from "@/lib/profile";

export async function getAllProfilesForAdmin(): Promise<Profile[]> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, username, role, language, created_at, first_name, last_name",
    )
    .order("created_at", { ascending: false });

  if (error) {
    logger.error(error, "Error fetching profiles for admin");
    return [];
  }

  return (data ?? []).map((p) => {
    return mapProfileDto(p);
  });
}

export async function getProfilesByRoles(roles?: string[]): Promise<Profile[]> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  let query = supabase
    .from("profiles")
    .select(
      "id, email, username, role, language, created_at, first_name, last_name",
    )
    .not("email", "is", null)
    .order("email");

  if (roles && roles.length > 0) {
    query = query.in("role", roles);
  }

  const { data, error } = await query;

  if (error) {
    logger.error(error, "Error fetching profiles");
    return [];
  }

  return (data ?? []).map((p) => {
    return mapProfileDto(p);
  });
}
