import { logger, type WorkStatus } from "@playground/shared-types";
import type { StepResult } from "../../types";
import { getSupabaseClient } from "../common/supabase";

type TranslationWorkStatus = WorkStatus | "pending" | "error";

/**
 * Updates the work_status of a translation record.
 *
 * Returns the status the record had *before* this update (RI-1430) — used by
 * the caller to restore it after a regeneration instead of forcing a fixed
 * status, so an in-progress translation isn't silently "unclaimed" just
 * because the AI content behind it was regenerated.
 *
 * @param editorialRecordId - The ID of the editorial record
 * @param language - The target language
 * @param status - The new status to set
 * @returns Result of the update, including the previous status
 */
export async function updateTranslationStatusStep(
  editorialRecordId: string,
  language: string,
  status: TranslationWorkStatus,
): Promise<StepResult<{ success: boolean; previousStatus: string | null }>> {
  "use step";

  try {
    const supabase = getSupabaseClient();

    // Find the record
    const { data: record, error: findError } = await supabase
      .from("translation_records")
      .select("id, work_status")
      .eq("editorial_record_id", editorialRecordId)
      .eq("language", language)
      .single();

    if (findError || !record) {
      logger.warn(
        { editorialRecordId, language },
        "Translation record not found for status update",
      );
      return { success: false, error: "Record not found" };
    }

    // Update status
    const { error: updateError } = await supabase
      .from("translation_records")
      .update({ work_status: status })
      .eq("id", record.id);

    if (updateError) {
      logger.error(updateError, "Error updating translation status");
      return { success: false, error: "Update failed" };
    }

    return {
      success: true,
      data: { success: true, previousStatus: record.work_status },
    };
  } catch (error) {
    logger.error(error, "Unexpected error in updateTranslationStatusStep");
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
