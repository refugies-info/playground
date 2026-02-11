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

    // Determine target statuses based on transition
    let newOnlineStatus: string | null = null;
    let newWorkStatus: string | null = null;

    if (newComplianceStatus === "compliant") {
      // Becoming compliant: ready to process
      // Rule: compliant docs default to unpublished and need processing
      newOnlineStatus = "unpublished";
      newWorkStatus = "to_process";
    } else {
      // Becoming non-compliant: usually archived
      newOnlineStatus = "archived";
      newWorkStatus = null;
    }

    // 1. Update workflow compliance status
    const { data: workflow, error: updateError } = await supabase
      .from("workflows")
      .update({
        compliance_status: newComplianceStatus,
      })
      .eq("id", workflowId)
      .select("editorial_record_id")
      .single();

    if (updateError) {
      logger.error(
        { error: updateError, workflowId },
        "Error updating workflow status",
      );
      return { success: false, error: "Failed to update workflow status" };
    }

    // 2. Update editorial record statuses if it exists
    if (workflow?.editorial_record_id) {
      const updatePayload = {
        work_status: newWorkStatus,
        online_status: newOnlineStatus,
      };

      const { error: edError } = await supabase
        .from("editorial_records")
        .update(updatePayload)
        .eq("id", workflow.editorial_record_id);

      if (edError) {
        logger.error(
          { error: edError, workflowId },
          "Error updating editorial record status in toggle",
        );
        // We log but don't fail hard, as the main workflow status was updated
        return {
          success: false,
          error: "Failed to update editorial record status",
        };
      }
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
