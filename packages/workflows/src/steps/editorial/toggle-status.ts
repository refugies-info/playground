import { logger } from "@playground/shared-types";
import type { StepResult } from "../../types";
import { getSupabaseClient } from "../common/supabase";

/**
 * Result of toggling workflow compliance status.
 */
export interface ToggleStatusResult {
  newComplianceStatus: string;
  newOnlineStatus: string | null;
  newWorkStatus: string | null;
}

/**
 * Toggles the compliance status of a workflow.
 *
 * This step:
 * 1. Calculates the new compliance_status (compliant <-> non_compliant)
 * 2. Determines the new online_status and work_status based on transition
 * 3. Updates the workflow record
 *
 * @param workflowId - The workflow ID to update
 * @param currentStatus - The current compliance status of the workflow
 * @returns Result with new statuses
 */
export async function toggleStatusStep(
  workflowId: string,
  currentStatus: string,
): Promise<StepResult<ToggleStatusResult>> {
  "use step";

  try {
    const supabase = getSupabaseClient();

    const newComplianceStatus =
      currentStatus === "compliant" ? "non_compliant" : "compliant";

    // Determine the new online_status and work_status based on compliance transition
    let newOnlineStatus: string | null;
    let newWorkStatus: string | null;

    if (newComplianceStatus === "compliant") {
      // Becoming compliant: ready to process, not archived
      newOnlineStatus = null;
      newWorkStatus = "to_process";
    } else {
      // Becoming non-compliant: archived, no work needed
      newOnlineStatus = "archived";
      newWorkStatus = null;
    }

    const { error: updateError } = await supabase
      .from("workflows")
      .update({
        compliance_status: newComplianceStatus,
        online_status: newOnlineStatus,
        work_status: newWorkStatus,
      })
      .eq("id", workflowId);

    if (updateError) {
      logger.error(
        { error: updateError, workflowId },
        "Error updating workflow status",
      );
      return { success: false, error: "Failed to update workflow status" };
    }

    logger.info(
      {
        workflowId,
        oldStatus: currentStatus,
        newComplianceStatus,
        newOnlineStatus,
        newWorkStatus,
      },
      "Workflow status toggled successfully",
    );

    return {
      success: true,
      data: { newComplianceStatus, newOnlineStatus, newWorkStatus },
    };
  } catch (error) {
    logger.error(error, "Unexpected error in toggleStatusStep");
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
