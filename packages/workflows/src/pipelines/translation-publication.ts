import {
  type PublishTranslationInput,
  type PublishTranslationResult,
  publishTranslationStep,
} from "../steps/publication/publish-translation";

/**
 * Result of the translation publication workflow.
 */
export type TranslationPublicationWorkflowResult = PublishTranslationResult;

/**
 * Translation publication pipeline that orchestrates translation publishing.
 *
 * This workflow:
 * 1. Publishes the translated content to the target platform
 *
 * @param input - Publication input with translation ID and user context
 */
export async function translationPublicationWorkflow(
  input: PublishTranslationInput,
): Promise<TranslationPublicationWorkflowResult> {
  "use workflow";

  const result = await publishTranslationStep(input);

  if (!result.success || !result.data) {
    throw new Error(result.error || "Translation publication failed");
  }

  return result.data;
}
