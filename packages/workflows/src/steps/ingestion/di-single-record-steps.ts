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
  MetadataMetadataSchema,
  parseAgentResponse,
  parseIngestionResponse,
} from "@playground/agents";
import { logger } from "@playground/shared-types";
import type { Json } from "@playground/supabase";
import { FatalError, getStepMetadata, RetryableError } from "workflow";
import { start } from "workflow/api";
import { diSingleRecordWorkflow } from "../../pipelines/ingestion/di-single-record";
import { fetchAllDiServiceIds, getSupabaseClient } from "./utils";

// =============================================================================
// Config
// =============================================================================

const envVal = Number(process.env.MAX_PENDING_AUDITS);

/**
 * Maximum number of records that can be in 'pending' audit state at once.
 */
const MAX_PENDING_AUDITS = Number.isNaN(envVal) || envVal <= 0 ? 50 : envVal;

// =============================================================================
// Internal Types
// =============================================================================

type DiAuditTarget = {
  id: string;
  markdown: string;
  workflow_id: string;
};

// =============================================================================
// Step: Single Audit
// =============================================================================

export async function diSingleAuditStep(
  ingestionRecordId: string,
  workflowId: string,
  markdown: string,
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

  try {
    for await (const chunk of generateIngestionReport(
      lettaClient,
      markdown,
      conversationId,
    )) {
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

  return { reportId: report.id, complianceStatus };
}

diSingleAuditStep.maxRetries = 3;

// =============================================================================
// Step: Single Metadata
// =============================================================================

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

  try {
    for await (const chunk of generateMetadataReport(
      lettaClient,
      markdown,
      conversationId,
    )) {
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

  const parsed = parseAgentResponse(
    finalContent,
    agentId,
    MetadataMetadataSchema,
  );

  const { error: reportError } = await supabase.from("letta_reports").insert({
    agent_id: agentId,
    report_type: "metadata",
    markdown: parsed.content,
    metadata: parsed.metadata as Json,
    status: parsed.status,
    raw_response: parsed.rawResponse ?? null,
    workflow_id: workflowId,
  });

  if (reportError) {
    throw new Error(
      `Failed to insert metadata letta_report: ${reportError.message}`,
    );
  }

  logger.info(
    { ingestionRecordId, workflowId, reportStatus: parsed.status },
    `✔ Single metadata done (${parsed.status})`,
  );
}

diSingleMetadataStep.maxRetries = 3;

// =============================================================================
// Step: Fan-Out Claim
// =============================================================================

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
      max_total_pending: MAX_PENDING_AUDITS,
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
    logger.info(
      { runId, claimed: targets.length, totalCandidates, skipped },
      `▶ Claimed ${targets.length} record(s) for audit+metadata (${skipped} skipped / ${totalCandidates} total)`,
    );
  }

  return { targets, totalCandidates, skipped };
}

// =============================================================================
// Step: Fan-Out (claim + spawn child workflows)
// =============================================================================

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
    await start(diSingleRecordWorkflow, [
      target.id,
      target.workflow_id,
      target.markdown,
    ]);
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
