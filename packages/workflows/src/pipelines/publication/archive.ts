import {
  type ArchiveDocumentInput,
  archiveDocumentStep,
} from "../../steps/publication/archive-document";

export interface ArchiveWorkflowResult {
  publicationRecordId?: string;
  remoteId?: string;
}

export async function archiveWorkflow(
  input: ArchiveDocumentInput,
): Promise<ArchiveWorkflowResult> {
  "use workflow";

  const archiveResult = await archiveDocumentStep(input);

  if (!archiveResult.success || !archiveResult.data) {
    throw new Error(archiveResult.error || "Archive failed");
  }

  return {
    publicationRecordId: archiveResult.data.publicationRecordId,
    remoteId: archiveResult.data.remoteId,
  };
}
