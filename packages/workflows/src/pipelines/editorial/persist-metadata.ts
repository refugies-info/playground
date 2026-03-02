import { persistMetadataReportStep } from "../../steps/editorial/persist-metadata-report";

export interface PersistMetadataWorkflowResult {
  reportId: string;
  editorialRecordId: string;
}

export async function persistMetadataWorkflow(
  workflowId: string,
  agentId: string,
  responseContent: string,
): Promise<PersistMetadataWorkflowResult> {
  "use workflow";

  const result = await persistMetadataReportStep(
    workflowId,
    agentId,
    responseContent,
  );

  if (
    !result.success ||
    !result.data ||
    !result.data.reportId ||
    !result.data.editorialRecordId
  ) {
    throw new Error(result.error || "Failed to persist metadata report");
  }

  return {
    reportId: result.data.reportId,
    editorialRecordId: result.data.editorialRecordId,
  };
}
