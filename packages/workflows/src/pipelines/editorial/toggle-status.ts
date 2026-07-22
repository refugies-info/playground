import {
  type ToggleStatusResult,
  toggleStatusStep,
} from "../../steps/editorial/toggle-status";
import { archiveDocumentStep } from "../../steps/publication/archive-document";

export type { ToggleStatusResult };

export async function toggleStatusWorkflow(
  workflowId: string,
  currentStatus: string,
  userId: string,
  userEmail: string,
): Promise<ToggleStatusResult> {
  "use workflow";

  const result = await toggleStatusStep(workflowId, currentStatus, userId);

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to toggle status");
  }

  // Transitioning to non_compliant archives the document locally; also
  // depublish the remote content via the archive webhook, mirroring the
  // dedicated archive workflow. Reuses archiveDocumentStep so both archive
  // paths stay in sync (title/markdown are unused by the archive payload).
  if (result.data.newComplianceStatus === "non_compliant") {
    // Local status already toggled; a depublish failure is logged inside
    // archiveDocumentStep and must not fail the workflow, otherwise the
    // compliance change would be rolled back.
    await archiveDocumentStep({
      workflowId,
      userId,
      userEmail,
    });
  }

  return result.data;
}
