"use server";

import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import {
  diIngestionWorkflow,
  forceArbitrationWorkflow,
} from "@playground/workflows";
import { cookies } from "next/headers";
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
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .select("ingestion_record_id")
      .eq("id", workflowId)
      .single();

    if (workflowError || !workflow?.ingestion_record_id) {
      logger.error(
        { error: workflowError, workflowId },
        "Workflow or ingestion record not found before forced arbitration",
      );
      return {
        success: false,
        error: "Workflow or ingestion record not found",
      };
    }

    const { data: ingestionRecord, error: ingestionRecordError } =
      await supabase
        .from("ingestion_records")
        .select("compliance_status")
        .eq("id", workflow.ingestion_record_id)
        .single();

    if (ingestionRecordError || !ingestionRecord) {
      logger.error(
        {
          error: ingestionRecordError,
          workflowId,
          ingestionRecordId: workflow.ingestion_record_id,
        },
        "Ingestion record not found before forced arbitration",
      );
      return {
        success: false,
        error: "Ingestion record not found",
      };
    }

    if (ingestionRecord.compliance_status === "pending") {
      return {
        success: true,
        alreadyPending: true,
      };
    }

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
