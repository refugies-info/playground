import { logger } from "@playground/shared-types";
import type { StepResult } from "../../types";
import { getSupabaseClient } from "../common/supabase";

/**
 * Result of saving a translation.
 */
export interface SaveTranslationResult {
  translationRecordId: string;
}

/**
 * Saves a translation record.
 *
 * This step:
 * 1. Updates the translation record with new markdown content
 * 2. Updates work_status to 'draft'
 * 3. Updates author_id and timestamp
 *
 * @param translationId - The ID of the translation record
 * @param markdown - The new markdown content
 * @param userId - The ID of the user performing the save
 * @returns Result with success status
 */
export async function saveTranslationStep(
  translationId: string,
  markdown: string,
  userId: string,
): Promise<StepResult<SaveTranslationResult>> {
  "use step";

  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from("translation_records")
      .update({
        markdown,
        work_status: "draft",
        author_id: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", translationId);

    if (error) {
      logger.error(error, "Error updating translation record");
      return { success: false, error: "Failed to update translation record" };
    }

    logger.info({ translationId, userId }, "Translation saved successfully");

    return {
      success: true,
      data: {
        translationRecordId: translationId,
      },
    };
  } catch (error) {
    logger.error(error, "Unexpected error in saveTranslationStep");
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
