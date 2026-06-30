import { getEditorialRecordIdStep } from "../../steps/common/get-editorial-record-id";
import {
  type PublishDocumentInput,
  publishDocumentStep,
} from "../../steps/publication/publish-document";
import { createTranslationRecordsStep } from "../../steps/translation/create-translation-records";
import { getAvailableTranslationAgentsStep } from "../../steps/translation/get-available-translation-agents";
import { triggerTranslationWorkflowStep } from "../../steps/translation/trigger-translation-workflow";

/**
 * Délai entre les appels Letta pour éviter le rate limiting (429).
 * Doit être un "use step" — setTimeout n'est pas disponible dans le
 * contexte orchestrateur des Vercel Workflows (uniquement dans les steps).
 */
async function sleepStep(ms: number): Promise<void> {
  "use step";
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export interface PublicationWorkflowResult {
  publicationRecordId: string;
  remoteId: string;
  isUpdate: boolean;
  publishedUrl: string;
  translationsCreated?: number;
}

export async function publicationWorkflow(
  input: PublishDocumentInput,
  triggerTranslations: boolean,
  isUrgent = false,
): Promise<PublicationWorkflowResult> {
  "use workflow";

  const publishResult = await publishDocumentStep(input);

  if (!publishResult.success || !publishResult.data) {
    throw new Error(publishResult.error || "Publication failed");
  }

  const result: PublicationWorkflowResult = {
    publicationRecordId: publishResult.data.publicationRecordId,
    remoteId: publishResult.data.remoteId,
    isUpdate: publishResult.data.isUpdate,
    publishedUrl: publishResult.data.publishedUrl,
  };

  if (triggerTranslations) {
    const editorialRecordResult = await getEditorialRecordIdStep(
      input.workflowId,
    );

    if (
      editorialRecordResult.success &&
      editorialRecordResult.data?.editorialRecordId
    ) {
      const editorialRecordId = editorialRecordResult.data.editorialRecordId;

      // Create translation records for missing ones
      const translationResult = await createTranslationRecordsStep(
        editorialRecordId,
        input.workflowId,
        isUrgent,
      );

      if (translationResult.success && translationResult.data) {
        result.translationsCreated = translationResult.data.created;
      }

      const languagesResult = await getAvailableTranslationAgentsStep();
      const languages =
        languagesResult.success && languagesResult.data?.languages
          ? languagesResult.data.languages
          : [];

      if (languages.length > 0) {
        // Séquentiel avec délai entre chaque langue pour éviter
        // le rate limiting Letta (429 requests/tokens per minute).
        for (const lang of languages) {
          await triggerTranslationWorkflowStep(
            editorialRecordId,
            lang,
            input.workflowId,
            input.userId,
          );
          await sleepStep(5000);
        }
      }
    }
  }

  return result;
}
