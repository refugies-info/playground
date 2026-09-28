"use server";

import { RCO_RUN_OPTIONS, RcoRunOptionsSchema } from "@playground/offre-info";
import { logger } from "@playground/shared-types";
import { getSupabaseAdmin } from "@playground/supabase";
import {
  findLatestInterruptedRun,
  findRunningIngestion,
} from "@playground/supabase/ingestion-runs";
import {
  diIngestionWorkflow,
  rcoIngestionWorkflow,
} from "@playground/workflows";
import { start } from "@workflow/core/runtime";
import { getIngestionSource } from "@/lib/ingestion-source";
import { buildWorkflowDashboardUrl } from "@/lib/workflow-utils";

async function startActiveSourceWorkflow() {
  const supabase = getSupabaseAdmin();
  const running = await findRunningIngestion(supabase);
  if (running) {
    throw new Error(
      `Un import ${running.source.toUpperCase()} est déjà en cours (${running.id})`,
    );
  }

  if (getIngestionSource() === "di") return start(diIngestionWorkflow, []);

  const resumeRunId = await findLatestInterruptedRun(supabase, "rco");
  const options = RcoRunOptionsSchema.parse(
    resumeRunId ? { ...RCO_RUN_OPTIONS, resumeRunId } : RCO_RUN_OPTIONS,
  );
  return start(rcoIngestionWorkflow, [options]);
}

export async function triggerIngestionAction() {
  try {
    const result = await startActiveSourceWorkflow();
    return {
      success: true,
      workflowId: result.runId,
      dashboardUrl: buildWorkflowDashboardUrl(result.runId),
    };
  } catch (error) {
    logger.error(error, "Failed to trigger ingestion workflow");
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
