import {
  type ArchiveDocumentInput,
  archiveDocumentStep,
} from "../steps/publication/archive-document";

/**
 * Result of the archive workflow.
 */
export interface ArchiveWorkflowResult {
  publicationRecordId: string;
  remoteId: string;
}

/**
 * Archive pipeline that orchestrates document archiving.
 *
 * This workflow:
 * 1. Archives the document on the target platform
 * 2. Updates the publication record status
 * 3. Updates workflow progress to 'archived'
 *
 * NOTE: No Node.js modules can be used directly here - all in steps.
 *
 * @param input - Archive input with document data and user context
 */
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
