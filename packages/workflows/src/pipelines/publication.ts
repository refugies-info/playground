import { getEditorialRecordIdStep } from "../steps/common/get-editorial-record-id";
import {
  type PublishDocumentInput,
  publishDocumentStep,
} from "../steps/publication/publish-document";
import { createTranslationRecordsStep } from "../steps/translation/create-translation-records";
import { getAvailableTranslationAgentsStep } from "../steps/translation/get-available-translation-agents";
import { triggerTranslationWorkflowStep } from "../steps/translation/trigger-translation-workflow";

/**
 * Result of the publication workflow.
 */
export interface PublicationWorkflowResult {
  publicationRecordId: string;
  remoteId: string;
  isUpdate: boolean;
  publishedUrl: string;
  translationsCreated?: number;
}

/**
 * Publication pipeline that orchestrates document publishing.
 *
 * This workflow:
 * 1. Publishes the document to the target platform
 * 2. Optionally creates translation records
 *
 * NOTE: No Node.js modules (like logger, supabase) can be used directly here.
 * All such operations must be in step functions.
 *
 * @param input - Publication input with document data and user context
 * @param triggerTranslations - Whether to create translation records
 */
export async function publicationWorkflow(
  input: PublishDocumentInput,
  triggerTranslations: boolean,
): Promise<PublicationWorkflowResult> {
  "use workflow";

  // Step 1: Publish the document
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

  // Step 2: Create translation records if requested
  if (triggerTranslations) {
    // Get the editorial_record_id via a step (not directly with Supabase)
    const editorialRecordResult = await getEditorialRecordIdStep(
      input.workflowId,
    );

    if (
      editorialRecordResult.success &&
      editorialRecordResult.data?.editorialRecordId
    ) {
      const editorialRecordId = editorialRecordResult.data.editorialRecordId;

      const translationResult = await createTranslationRecordsStep(
        editorialRecordId,
        input.workflowId,
      );

      if (translationResult.success && translationResult.data) {
        result.translationsCreated = translationResult.data.created;
      }

      // 2.1 Trigger AI Translations for configured languages
      const languagesResult = await getAvailableTranslationAgentsStep();
      const languages =
        languagesResult.success && languagesResult.data?.languages
          ? languagesResult.data.languages
          : [];

      if (languages.length > 0) {
        // Run translations in parallel (or sequential if preferred, but parallel is faster)
        // We use allSettled to not fail the whole process if one translation fails
        const translationPromises = languages.map((lang) =>
          triggerTranslationWorkflowStep(
            editorialRecordId,
            lang,
            input.workflowId,
          ),
        );

        await Promise.allSettled(translationPromises);
      }
    }
  }

  return result;
}
