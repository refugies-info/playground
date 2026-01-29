import { logger } from "@playground/shared-types";
import type { StepResult } from "../../types";
import { getSupabaseClient } from "./supabase";

/**
 * Result of getting editorial record ID.
 */
export interface GetEditorialRecordIdResult {
  editorialRecordId: string | null;
}

/**
 * Gets the editorial_record_id from a workflow.
 *
 * This is a step function so it can use Supabase (Node.js modules allowed).
 *
 * @param workflowId - The workflow ID to look up
 * @returns Result with editorial record ID or null
 */
export async function getEditorialRecordIdStep(
  workflowId: string,
): Promise<StepResult<GetEditorialRecordIdResult>> {
  "use step";

  try {
    const supabase = getSupabaseClient();

    const { data: workflow, error } = await supabase
      .from("workflows")
      .select("editorial_record_id")
      .eq("id", workflowId)
      .single();

    if (error) {
      logger.error(error, "Error fetching workflow for editorial_record_id");
      return {
        success: false,
        error: "Failed to fetch workflow",
      };
    }

    return {
      success: true,
      data: {
        editorialRecordId: workflow?.editorial_record_id || null,
      },
    };
  } catch (error) {
    logger.error(error, "Unexpected error in getEditorialRecordIdStep");
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
