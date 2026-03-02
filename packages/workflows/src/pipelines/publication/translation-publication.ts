import {
  type PublishTranslationInput,
  type PublishTranslationResult,
  publishTranslationStep,
} from "../../steps/publication/publish-translation";

export type TranslationPublicationWorkflowResult = PublishTranslationResult;

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
