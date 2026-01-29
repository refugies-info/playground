"use server";

import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";

export async function saveTranslation(
  id: string,
  markdown: string,
): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  try {
    const { error } = await supabase
      .from("translation_records")
      .update({
        markdown,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      logger.error(error, "Error updating translation record");
      return { success: false, error: "Failed to update translation record" };
    }

    return { success: true };
  } catch (error) {
    logger.error(error, "Unexpected error saving translation");
    return { success: false, error: "Unexpected error occurred" };
  }
}

export async function publishTranslation(
  id: string,
  _markdown: string,
): Promise<{
  success: boolean;
  publishedUrl?: string;
  error?: string;
}> {
  // TODO: Implement actual publication logic (webhook trigger + DB update + status change)
  // For now, we simulate success to trigger the frontend alert
  logger.info({ id }, "Mocking publication for translation");

  return {
    success: true,
  };
}
