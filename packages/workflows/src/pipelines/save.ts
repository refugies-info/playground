import { saveDocumentStep } from "../steps/editorial/save-document";

/**
 * Result of the save workflow.
 */
export interface SaveWorkflowResult {
  editorialRecordId: string;
  isNew: boolean;
  progressUpdated: boolean;
}

/**
 * Save pipeline that orchestrates document saving.
 *
 * This workflow:
 * 1. Saves or updates the editorial record
 * 2. Updates workflow progress if needed
 *
 * NOTE: No Node.js modules can be used directly here - all in steps.
 *
 * @param workflowId - The workflow ID
 * @param markdown - The markdown content to save
 */
export async function saveWorkflow(
  workflowId: string,
  markdown: string,
): Promise<SaveWorkflowResult> {
  "use workflow";

  const saveResult = await saveDocumentStep(workflowId, markdown);

  if (!saveResult.success || !saveResult.data) {
    throw new Error(saveResult.error || "Save failed");
  }

  return {
    editorialRecordId: saveResult.data.editorialRecordId,
    isNew: saveResult.data.isNew,
    progressUpdated: saveResult.data.progressUpdated,
  };
}
