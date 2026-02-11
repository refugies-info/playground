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
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      logger.error(userError, "Error getting user for translation save");
      return { success: false, error: "Utilisateur non authentifié" };
    }

    const { error } = await supabase
      .from("translation_records")
      .update({
        markdown,
        work_status: "draft",
        author_id: user.id,
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
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  try {
    const { error } = await supabase
      .from("translation_records")
      .update({
        online_status: "published",
        work_status: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      logger.error(error, "Error publishing translation");
      return { success: false, error: "Failed to publish translation" };
    }

    return { success: true };
  } catch (error) {
    logger.error(error, "Unexpected error publishing translation");
    return { success: false, error: "Unexpected error occurred" };
  }
}
