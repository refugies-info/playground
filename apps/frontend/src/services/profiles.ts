"use server";

import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import {
  type AdminProfile,
  displayName,
  type Profile,
} from "@/lib/profile-name";

export async function getAllProfilesForAdmin(): Promise<AdminProfile[]> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, username, role, language, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    logger.error(error, "Error fetching profiles for admin");
    return [];
  }

  return (data ?? []).map((p) => ({
    id: p.id,
    email: p.email ?? "",
    username: p.username ?? null,
    role: p.role ?? null,
    language: p.language ?? null,
    created_at: p.created_at ?? null,
  }));
}

export async function getProfilesByRoles(roles?: string[]): Promise<Profile[]> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  let query = supabase
    .from("profiles")
    .select("id, email, first_name, last_name, username")
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

  return (data ?? [])
    .filter(
      (p): p is typeof p & { id: string; email: string } => !!p.id && !!p.email,
    )
    .map((p) => ({
      id: p.id,
      email: p.email,
      displayName: displayName(p) ?? p.email,
    }));
}
