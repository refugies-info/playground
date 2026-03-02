import { saveDocumentStep } from "../../steps/editorial/save-document";

export interface SaveWorkflowResult {
  editorialRecordId: string;
  isNew: boolean;
  progressUpdated: boolean;
  metadata: Record<string, unknown>;
}

export async function saveWorkflow(
  workflowId: string,
  markdown: string,
  userId: string,
): Promise<SaveWorkflowResult> {
  "use workflow";

  const saveResult = await saveDocumentStep(workflowId, markdown, userId);

  if (!saveResult.success || !saveResult.data) {
    throw new Error(saveResult.error || "Save failed");
  }

  return {
    editorialRecordId: saveResult.data.editorialRecordId,
    isNew: saveResult.data.isNew,
    progressUpdated: saveResult.data.progressUpdated,
    metadata: saveResult.data.metadata,
  };
}
