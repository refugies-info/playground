"use server";

import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";

export async function updateAssigneeAction(
  editorialRecordId: string,
  profileId: string | null,
): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { error } = await supabase
    .from("editorial_records")
    .update({ assignee_id: profileId })
    .eq("id", editorialRecordId);

  if (error) {
    logger.error(error, "Error updating assignee");
    return { success: false, error: error.message };
  }
  return { success: true };
}
