import { getEditorialRecordIdStep } from "../../steps/common/get-editorial-record-id";
import {
  type PublishDocumentInput,
  publishDocumentStep,
} from "../../steps/publication/publish-document";
import { createTranslationRecordsStep } from "../../steps/translation/create-translation-records";
import { getAvailableTranslationAgentsStep } from "../../steps/translation/get-available-translation-agents";
import { triggerTranslationWorkflowStep } from "../../steps/translation/trigger-translation-workflow";

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

      const translationResult = await createTranslationRecordsStep(
        editorialRecordId,
        input.workflowId,
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
        const translationPromises = languages.map((lang) =>
          triggerTranslationWorkflowStep(
            editorialRecordId,
            lang,
            input.workflowId,
            input.userId,
          ),
        );
        await Promise.allSettled(translationPromises);
      }
    }
  }

  return result;
}
