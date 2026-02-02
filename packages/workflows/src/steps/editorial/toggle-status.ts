import { logger } from "@playground/shared-types";
import type { StepResult } from "../../types";
import { getSupabaseClient } from "../common/supabase";

/**
 * Result of toggling workflow status.
 */
export interface ToggleStatusResult {
  newStatus: string;
  newProgress: string;
}

/**
 * Toggles the compliance status of a workflow.
 *
 * This step:
 * 1. Calculates the new status (compliant <-> non_compliant)
 * 2. Determines the new progress state (to_process vs archived)
 * 3. Updates the workflow record
 *
 * @param workflowId - The workflow ID to update
 * @param currentStatus - The current status of the workflow
 * @returns Result with new status and progress
 */
export async function toggleStatusStep(
  workflowId: string,
  currentStatus: string,
): Promise<StepResult<ToggleStatusResult>> {
  "use step";

  try {
    const supabase = getSupabaseClient();

    const newStatus =
      currentStatus === "compliant" ? "non_compliant" : "compliant";

    // Determine the new progress based on status transition
    let newProgress: string;
    if (currentStatus === "non_compliant" && newStatus === "compliant") {
      // Non-conforme → Conforme: document needs to be processed before publication
      newProgress = "to_process";
    } else if (currentStatus === "compliant" && newStatus === "non_compliant") {
      // Conforme → Non_conforme: document is effectively archived/rejected
      newProgress = "archived";
    } else {
      // Fallback logic
      newProgress = currentStatus === "compliant" ? "to_process" : "archived";
    }

    const { error: updateError } = await supabase
      .from("workflows")
      .update({ status: newStatus, progress: newProgress })
      .eq("id", workflowId);

    if (updateError) {
      logger.error(
        { error: updateError, workflowId },
        "Error updating workflow status",
      );
      return { success: false, error: "Failed to update workflow status" };
    }

    logger.info(
      { workflowId, oldStatus: currentStatus, newStatus, newProgress },
      "Workflow status toggled successfully",
    );

    return {
      success: true,
      data: { newStatus, newProgress },
    };
  } catch (error) {
    logger.error(error, "Unexpected error in toggleStatusStep");
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
