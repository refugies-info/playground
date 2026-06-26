import {
  type ToggleStatusResult,
  toggleStatusStep,
} from "../../steps/editorial/toggle-status";

export type { ToggleStatusResult };

export async function toggleStatusWorkflow(
  workflowId: string,
  currentStatus: string,
  userId: string,
): Promise<ToggleStatusResult> {
  "use workflow";

  const result = await toggleStatusStep(workflowId, currentStatus, userId);

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to toggle status");
  }

  return result.data;
}
