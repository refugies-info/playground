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
 *         │                   │         + MAX_EDITORIAL_BACKLOG cap
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
 * - MAX_EDITORIAL_BACKLOG cap (env: MAX_PENDING_AUDITS, default: 50) prevents runaway costs
 * - Requires service IDs to scope to DI origin (vs. RCO etc.)
 * - compliance_status lives on `ingestion_records` (RI-1093), updated directly after audit
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
import { FatalError, getStepMetadata } from "workflow";
import { z } from "zod";
import {
  fetchAllDiServiceIds,
  getSupabaseClient,
  runWithConcurrency,
} from "./utils";

// =============================================================================
// Config
// =============================================================================

const envVal = Number(process.env.MAX_EDITORIAL_BACKLOG);

/**
 * Maximum number of records that can have Letta reports waiting for editorial work.
 * Controlled via MAX_EDITORIAL_BACKLOG env var. Defaults to 50.
 *
 * This is a cost-control measure: we only process records through Letta if there
 * are fewer than this many records already processed and waiting for editorial work.
 */
const MAX_EDITORIAL_BACKLOG = Number.isNaN(envVal) || envVal <= 0 ? 50 : envVal;

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
 * - `claim_di_audit_targets`: atomically claims records based on editorial backlog limit
 *   by setting their `compliance_status` to 'pending' if it was NULL.
 *   This prevents multiple parallel workflow runs from auditing the same record.
 *
 * @param serviceIds - List of service IDs to scope the query (DI services only).
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
      max_editorial_backlog: MAX_EDITORIAL_BACKLOG,
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
 * For each record:
 * 1. Calls Letta agent with /audit command.
 * 2. Parses the compliance report.
 * 3. Stores the report in `letta_reports`.
 * 4. Links it back to `ingestion_records`.
 *
 * @param runId - The ID of the current ingestion run. Used for logging context.
 * @returns A summary object with `attempted`, `succeeded`, `failed`,
 *          `totalCandidates`, and `skipped` counts.
 * @throws If the Letta agent ID environment variable is missing.
 */
export async function generateDiAuditReportsStep(runId: string) {
  "use step";

  const stepMeta = getStepMetadata();
  if (stepMeta.attempt > 1) {
    logger.info(
      { runId, attempt: stepMeta.attempt },
      `↻ Audit step retry attempt ${stepMeta.attempt}`,
    );
  }

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
    throw new FatalError("PLAYGROUND_AGENT_ID is not defined");
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

      // Set compliance_status on ingestion_records — compliant iff complete + not duplicate (RI-1117, RI-1093)
      const complianceStatus =
        parsed.status !== "complete"
          ? "error"
          : parsed.metadata.compliant && !parsed.metadata.duplicate
            ? "compliant"
            : "non_compliant";

      const { error: complianceError } = await supabase
        .from("ingestion_records")
        .update({ compliance_status: complianceStatus })
        .eq("id", target.id);

      if (complianceError) {
        logger.error(
          { error: complianceError, ingestionRecordId: target.id },
          "Failed to update ingestion_record compliance status",
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

// 3 retries by default (same as workflow default, made explicit for documentation)
generateDiAuditReportsStep.maxRetries = 3;

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

  if (workflowError || !workflow?.ingestion_record_id) {
    logger.error(
      { workflowId, error: workflowError },
      "Workflow or Ingestion Record not found for forced audit",
    );
    throw new Error("Workflow or Ingestion Record not found");
  }

  const ingestionRecordId = workflow.ingestion_record_id;

  // Set compliance status to pending on ingestion_records (RI-1093)
  // Include updated_at to ensure zombie reclamation works correctly
  await supabase
    .from("ingestion_records")
    .update({
      compliance_status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", ingestionRecordId);

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
    throw new FatalError("PLAYGROUND_AGENT_ID is not defined");
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

    // Set compliance_status on ingestion_records — compliant iff complete + not duplicate (RI-1117, RI-1093)
    const finalComplianceStatus =
      parsed.status !== "complete"
        ? "error"
        : parsed.metadata.compliant && !parsed.metadata.duplicate
          ? "compliant"
          : "non_compliant";

    const { error: finalStatusError } = await supabase
      .from("ingestion_records")
      .update({ compliance_status: finalComplianceStatus })
      .eq("id", ingestionRecordId);

    if (finalStatusError) {
      logger.error(
        { error: finalStatusError, ingestionRecordId },
        "Failed to update ingestion_record final status",
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

    // FINAL SECURITY: Ensure ingestion_record is no longer 'pending' if we hit an error (RI-1093)
    try {
      await supabase
        .from("ingestion_records")
        .update({ compliance_status: "error" })
        .eq("id", ingestionRecordId);
    } catch (dbError) {
      logger.error(
        { dbError, ingestionRecordId },
        "Failed to force error status on catch",
      );
    }

    throw error;
  }
}
