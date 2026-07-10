/**
 * @file di-single-record-steps.ts
 *
 * Steps for the DI Single Record Workflow fan-out architecture.
 * Contains only "use step" functions to avoid bundler confusion.
 */

import { APIError } from "@letta-ai/letta-client/error";
import {
  createLettaClient,
  findOrCreateConversation,
  generateIngestionReport,
  generateMetadataReport,
  getRunUsage,
  type LettaUsage,
  MetadataMetadataSchema,
  parseAgentResponse,
  parseIngestionResponse,
} from "@playground/agents";
import {
  LETTA_MODEL_NAME,
  logger,
  TYPE_COMPLIANCE_IA,
  TYPE_UPDATE,
  TYPE_UPDATE_COMPLIANCE,
} from "@playground/shared-types";
import type { Json } from "@playground/supabase";
import { getStepMetadata } from "@workflow/core";
import { start } from "@workflow/core/runtime";
import { FatalError, RetryableError } from "@workflow/errors";
import { diSingleRecordWorkflow } from "../../pipelines/ingestion/di-single-record";
import { recordActivity } from "../common/activity-log";
import { fetchAllDiServiceIds, getSupabaseClient } from "./utils";

// =============================================================================
// Config
// =============================================================================

const envVal = Number(process.env.MAX_EDITORIAL_BACKLOG);

/**
 * Maximum number of records claimed per cron run. Defaults to 50.
 */
const MAX_EDITORIAL_BACKLOG = Number.isNaN(envVal) || envVal <= 0 ? 50 : envVal;

/**
 * Delay between spawning child workflows to spread Letta API calls over time
 * and avoid hitting the rate limit.
 */
const SPAWN_DELAY_MS = 500;

// =============================================================================
// Internal Types
// =============================================================================

type DiAuditTarget = {
  id: string;
  markdown: string;
  workflow_id: string;
  is_pending_update: boolean;
};

// =============================================================================
// Step: Single Audit
// =============================================================================

/**
 * Workflow step that generates an audit (compliance) report for a single DI record.
 *
 * Each record is processed independently within its own workflow, allowing for
 * granular retry and parallel execution.
 *
 * @param ingestionRecordId - The ID of the ingestion record to audit.
 * @param workflowId - The ID of the associated workflow.
 * @param markdown - The markdown content to audit.
 * @param hasPreviousVersion - True when this record is a new version pulled in for
 *   an already-existing fiche (drives the TYPE_UPDATE activity log).
 */
export async function diSingleAuditStep(
  ingestionRecordId: string,
  workflowId: string,
  markdown: string,
  hasPreviousVersion = false,
) {
  "use step";

  const stepMeta = getStepMetadata();
  if (stepMeta.attempt > 1) {
    logger.info(
      { ingestionRecordId, workflowId, attempt: stepMeta.attempt },
      `↻ Single audit step retry attempt ${stepMeta.attempt}`,
    );
  }

  const agentId = process.env.PLAYGROUND_AGENT_ID;
  if (!agentId) {
    throw new FatalError("PLAYGROUND_AGENT_ID is not defined");
  }

  const lettaClient = createLettaClient();
  const supabase = getSupabaseClient();

  logger.info(
    { ingestionRecordId, workflowId },
    "▶ Starting single audit Letta call",
  );

  const conversationId = await findOrCreateConversation(
    lettaClient,
    agentId,
    `compliance-${workflowId}`,
  );

  let finalContent = "";
  let usage: LettaUsage | undefined;
  let runId: string | undefined;

  try {
    for await (const chunk of generateIngestionReport(
      lettaClient,
      markdown,
      conversationId,
    )) {
      if (!runId && chunk.run_id) {
        runId = chunk.run_id;
      }
      if (chunk.message_type === "assistant_message") {
        if (typeof chunk.content !== "string") {
          throw new Error(
            `Expected string content, got ${typeof chunk.content}`,
          );
        }
        finalContent += chunk.content;
      }
    }
  } catch (error) {
    if (error instanceof APIError) {
      if (error.status === 401 || error.status === 403) {
        throw new FatalError(
          `Letta authentication error (${error.status}) — check PLAYGROUND_AGENT_ID and API key`,
        );
      }
      if (error.status === 429) {
        throw new RetryableError("Letta rate limited on audit", {
          retryAfter: "1m",
        });
      }
      throw new RetryableError(`Letta API error: ${error.status}`, {
        retryAfter: `${stepMeta.attempt ** 2 * 30}s`,
      });
    }
    throw error;
  }

  if (!finalContent) {
    throw new Error("No assistant response received for audit");
  }

  if (runId) {
    usage = await getRunUsage(lettaClient, runId);
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
      workflow_id: workflowId,
      token_cost: usage?.totalTokens ?? null,
      model: LETTA_MODEL_NAME,
    })
    .select("id")
    .single();

  if (reportError || !report) {
    throw new Error(
      `Failed to insert audit letta_report: ${reportError?.message ?? "unknown error"}`,
    );
  }

  const { error: linkError } = await supabase
    .from("ingestion_records")
    .update({ ingestion_report_id: report.id })
    .eq("id", ingestionRecordId);

  if (linkError) {
    throw new Error(
      `Failed to set ingestion_report_id on record: ${linkError.message}`,
    );
  }

  const complianceStatus =
    parsed.status !== "complete"
      ? "error"
      : parsed.metadata.compliant && !parsed.metadata.duplicate
        ? "compliant"
        : "non_compliant";

  const { error: complianceError } = await supabase
    .from("ingestion_records")
    .update({ compliance_status: complianceStatus })
    .eq("id", ingestionRecordId);

  if (complianceError) {
    logger.error(
      { error: complianceError, ingestionRecordId },
      "Failed to update compliance_status on ingestion_record",
    );
  }

  logger.info(
    { ingestionRecordId, workflowId, reportId: report.id, complianceStatus },
    `✔ Single audit done (${complianceStatus})`,
  );

  // Compliance verdict with PapaIA
  await recordActivity({
    action: hasPreviousVersion ? TYPE_UPDATE_COMPLIANCE : TYPE_COMPLIANCE_IA,
    workflowId,
    lettaReportId: report.id,
    activity: {
      complianceStatus,
      ingestionRecordId,
      compliant: Boolean(parsed.metadata.compliant),
      duplicate: Boolean(parsed.metadata.duplicate),
    },
  });

  return { reportId: report.id, complianceStatus };
}

diSingleAuditStep.maxRetries = 3;

// =============================================================================
// Step: Single Metadata
// =============================================================================

/**
 * Workflow step that generates a metadata report for a single DI record.
 *
 * Similar to audit, each metadata generation is isolated for better resilience.
 *
 * @param ingestionRecordId - The ID of the ingestion record.
 * @param workflowId - The ID of the associated workflow.
 * @param markdown - The markdown content to process.
 */
export async function diSingleMetadataStep(
  ingestionRecordId: string,
  workflowId: string,
  markdown: string,
) {
  "use step";

  const stepMeta = getStepMetadata();
  if (stepMeta.attempt > 1) {
    logger.info(
      { ingestionRecordId, workflowId, attempt: stepMeta.attempt },
      `↻ Single metadata step retry attempt ${stepMeta.attempt}`,
    );
  }

  const agentId =
    process.env.METADATA_AGENT_ID || process.env.PLAYGROUND_AGENT_ID;
  if (!agentId) {
    throw new FatalError(
      "METADATA_AGENT_ID or PLAYGROUND_AGENT_ID is not defined",
    );
  }

  const lettaClient = createLettaClient();
  const supabase = getSupabaseClient();

  logger.info(
    { ingestionRecordId, workflowId },
    "▶ Starting single metadata Letta call",
  );

  const conversationId = await findOrCreateConversation(
    lettaClient,
    agentId,
    `metadata-${workflowId}`,
  );

  let finalContent = "";
  let usage: LettaUsage | undefined;
  let runId: string | undefined;

  try {
    for await (const chunk of generateMetadataReport(
      lettaClient,
      markdown,
      conversationId,
    )) {
      if (!runId && chunk.run_id) {
        runId = chunk.run_id;
      }
      if (chunk.message_type === "assistant_message") {
        if (typeof chunk.content !== "string") {
          throw new Error(
            `Expected string content, got ${typeof chunk.content}`,
          );
        }
        finalContent += chunk.content;
      }
    }
  } catch (error) {
    if (error instanceof APIError) {
      if (error.status === 401 || error.status === 403) {
        throw new FatalError(
          `Letta authentication error (${error.status}) — check METADATA_AGENT_ID and API key`,
        );
      }
      if (error.status === 429) {
        throw new RetryableError("Letta rate limited on metadata", {
          retryAfter: "1m",
        });
      }
      throw new RetryableError(`Letta API error: ${error.status}`, {
        retryAfter: `${stepMeta.attempt ** 2 * 30}s`,
      });
    }
    throw error;
  }

  if (!finalContent) {
    throw new Error("No assistant response received for metadata");
  }

  if (runId) {
    usage = await getRunUsage(lettaClient, runId);
  }

  const parsed = parseAgentResponse(
    finalContent,
    agentId,
    MetadataMetadataSchema,
    usage,
  );

  const { data: report, error: reportError } = await supabase
    .from("letta_reports")
    .insert({
      agent_id: agentId,
      report_type: "metadata",
      markdown: parsed.content,
      metadata: parsed.metadata as Json,
      status: parsed.status,
      raw_response: parsed.rawResponse ?? null,
      workflow_id: workflowId,
      token_cost: usage?.totalTokens ?? null,
      model: LETTA_MODEL_NAME,
    })
    .select("id")
    .single();

  if (reportError || !report) {
    throw new Error(
      `Failed to insert metadata letta_report: ${reportError?.message ?? "unknown error"}`,
    );
  }

  const { error: linkError } = await supabase
    .from("ingestion_records")
    .update({ metadata_report_id: report.id })
    .eq("id", ingestionRecordId);

  if (linkError) {
    throw new Error(
      `Failed to set metadata_report_id on record: ${linkError.message}`,
    );
  }

  logger.info(
    {
      ingestionRecordId,
      workflowId,
      reportId: report.id,
      reportStatus: parsed.status,
    },
    `✔ Single metadata done (${parsed.status})`,
  );
}

diSingleMetadataStep.maxRetries = 3;

// =============================================================================
// Step: Fan-Out Claim
// =============================================================================

/**
 * Atomically claims records for audit and prepares them for fan-out.
 *
 * Uses RPC `claim_di_audit_targets` to lock records and prevent double processing.
 *
 * @param runId - The ingestion run ID.
 * @returns Array of claimed targets and total candidate count.
 */
export async function claimDiAuditTargetsStep(runId: string) {
  "use step";

  const supabase = getSupabaseClient();
  const serviceIds = await fetchAllDiServiceIds();

  if (serviceIds.length === 0) {
    logger.info({ runId }, "No DI services found — skipping fan-out");
    return { targets: [] as DiAuditTarget[], totalCandidates: 0 };
  }

  const { data: candidateCount, error: countError } = await supabase.rpc(
    "count_di_audit_candidates",
    { p_service_ids: serviceIds },
  );

  if (countError) {
    throw new RetryableError(
      `Failed to count audit candidates: ${JSON.stringify(countError)}`,
    );
  }

  const totalCandidates = candidateCount ?? 0;

  const { data, error: rpcError } = await supabase.rpc(
    "claim_di_audit_targets",
    {
      p_service_ids: serviceIds,
      max_editorial_backlog: MAX_EDITORIAL_BACKLOG,
    },
  );

  if (rpcError) {
    throw new RetryableError(
      `Failed to claim audit targets: ${rpcError.message}`,
    );
  }

  const targets = (data as DiAuditTarget[]) || [];
  const skipped = Math.max(0, totalCandidates - targets.length);

  if (targets.length === 0) {
    logger.info(
      { runId, totalCandidates },
      "No records to process in this fan-out run",
    );
  } else {
    const pendingUpdates = targets.filter((target) => target.is_pending_update);
    logger.info(
      {
        runId,
        claimed: targets.length,
        pendingUpdates: pendingUpdates.length,
        totalCandidates,
        skipped,
      },
      `▶ Claimed ${targets.length} record(s) for audit+metadata (${skipped} skipped / ${totalCandidates} total)`,
    );
  }

  return { targets, totalCandidates, skipped };
}

// =============================================================================
// Step: Fan-Out (claim + spawn child workflows)
// =============================================================================

/**
 * Orchestrates the fan-out by claiming records and spawning child workflows.
 *
 * This step:
 * 1. Claims record targets using {@link claimDiAuditTargetsStep}.
 * 2. Spawns a `diSingleRecordWorkflow` for each claimed record.
 *
 * @param runId - The ingestion run ID.
 * @returns Summary counts of total candidates and spawned workflows.
 */
export async function fanOutDiRecordsStep(runId: string) {
  "use step";

  const claimResult = await claimDiAuditTargetsStep(runId);

  if (claimResult.targets.length === 0) {
    return {
      spawned: 0,
      totalCandidates: claimResult.totalCandidates,
      skipped: claimResult.skipped,
    };
  }

  logger.info(
    { runId, spawning: claimResult.targets.length },
    `▶ Spawning ${claimResult.targets.length} diSingleRecordWorkflow(s)...`,
  );

  for (const target of claimResult.targets) {
    // Log the "new version pulled in" event at ingestion time, before the
    // arbitration step records PapaIA's verdict (TYPE_UPDATE_COMPLIANCE).
    if (target.is_pending_update) {
      await recordActivity({
        action: TYPE_UPDATE,
        workflowId: target.workflow_id,
        activity: { ingestionRecordId: target.id },
      });
    }

    await start(diSingleRecordWorkflow, [
      target.id,
      target.workflow_id,
      target.markdown,
      target.is_pending_update,
    ]);
    await new Promise((resolve) => setTimeout(resolve, SPAWN_DELAY_MS));
  }

  logger.info(
    { runId, spawned: claimResult.targets.length },
    `✔ Fan-out complete — ${claimResult.targets.length} child workflows spawned`,
  );

  return {
    spawned: claimResult.targets.length,
    totalCandidates: claimResult.totalCandidates,
    skipped: claimResult.skipped,
  };
}
