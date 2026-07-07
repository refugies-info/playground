/**
 * @file metadata-di-step.ts
 *
 * Workflow Step: Generate DI Metadata Reports
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
 *         ├── [4] generateDiAuditReportsStep → audit-di-step.ts
 *         │         (runs FIRST — sets ingestion_report_id)
 *         │
 *         └── [5] generateDiMetadataReportsStep  ◄── THIS FILE
 *                   │
 *                   ├── fetchDiMetadataTargets()
 *                   │         └── Supabase query on ingestion_records
 *                   │             + !inner join on di_services (DI scoping)
 *                   │             + !inner join on workflows (get workflow_id)
 *                   │             + only compliant records with ingestion_report_id (audited)
 *                   │             + exclude records with existing metadata report
 *                   │
 *                   └── For each target:
 *                             ├── generateMetadataReport()  [Letta agent]
 *                             ├── parseAgentResponse()
 *                             └── Insert into letta_reports (type: 'metadata')
 *
 * Key decisions:
 * - Runs AFTER audit step to guarantee same workflow alignment
 * - Only targets compliant records with ingestion_report_id (already audited)
 * - Does NOT create editorial_records (unlike persistMetadataReportStep)
 * - Idempotent: records already having a metadata report are filtered out
 * - Uses METADATA_AGENT_ID env var, falls back to PLAYGROUND_AGENT_ID
 */

import { APIError } from "@letta-ai/letta-client/error";
import {
  createLettaClient,
  findOrCreateConversation,
  generateMetadataReport,
  getRunUsage,
  type LettaUsage,
  MetadataMetadataSchema,
  parseAgentResponse,
} from "@playground/agents";
import { LETTA_MODEL_NAME, logger } from "@playground/shared-types";
import type { Json } from "@playground/supabase";
import { getStepMetadata } from "@workflow/core";
import { FatalError } from "@workflow/errors";
import { z } from "zod";
import { getSupabaseClient, runWithConcurrency } from "./utils";

// =============================================================================
// Config
// =============================================================================

const envVal = Number(process.env.MAX_EDITORIAL_BACKLOG);

/**
 * Maximum number of metadata records to process per run. Defaults to 50.
 *
 * Note: Used by the legacy batch workflow (generateDiMetadataReportsStep).
 * The main fan-out workflow uses diSingleMetadataStep which doesn't need this
 * limit since it processes one record at a time.
 */
const MAX_EDITORIAL_BACKLOG = Number.isNaN(envVal) || envVal <= 0 ? 50 : envVal;

/**
 * Maximum number of metadata LLM calls running in parallel.
 * Each concurrent call uses its own Letta conversation to avoid context mixing.
 */
const METADATA_CONCURRENCY = 5;

// =============================================================================
// Schema
// =============================================================================

/**
 * Input schema for the generateDiMetadataReportsStep.
 * Mainly used for documentation and runtime validation at the workflow boundary.
 */
export const GenerateDiMetadataReportsStepSchema = z.object({
  runId: z.string().describe("The ID of the current ingestion run"),
});

export type GenerateDiMetadataReportsStepInput = z.infer<
  typeof GenerateDiMetadataReportsStepSchema
>;

// =============================================================================
// Internal Types
// =============================================================================

/** A record claimed for metadata generation. */
type DiMetadataTarget = {
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
 * Fetches ingestion records that are eligible for metadata generation.
 *
 * Eligibility: the record is a compliant audited DI ingestion record without a
 * metadata report linked to the exact ingestion version. The workflow may point
 * to this record through either active or latest ingestion source.
 *
 * @returns An object containing the list of eligible targets.
 */
async function fetchDiMetadataTargets(): Promise<{
  targets: DiMetadataTarget[];
}> {
  const supabase = getSupabaseClient();

  // Fetch compliant audited DI records that do not yet have metadata for this
  // exact ingestion version. Non-compliant records should not get metadata, and
  // pending updates must not be skipped merely because their workflow already has
  // a metadata report for the active source.
  const { data: records, error } = await supabase
    .from("ingestion_records")
    .select(
      `
      id,
      markdown,
      di_services!inner ( id )
    `,
    )
    .not("ingestion_report_id", "is", null)
    .is("metadata_report_id", null)
    .eq("compliance_status", "compliant")
    .order("created_at", { ascending: false })
    .limit(MAX_EDITORIAL_BACKLOG);

  if (error) {
    throw new Error(
      `Failed to fetch metadata candidates: ${JSON.stringify(error)}`,
    );
  }

  if (!records || records.length === 0) {
    return { targets: [] };
  }

  const recordIds = records.map((record) => record.id as string);
  const recordIdsFilter = recordIds.join(",");

  const { data: workflows, error: workflowError } = await supabase
    .from("workflows")
    .select("id, ingestion_record_id, latest_ingestion_record_id")
    .or(
      `ingestion_record_id.in.(${recordIdsFilter}),latest_ingestion_record_id.in.(${recordIdsFilter})`,
    );

  if (workflowError) {
    throw new Error(
      `Failed to fetch workflows for metadata candidates: ${JSON.stringify(workflowError)}`,
    );
  }

  const workflowByRecordId = new Map<string, string>();
  for (const workflow of workflows ?? []) {
    if (workflow.ingestion_record_id) {
      workflowByRecordId.set(workflow.ingestion_record_id, workflow.id);
    }
    if (workflow.latest_ingestion_record_id) {
      workflowByRecordId.set(workflow.latest_ingestion_record_id, workflow.id);
    }
  }

  const targets: DiMetadataTarget[] = records
    .map((record) => {
      const recordId = record.id as string;
      const workflowId = workflowByRecordId.get(recordId);
      if (!workflowId) return null;
      return {
        id: recordId,
        markdown: record.markdown as string,
        workflow_id: workflowId,
      };
    })
    .filter((target): target is DiMetadataTarget => target !== null);

  if (targets.length < records.length) {
    logger.warn(
      { orphanCount: records.length - targets.length },
      "Some metadata candidates were skipped because no workflow references them",
    );
  }

  return { targets };
}

// =============================================================================
// Step
// =============================================================================

/**
 * Workflow step that generates metadata reports for DI ingestion records.
 *
 * This step is idempotent: records that already have a `letta_report` of type
 * 'metadata' are skipped automatically by `fetchDiMetadataTargets`.
 * RPC.
 *
 * **Does NOT** create or update `editorial_records`. Report creation only.
 *
 * @param runId - The ID of the current ingestion run. Used for logging context.
 * @returns A summary object with `attempted`, `succeeded`, and `failed` counts.
 * @throws If the Letta agent ID environment variable is missing.
 */
export async function generateDiMetadataReportsStep(runId: string) {
  "use step";

  const stepMeta = getStepMetadata();

  if (stepMeta.attempt > 1) {
    logger.info(
      { runId, attempt: stepMeta.attempt },
      `↻ Metadata step retry attempt ${stepMeta.attempt}`,
    );
  }

  const { targets } = await fetchDiMetadataTargets();

  if (targets.length === 0) {
    logger.info({ runId }, "No candidates found for metadata reporting");
    return {
      attempted: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
    };
  }

  const agentId =
    process.env.METADATA_AGENT_ID || process.env.PLAYGROUND_AGENT_ID;

  if (!agentId) {
    // FatalError: no point retrying without a valid agent ID
    throw new FatalError(
      "METADATA_AGENT_ID or PLAYGROUND_AGENT_ID is not defined",
    );
  }

  const lettaClient = createLettaClient();
  const supabase = getSupabaseClient();

  logger.info(
    { runId, total: targets.length, agentId },
    `▶ Metadata step — processing ${targets.length} record(s) with concurrency ${METADATA_CONCURRENCY}`,
  );

  // Process targets in parallel (each gets its own conversation to avoid
  // context mixing). runWithConcurrency limits simultaneous LLM calls.
  const results = await runWithConcurrency(
    targets.map((target) => async () => {
      logger.info(
        { workflowId: target.workflow_id, ingestionRecordId: target.id },
        "▶ Starting metadata generation for record",
      );

      const conversationId = await findOrCreateConversation(
        lettaClient,
        agentId,
        `metadata-${target.workflow_id}`,
      );

      let finalContent = "";
      let usage: LettaUsage | undefined;
      let chunkRunId: string | undefined;

      for await (const chunk of generateMetadataReport(
        lettaClient,
        target.markdown,
        conversationId,
      )) {
        if (!chunkRunId && chunk.run_id) {
          chunkRunId = chunk.run_id;
        }
        if (chunk.usage) {
          usage = chunk.usage;
        }
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
        throw new Error("No assistant response received for metadata report");
      }

      if (!usage && chunkRunId) {
        usage = await getRunUsage(lettaClient, chunkRunId);
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
          workflow_id: target.workflow_id,
          token_cost: usage?.totalTokens ?? null,
          model: LETTA_MODEL_NAME,
        })
        .select("id")
        .single();

      if (reportError || !report) {
        throw new Error(
          `Failed to insert letta_report: ${reportError?.message ?? "unknown error"}`,
        );
      }

      const { error: linkError } = await supabase
        .from("ingestion_records")
        .update({ metadata_report_id: report.id })
        .eq("id", target.id);

      if (linkError) {
        throw new Error(
          `Failed to set metadata_report_id on record: ${linkError.message}`,
        );
      }

      logger.info(
        {
          workflowId: target.workflow_id,
          ingestionRecordId: target.id,
          reportId: report.id,
          reportStatus: parsed.status,
        },
        `✔ Metadata report stored (status: ${parsed.status})`,
      );
    }),
    METADATA_CONCURRENCY,
  );

  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      succeeded += 1;
      logger.info(
        {
          workflowId: targets[i].workflow_id,
          progress: `${succeeded + failed}/${targets.length}`,
        },
        `✔ [${succeeded + failed}/${targets.length}] Metadata succeeded`,
      );
    } else {
      failed += 1;
      const target = targets[i];
      const error = result.reason;

      if (error instanceof APIError) {
        logger.error(
          { status: error.status, body: error.error },
          "Letta API error generating DI metadata report",
        );
      } else {
        logger.error(
          {
            err: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            ingestionRecordId: target.id,
          },
          "Error generating DI metadata report",
        );
      }

      // Insert an error letta_report so the failure is visible in the UI
      // and the workflow can be manually retried. The idempotency filter
      // skips only 'success' reports so this record will be retried next run.
      try {
        await supabase.from("letta_reports").insert({
          agent_id: agentId,
          report_type: "metadata",
          markdown: "",
          metadata: {} as Json,
          status: "error",
          raw_response: error instanceof Error ? error.message : String(error),
          workflow_id: target.workflow_id,
          model: LETTA_MODEL_NAME,
        });
      } catch (dbError) {
        logger.error(
          { dbError, workflowId: target.workflow_id },
          "Failed to insert error letta_report for metadata",
        );
      }
    }
  }

  return {
    attempted: targets.length,
    succeeded,
    failed,
  };
}

// 3 retries by default (same as workflow default, made explicit for documentation)
generateDiMetadataReportsStep.maxRetries = 3;

/**
 * Workflow step that forces generation of a metadata report for a specific workflow,
 * bypassing normal batch collection. Used primarily for manual arbitration/retry.
 *
 * @param workflowId - The ID of the workflow to force metadata for.
 */
export async function forceMetadataReportStep(workflowId: string) {
  "use step";

  const supabase = getSupabaseClient();

  // 0. Resolve agent ID early — needed for the "generating" sentinel insert.
  const agentId =
    process.env.METADATA_AGENT_ID || process.env.PLAYGROUND_AGENT_ID;

  if (!agentId) {
    throw new FatalError(
      "METADATA_AGENT_ID or PLAYGROUND_AGENT_ID is not defined",
    );
  }

  // 0.1 Guard: block concurrent generation for this workflow.
  // If a "generating" report already exists, another request is in flight —
  // abort immediately to avoid a 409 conflict from the Letta API.
  const { data: existingGenerating } = await supabase
    .from("letta_reports")
    .select("id")
    .eq("workflow_id", workflowId)
    .eq("report_type", "metadata")
    .eq("status", "generating")
    .maybeSingle();

  if (existingGenerating) {
    throw new FatalError(
      `Metadata generation already in progress for workflow ${workflowId}`,
    );
  }

  // 0.2 Insert a "generating" sentinel report to track in-progress state.
  // This allows the UI to restore the loading state after a page refresh,
  // and prevents concurrent calls from racing into the Letta API.
  // The report will be updated (not replaced) once generation completes.
  const { data: generatingReport, error: generatingInsertError } =
    await supabase
      .from("letta_reports")
      .insert({
        agent_id: agentId,
        report_type: "metadata",
        status: "generating",
        markdown: "",
        metadata: {} as Json,
        workflow_id: workflowId,
        model: LETTA_MODEL_NAME,
      })
      .select("id")
      .single();

  if (generatingInsertError || !generatingReport) {
    throw new Error(
      `Failed to insert generating report: ${generatingInsertError?.message ?? "unknown error"}`,
    );
  }

  const generatingReportId = generatingReport.id;

  // Everything below is wrapped in a single try/catch so that any failure
  // (fetching data, calling Letta, parsing response) always updates the
  // sentinel to "error" — preventing a stuck "generating" report.
  let ingestionRecordId: string | undefined;

  try {
    // 1. Fetch workflow to get ingestion_record_id and editorial_record_id
    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .select("ingestion_record_id, editorial_record_id")
      .eq("id", workflowId)
      .single();

    if (workflowError || !workflow?.ingestion_record_id) {
      logger.error(
        { workflowId, error: workflowError },
        "Workflow or Ingestion Record not found for forced metadata",
      );
      throw new Error("Workflow or Ingestion Record not found");
    }

    ingestionRecordId = workflow.ingestion_record_id;
    const editorialRecordId = workflow.editorial_record_id ?? null;

    // 2. Fetch Ingestion Record
    const { data: record, error: recordError } = await supabase
      .from("ingestion_records")
      .select("id, markdown")
      .eq("id", ingestionRecordId)
      .single();

    if (recordError || !record) {
      throw new Error(`Ingestion Record not found: ${recordError?.message}`);
    }

    const lettaClient = createLettaClient();
    const conversationId = await findOrCreateConversation(
      lettaClient,
      agentId,
      `metadata-${workflowId}`,
    );

    logger.info(
      { workflowId, ingestionRecordId },
      "Starting forced metadata generation",
    );

    let finalContent = "";
    let usage: LettaUsage | undefined;
    let chunkRunId: string | undefined;

    for await (const chunk of generateMetadataReport(
      lettaClient,
      record.markdown,
      conversationId,
    )) {
      if (!chunkRunId && chunk.run_id) {
        chunkRunId = chunk.run_id;
      }
      if (chunk.usage) {
        usage = chunk.usage;
      }
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
      throw new Error("No assistant response received for metadata report");
    }

    if (!usage && chunkRunId) {
      usage = await getRunUsage(lettaClient, chunkRunId);
    }

    const parsed = parseAgentResponse(
      finalContent,
      agentId,
      MetadataMetadataSchema,
      usage,
    );

    // UPDATE the "generating" report with the final result.
    // Triggers a Realtime UPDATE event on the UI to unblock the spinner.
    const { data: report, error: reportError } = await supabase
      .from("letta_reports")
      .update({
        markdown: parsed.content,
        metadata: parsed.metadata as Json,
        status: parsed.status,
        raw_response: parsed.rawResponse ?? null,
        token_cost: usage?.totalTokens ?? null,
      })
      .eq("id", generatingReportId)
      .select("id")
      .single();

    if (reportError || !report) {
      throw new Error(
        `Failed to update letta_report: ${reportError?.message ?? "unknown error"}`,
      );
    }

    const { error: linkIngestionError } = await supabase
      .from("ingestion_records")
      .update({ metadata_report_id: report.id })
      .eq("id", ingestionRecordId);

    if (linkIngestionError) {
      throw new Error(
        `Failed to set metadata_report_id on record: ${linkIngestionError.message}`,
      );
    }

    // 4. Clear editorial metadata overrides so the fresh AI report is used
    // as the new baseline — stale manual overrides from the previous version
    // would otherwise silently shadow the regenerated values.
    // Best-effort: don't throw if this fails, the report was already persisted.
    if (editorialRecordId) {
      logger.info(
        { editorialRecordId },
        "Clearing editorial metadata overrides after regeneration",
      );
      const { error: clearError } = await supabase
        .from("editorial_records")
        .update({ metadata: {} as Json })
        .eq("id", editorialRecordId);

      if (clearError) {
        logger.error(
          { editorialRecordId, error: clearError },
          "Failed to clear editorial metadata overrides after regeneration",
        );
      } else {
        logger.info(
          { editorialRecordId },
          "Cleared editorial metadata overrides after regeneration",
        );
      }
    }

    logger.info(
      { workflowId, reportId: report.id },
      "Forced metadata generation completed successfully",
    );

    return { success: true, reportId: report.id };
  } catch (error) {
    if (error instanceof APIError) {
      logger.error(
        { status: error.status, body: error.error },
        "Letta API error generating forced metadata report",
      );
    } else {
      logger.error(
        { error, ingestionRecordId },
        "Error generating forced metadata report",
      );
    }

    // UPDATE the "generating" report to "error" status.
    // Triggers a Realtime UPDATE event on the UI to unblock the spinner.
    try {
      await supabase
        .from("letta_reports")
        .update({
          status: "error",
          raw_response: error instanceof Error ? error.message : String(error),
        })
        .eq("id", generatingReportId);
    } catch (dbError) {
      logger.error(
        { dbError, workflowId },
        "Failed to update error status for forced metadata report",
      );
    }

    throw error;
  }
}
