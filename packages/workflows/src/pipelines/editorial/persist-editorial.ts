import type { LettaUsage } from "@playground/agents";
import { persistEditorialReportStep } from "../../steps/editorial/persist-editorial-report";

export interface PersistEditorialWorkflowResult {
  reportId: string;
  editorialRecordId: string;
}

export async function persistEditorialWorkflow(
  workflowId: string,
  agentId: string,
  responseContent: string,
  usage?: LettaUsage,
): Promise<PersistEditorialWorkflowResult> {
  "use workflow";

  const result = await persistEditorialReportStep(
    workflowId,
    agentId,
    responseContent,
    usage,
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
