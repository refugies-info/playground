"use server";

import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";

export async function updateAssigneeAction(
  workflowId: string,
  profileId: string | null,
): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Non autorisé" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    !["admin", "editor"].includes(profile.role || "")
  ) {
    return { success: false, error: "Permissions insuffisantes" };
  }

  const { error } = await supabase
    .from("workflows")
    .update({ assignee_id: profileId })
    .eq("id", workflowId);

  if (error) {
    logger.error(error, "Error updating assignee");
    return { success: false, error: error.message };
  }
  return { success: true };
}
