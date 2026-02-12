import { logger } from "@playground/shared-types";
import type { StepResult } from "../../types";
import { getSupabaseClient } from "../common/supabase";

/**
 * Updates the work_status of a translation record.
 *
 * @param editorialRecordId - The ID of the editorial record
 * @param language - The target language
 * @param status - The new status to set
 * @returns Result of the update
 */
export async function updateTranslationStatusStep(
  editorialRecordId: string,
  language: string,
  status: "pending" | "to_process" | "error" | "draft",
): Promise<StepResult<{ success: boolean }>> {
  "use step";

  try {
    const supabase = getSupabaseClient();

    // Find the record
    const { data: record, error: findError } = await supabase
      .from("translation_records")
      .select("id")
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

    return { success: true, data: { success: true } };
  } catch (error) {
    logger.error(error, "Unexpected error in updateTranslationStatusStep");
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
