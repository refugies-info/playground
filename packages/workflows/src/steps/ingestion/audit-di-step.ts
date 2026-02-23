/**
 * @file audit-di-step.ts
 *
 * Workflow Step: Generate DI Audit Reports
 *
 * Flow:
 *
 *   diIngestionWorkflow
 *         │
 *         ├── [1] ingestStructuresStep
 *         ├── [2] ingestServicesStep
 *         ├── [3] processRecordsStep
 *         │         │
 *         │         └── ingestion_records created
 *         │
 *         ├── [4] generateDiAuditReportsStep  ◄── THIS FILE
 *         │         │
 *         │         ├── fetchAllDiServiceIds()
 *         │         │         └── Paginate di_services table
 *         │         │
 *         │         └── fetchDiAuditTargets()
 *         │                   ├── RPC: count_di_audit_candidates (for reporting)
 *         │                   ├── RPC: claim_di_audit_targets (atomic lock)
 *         │                   │     └── compliance_status = 'pending'
 *         │                   │         + zombie reclamation
 *         │                   │         + MAX_PENDING_AUDITS cap
 *         │                   └── For each target:
 *         │                             ├── generateIngestionReport()  [Letta agent]
 *         │                             ├── parseIngestionResponse()
 *         │                             ├── Insert into letta_reports (type: 'ingestion')
 *         │                             └── Update ingestion_records.ingestion_report_id
 *         │
 *         └── [5] generateDiMetadataReportsStep → metadata-di-step.ts
 *                   (runs AFTER audit — only targets audited records)
 *
 * Key decisions:
 * - Uses an atomic RPC claim (FOR UPDATE SKIP LOCKED) to prevent duplicate processing
 *   across concurrent workflow runs
 * - MAX_PENDING_AUDITS cap (env: MAX_PENDING_AUDITS, default: 50) prevents runaway costs
 * - Requires service IDs to scope to DI origin (vs. RCO etc.)
 * - compliance_status on `workflows` is updated by a DB trigger on ingestion_records update
 */

import { APIError } from "@letta-ai/letta-client/error";
import {
  createLettaClient,
  findOrCreateConversation,
  generateIngestionReport,
  parseIngestionResponse,
} from "@playground/agents";
import { logger } from "@playground/shared-types";
import type { Json } from "@playground/supabase";
import { z } from "zod";
import {
  fetchAllDiServiceIds,
  getSupabaseClient,
  runWithConcurrency,
} from "./utils";

// =============================================================================
// Config
// =============================================================================

const envVal = Number(process.env.MAX_PENDING_AUDITS);

/**
 * Maximum number of audit records that can be in 'pending' state simultaneously.
 * Controlled via MAX_PENDING_AUDITS env var. Defaults to 50.
 */
const MAX_PENDING_AUDITS = Number.isNaN(envVal) || envVal <= 0 ? 50 : envVal;

/**
 * Maximum number of audit LLM calls running in parallel.
 * Each concurrent call uses its own Letta conversation to avoid context mixing.
 */
const AUDIT_CONCURRENCY = 5;

// =============================================================================
// Schema
// =============================================================================

/**
 * Input schema for the generateDiAuditReportsStep.
 */
export const GenerateDiAuditReportsStepSchema = z.object({
  runId: z.string().describe("The ID of the current ingestion run"),
});

export type GenerateDiAuditReportsStepInput = z.infer<
  typeof GenerateDiAuditReportsStepSchema
>;

// =============================================================================
// Internal Types
// =============================================================================

/** A record claimed for audit generation. */
type DiAuditTarget = {
  /** UUID of the ingestion_record */
  id: string;
  /** Markdown content to send to the Letta agent */
  markdown: string;
  /** UUID of the associated workflow entry */
  workflow_id: string;
};

// =============================================================================
// Helpers
// =============================================================================

/**
 * Atomically claims and returns ingestion records eligible for audit.
 *
 * Uses two RPCs:
 * - `count_di_audit_candidates`: counts total eligible records (for logging).
 * - `claim_di_audit_targets`: atomically locks up to `MAX_PENDING_AUDITS` records
 *   by setting `compliance_status = 'pending'` (with `FOR UPDATE SKIP LOCKED`).
 *   Also reclaims zombie records stuck in pending beyond the timeout.
 *
 * @param serviceIds - List of DI service UUIDs to scope the query to.
 * @returns Claimed targets and the total candidate count.
 * @throws If either RPC call fails.
 */
async function fetchDiAuditTargets(
  serviceIds: string[],
): Promise<{ targets: DiAuditTarget[]; totalCandidates: number }> {
  const supabase = getSupabaseClient();
  let totalCandidates = 0;

  if (serviceIds.length === 0) {
    return { targets: [], totalCandidates };
  }

  // 1. Get total candidates count for reporting (records that could be audited)
  const { data: candidateCount, error: countError } = await supabase.rpc(
    "count_di_audit_candidates",
    { p_service_ids: serviceIds },
  );

  if (countError) {
    throw new Error(
      `Failed to count audit candidates: ${JSON.stringify(countError)}`,
    );
  }
  totalCandidates = candidateCount ?? 0;

  // 2. Atomic claim and fetch via stored procedure
  // This handles the safety limit, race conditions, and zombie reclamation
  const { data, error: rpcError } = await supabase.rpc(
    "claim_di_audit_targets",
    {
      p_service_ids: serviceIds,
      max_total_pending: MAX_PENDING_AUDITS,
    },
  );

  if (rpcError) {
    throw new Error(`Failed to claim audit targets: ${rpcError.message}`);
  }

  const targets = (data as DiAuditTarget[]) || [];

  logger.info(
    { selected: targets.length, totalCandidates },
    "Audit capacity check and target selection complete",
  );

  return {
    targets,
    totalCandidates,
  };
}

// =============================================================================
// Step
// =============================================================================

/**
 * Workflow step that generates audit (compliance) reports for DI ingestion records.
 *
 * Processes records that have no `ingestion_report_id` yet and whose
 * `compliance_status` is NULL. Records are atomically claimed to prevent
 * duplicate processing across concurrent runs.
 *
 * After success:
 * - A `letta_report` of type 'ingestion' is created and linked to the record.
 * - The DB trigger `update_workflow_status_from_ingestion_record` updates
 *   `compliance_status` on the `workflows` table accordingly.
 *
 * @param runId - The ID of the current ingestion run. Used for logging context.
 * @returns A summary object with `attempted`, `succeeded`, `failed`,
 *          `totalCandidates`, and `skipped` counts.
 * @throws If the Letta agent ID environment variable is missing.
 */
export async function generateDiAuditReportsStep(runId: string) {
  "use step";

  // Fetch ALL DI service IDs, not just from the current run.
  // Unchanged services keep their original ingestion_run_id, so filtering
  // by the current runId would miss unaudited records from previous runs.
  const serviceIds = await fetchAllDiServiceIds();

  if (serviceIds.length === 0) {
    logger.info({ runId }, "No DI services found for audit reporting");
    return { attempted: 0, succeeded: 0, failed: 0 };
  }

  const { targets, totalCandidates } = await fetchDiAuditTargets(serviceIds);

  if (targets.length === 0) {
    logger.info({ runId }, "No ingestion records found for audit reporting");
    return {
      attempted: 0,
      succeeded: 0,
      failed: 0,
      totalCandidates,
      skipped: totalCandidates,
    };
  }

  const agentId = process.env.PLAYGROUND_AGENT_ID;

  if (!agentId) {
    throw new Error("PLAYGROUND_AGENT_ID is not defined");
  }

  const lettaClient = createLettaClient();
  const supabase = getSupabaseClient();

  const skipped = Math.max(0, totalCandidates - targets.length);

  logger.info(
    { runId, totalCandidates, selected: targets.length, skipped },
    "DI audit report selection",
  );

  // Process targets in parallel (each gets its own conversation to avoid
  // context mixing). runWithConcurrency limits simultaneous LLM calls.
  const results = await runWithConcurrency(
    targets.map((target) => async () => {
      const conversationId = await findOrCreateConversation(
        lettaClient,
        agentId,
        `compliance-${target.workflow_id}`,
      );

      let finalContent = "";

      for await (const chunk of generateIngestionReport(
        lettaClient,
        target.markdown,
        conversationId,
      )) {
        if (chunk.message_type === "assistant_message") {
          if (typeof chunk.content !== "string") {
            throw new Error(
              `Expected assistant message content to be a string, but got ${typeof chunk.content}`,
            );
          }
          finalContent += chunk.content;
        }
      }

      if (!finalContent) {
        throw new Error("No assistant response received for ingestion report");
      }

      const parsed = parseIngestionResponse(finalContent, agentId);

      const { data: report, error: reportError } = await supabase
        .from("letta_reports")
        .insert({
          agent_id: agentId,
          report_type: "ingestion",
          markdown: parsed.content,
          metadata: parsed.metadata as Json,
          status: parsed.status,
          raw_response: parsed.rawResponse ?? null,
          workflow_id: target.workflow_id,
        })
        .select("id")
        .single();

      if (reportError || !report) {
        throw new Error(
          `Failed to insert letta_report: ${reportError?.message ?? "unknown error"}`,
        );
      }

      const { error: updateError } = await supabase
        .from("ingestion_records")
        .update({ ingestion_report_id: report.id })
        .eq("id", target.id);

      if (updateError) {
        throw new Error(
          `Failed to link ingestion_report to ingestion_record: ${updateError.message}`,
        );
      }
    }),
    AUDIT_CONCURRENCY,
  );

  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      succeeded += 1;
    } else {
      failed += 1;
      const target = targets[i];
      const error = result.reason;

      if (error instanceof APIError) {
        logger.error(
          { status: error.status, body: error.error },
          "Letta API error generating DI ingestion report",
        );
      } else {
        logger.error(
          {
            err: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            ingestionRecordId: target.id,
          },
          "Error generating DI ingestion report",
        );
      }
    }
  }

  return {
    attempted: targets.length,
    succeeded,
    failed,
    totalCandidates,
    skipped,
  };
}

/**
 * Workflow step that forces generation of an audit report for a specific workflow,
 * bypassing normal batch collection. Used primarily for manual arbitration/retry.
 *
 * @param workflowId - The ID of the workflow to force audit for.
 */
export async function forceAuditReportStep(workflowId: string) {
  "use step";

  const supabase = getSupabaseClient();

  // 1. Fetch workflow to get ingestion_record_id
  const { data: workflow, error: workflowError } = await supabase
    .from("workflows")
    .select("ingestion_record_id")
    .eq("id", workflowId)
    .single();

  // Set compliance status to pending immediately
  await supabase
    .from("workflows")
    .update({ compliance_status: "pending" })
    .eq("id", workflowId);

  if (workflowError || !workflow?.ingestion_record_id) {
    logger.error(
      { workflowId, error: workflowError },
      "Workflow or Ingestion Record not found for forced audit",
    );
    throw new Error("Workflow or Ingestion Record not found");
  }

  const ingestionRecordId = workflow.ingestion_record_id;

  // 2. Fetch Ingestion Record
  const { data: record, error: recordError } = await supabase
    .from("ingestion_records")
    .select("id, markdown")
    .eq("id", ingestionRecordId)
    .single();

  if (recordError || !record) {
    throw new Error(`Ingestion Record not found: ${recordError?.message}`);
  }

  const agentId = process.env.PLAYGROUND_AGENT_ID;
  if (!agentId) {
    throw new Error("PLAYGROUND_AGENT_ID is not defined");
  }

  const lettaClient = createLettaClient();
  const conversationId = await findOrCreateConversation(
    lettaClient,
    agentId,
    `compliance-${workflowId}`,
  );

  logger.info(
    { workflowId, ingestionRecordId },
    "Starting forced arbitration audit",
  );

  let finalContent = "";

  try {
    for await (const chunk of generateIngestionReport(
      lettaClient,
      record.markdown,
      conversationId,
    )) {
      if (chunk.message_type === "assistant_message") {
        if (typeof chunk.content !== "string") {
          throw new Error(
            `Expected assistant message content to be a string, but got ${typeof chunk.content}`,
          );
        }
        finalContent += chunk.content;
      }
    }

    if (!finalContent) {
      throw new Error("No assistant response received for ingestion report");
    }

    const parsed = parseIngestionResponse(finalContent, agentId);

    // Insert Report
    const { data: report, error: reportError } = await supabase
      .from("letta_reports")
      .insert({
        agent_id: agentId,
        report_type: "ingestion",
        markdown: parsed.content,
        metadata: parsed.metadata as Json,
        status: parsed.status,
        raw_response: parsed.rawResponse ?? null,
        workflow_id: workflowId,
      })
      .select("id")
      .single();

    if (reportError || !report) {
      throw new Error(
        `Failed to insert letta_report: ${reportError?.message ?? "unknown error"}`,
      );
    }

    // Link Report to Ingestion Record
    const { error: updateError } = await supabase
      .from("ingestion_records")
      .update({ ingestion_report_id: report.id })
      .eq("id", ingestionRecordId);

    if (updateError) {
      throw new Error(
        `Failed to link ingestion_report to ingestion_record: ${updateError.message}`,
      );
    }

    // Update workflow with final status from report
    // If status is 'incomplete', we force 'error' in DB to avoid stuck 'pending'
    // Otherwise, we use the business status from metadata
    const finalComplianceStatus =
      parsed.status === "incomplete"
        ? "error"
        : parsed.metadata.compliant
          ? "compliant"
          : "non_compliant";

    const { error: finalStatusError } = await supabase
      .from("workflows")
      .update({ compliance_status: finalComplianceStatus })
      .eq("id", workflowId);

    if (finalStatusError) {
      logger.error(
        { error: finalStatusError, workflowId },
        "Failed to update workflow final status",
      );
    }

    logger.info(
      { workflowId, reportId: report.id },
      "Forced arbitration audit completed successfully",
    );

    return { success: true, reportId: report.id };
  } catch (error) {
    if (error instanceof APIError) {
      logger.error(
        { status: error.status, body: error.error },
        "Letta API error generating forced ingestion report",
      );
    } else {
      logger.error(
        { error, ingestionRecordId },
        "Error generating forced ingestion report",
      );
    }

    // FINAL SECURITY: Ensure workflow is no longer 'pending' if we hit an error
    try {
      await supabase
        .from("workflows")
        .update({ compliance_status: "error" })
        .eq("id", workflowId);
    } catch (dbError) {
      logger.error(
        { dbError, workflowId },
        "Failed to force error status on catch",
      );
    }

    throw error;
  }
}
