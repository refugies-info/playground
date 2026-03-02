import { saveTranslationStep } from "../../steps/translation/save-translation";

export interface SaveTranslationWorkflowResult {
  translationRecordId: string;
}

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
