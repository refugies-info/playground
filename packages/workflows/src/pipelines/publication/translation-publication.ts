import {
  type PublishTranslationInput,
  type PublishTranslationResult,
  publishTranslationStep,
} from "../../steps/publication/publish-translation";
import { addTradToAirtableStep } from "../../steps/translation/add-trad-to-airtable";

export type TranslationPublicationWorkflowResult = PublishTranslationResult;

export async function translationPublicationWorkflow(
  input: PublishTranslationInput,
): Promise<TranslationPublicationWorkflowResult> {
  "use workflow";

  const result = await publishTranslationStep(input);

  if (!result.success || !result.data) {
    throw new Error(result.error || "Translation publication failed");
  }

  await addTradToAirtableStep({
    translationId: input.translationId,
    publicationRecordId: result.data.publicationRecordId,
    remoteId: result.data.remoteId,
    publisherId: input.userId,
    publisherEmail: input.userEmail,
  });

  return result.data;
}
