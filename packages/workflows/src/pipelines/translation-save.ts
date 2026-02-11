import { saveTranslationStep } from "../steps/translation/save-translation";

/**
 * Result of the save translation workflow.
 */
export interface SaveTranslationWorkflowResult {
  translationRecordId: string;
}

/**
 * Save translation pipeline.
 *
 * @param translationId - The translation record ID
 * @param markdown - The markdown content
 * @param userId - The user ID
 */
export async function saveTranslationWorkflow(
  translationId: string,
  markdown: string,
  userId: string,
): Promise<SaveTranslationWorkflowResult> {
  "use workflow";

  const result = await saveTranslationStep(translationId, markdown, userId);

  if (!result.success || !result.data) {
    throw new Error(result.error || "Save translation failed");
  }

  return {
    translationRecordId: result.data.translationRecordId,
  };
}
