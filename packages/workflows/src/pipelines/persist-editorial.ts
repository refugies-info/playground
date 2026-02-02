import { persistEditorialReportStep } from "../steps/editorial/persist-editorial-report";

/**
 * Result of the persist editorial workflow.
 */
export interface PersistEditorialWorkflowResult {
  reportId: string;
  editorialRecordId: string;
}

/**
 * Workflow to persist an editorial agent report.
 *
 * This triggers after the editorial agent stream completes.
 * It persists the generated content and links it to the editorial record.
 */
export async function persistEditorialWorkflow(
  workflowId: string,
  agentId: string,
  responseContent: string,
): Promise<PersistEditorialWorkflowResult> {
  "use workflow";

  const result = await persistEditorialReportStep(
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
    throw new Error(result.error || "Failed to persist editorial report");
  }

  return {
    reportId: result.data.reportId,
    editorialRecordId: result.data.editorialRecordId,
  };
}
