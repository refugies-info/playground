"use server";

import { logger } from "@playground/shared-types";
import {
  diIngestionWorkflow,
  forceArbitrationWorkflow,
} from "@playground/workflows";
import { start } from "workflow/api";
import { buildWorkflowDashboardUrl } from "@/lib/workflow-utils";

export async function triggerDiIngestionAction() {
  try {
    const result = await start(diIngestionWorkflow, []);
    const dashboardUrl = buildWorkflowDashboardUrl(result.runId);

    return {
      success: true,
      workflowId: result.runId,
      dashboardUrl,
    };
  } catch (error) {
    logger.error(error, "Failed to trigger DI ingestion workflow");
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function forceArbitrationAction(workflowId: string) {
  try {
    const result = await start(forceArbitrationWorkflow, [workflowId]);
    const dashboardUrl = buildWorkflowDashboardUrl(result.runId);

    return {
      success: true,
      workflowId: result.runId,
      dashboardUrl,
    };
  } catch (error) {
    logger.error({ error, workflowId }, "Failed to force arbitration workflow");
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
