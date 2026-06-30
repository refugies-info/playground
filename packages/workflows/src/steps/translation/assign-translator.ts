import { logger } from "@playground/shared-types";
import type { StepResult } from "../../types";
import { getSupabaseClient } from "../common/supabase";

/**
 * Assigns the translation record to the translator configured for the target language.
 *
 * Looks up the profile with role='translator' and language=<language>,
 * then sets author_id on the translation record.
 * No-ops silently if no translator is configured for that language.
 *
 * @param translationRecordId - The translation record to assign
 * @param language - The target language code
 */
export async function assignTranslatorStep(
  translationRecordId: string,
  language: string,
): Promise<StepResult<{ assigned: boolean; translatorId?: string }>> {
  "use step";

  try {
    const supabase = getSupabaseClient();

    const { data: translator, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "translator")
      .eq("language", language)
      .maybeSingle();

    logger.info(
      { language, translator: translator },
      "Fetched translator for language",
    );

    if (fetchError) {
      logger.error(fetchError, "Error fetching translator profile");
      return { success: false, error: "Failed to fetch translator profile" };
    }

    if (!translator) {
      logger.info(
        { language },
        "No translator configured for language — skipping assignment",
      );
      return { success: true, data: { assigned: false } };
    }

    const { error: updateError } = await supabase
      .from("translation_records")
      .update({ author_id: translator.id })
      .eq("id", translationRecordId);

    if (updateError) {
      logger.error(updateError, "Error assigning translator to translation");
      return { success: false, error: "Failed to assign translator" };
    }

    logger.info(
      { translationRecordId, language, translatorId: translator.id },
      "Translator assigned to translation",
    );

    return {
      success: true,
      data: { assigned: true, translatorId: translator.id },
    };
  } catch (error) {
    logger.error(error, "Unexpected error in assignTranslatorStep");
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
