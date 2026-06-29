import {
  LANGUAGES,
  logger,
  TYPE_TRANSLATION_PRIORITY,
} from "@playground/shared-types";
import type { StepResult } from "../../types";
import { recordActivity } from "../common/activity-log";
import { getSupabaseClient } from "../common/supabase";

/**
 * Result of creating translation records.
 */
export interface CreateTranslationRecordsResult {
  created: number;
  languages: string[];
}

/**
 * Creates missing translation records for a published document.
 *
 * This step:
 * 1. Gets existing translation records for the editorial record
 * 2. Determines which languages are missing (excluding 'fr')
 * 3. Creates translation records for missing languages
 *
 * @param editorialRecordId - The editorial record to create translations for
 * @param workflowId - The workflow ID to associate with translations
 * @param isUrgent - Whether translations should be marked as urgent (priority = 'urgent')
 * @returns Result with count of created records and languages
 */
export async function createTranslationRecordsStep(
  editorialRecordId: string,
  workflowId: string,
  isUrgent = false,
): Promise<StepResult<CreateTranslationRecordsResult>> {
  "use step";

  try {
    const supabase = getSupabaseClient();

    // 1. Get existing translation records for this editorial record
    const { data: existingTranslations, error: fetchError } = await supabase
      .from("translation_records")
      .select("language")
      .eq("editorial_record_id", editorialRecordId);

    if (fetchError) {
      logger.error(fetchError, "Error fetching existing translations");
      return { success: false, error: "Failed to fetch existing translations" };
    }

    const existingLanguages = new Set(
      existingTranslations?.map((t) => t.language) || [],
    );

    const priority = isUrgent ? "urgent" : null;

    // 2. Update priority on all existing records (covers re-publication with no new languages)
    if (existingTranslations && existingTranslations.length > 0) {
      const { error: updateError } = await supabase
        .from("translation_records")
        .update({ priority })
        .eq("editorial_record_id", editorialRecordId);

      if (updateError) {
        logger.error(
          updateError,
          "Error updating priority on existing translation records",
        );
      } else if (isUrgent) {
        await recordActivity({
          action: TYPE_TRANSLATION_PRIORITY,
          workflowId,
        });
      }
    }

    // 3. Determine which languages are missing (exclude 'fr' - source language)
    const targetLanguages = LANGUAGES.filter(
      (lang) => !existingLanguages.has(lang.code) && lang.code !== "fr",
    );

    if (targetLanguages.length === 0) {
      logger.info(
        { editorialRecordId },
        "All translation records already exist",
      );
      return {
        success: true,
        data: { created: 0, languages: [] },
      };
    }

    // 4. Create missing translation records
    const newRecords = targetLanguages.map((lang) => ({
      editorial_record_id: editorialRecordId,
      language: lang.code,
      work_status: "pending",
      workflow_id: workflowId,
      priority,
    }));

    const { error: insertError } = await supabase
      .from("translation_records")
      .insert(newRecords);

    if (insertError) {
      logger.error(insertError, "Error creating translation records");
      return { success: false, error: "Failed to create translation records" };
    }

    const createdLanguages = targetLanguages.map((l) => l.code);

    logger.info(
      {
        editorialRecordId,
        count: newRecords.length,
        languages: createdLanguages,
      },
      "Created translation records",
    );

    return {
      success: true,
      data: {
        created: newRecords.length,
        languages: createdLanguages,
      },
    };
  } catch (error) {
    logger.error(error, "Unexpected error in createTranslationRecordsStep");
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
