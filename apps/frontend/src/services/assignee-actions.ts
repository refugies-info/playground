"use server";

import { logger, TYPE_ASSIGNMENT } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { recordActivity } from "@playground/workflows";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";

export async function updateAssigneeAction(
  workflowId: string,
  profileId: string | null,
): Promise<{ success: boolean; error?: string }> {
  const [currentUser, cookieStore] = await Promise.all([
    getCurrentUser(),
    cookies(),
  ]);

  if (!["admin", "editor"].includes(currentUser.role || "")) {
    return { success: false, error: "Permissions insuffisantes" };
  }

  const supabase = createSupabaseServerClient(cookieStore);

  const { error } = await supabase
    .from("workflows")
    .update({ assignee_id: profileId })
    .eq("id", workflowId);

  if (error) {
    logger.error(error, "Error updating assignee");
    return { success: false, error: error.message };
  }

  await recordActivity({
    action: TYPE_ASSIGNMENT,
    authorId: currentUser.id,
    targetProfileId: profileId,
    workflowId,
  });

  return { success: true };
}
