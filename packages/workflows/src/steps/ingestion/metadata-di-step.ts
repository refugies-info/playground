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
 *                   │             + only records with ingestion_report_id (audited)
 *                   │             + exclude records with existing metadata report
 *                   │
 *                   └── For each target:
 *                             ├── generateMetadataReport()  [Letta agent]
 *                             ├── parseAgentResponse()
 *                             └── Insert into letta_reports (type: 'metadata')
 *
 * Key decisions:
 * - Runs AFTER audit step to guarantee same workflow alignment
 * - Only targets records with ingestion_report_id (already audited)
 * - Does NOT create editorial_records (unlike persistMetadataReportStep)
 * - Idempotent: records already having a metadata report are filtered out
 * - Uses METADATA_AGENT_ID env var, falls back to PLAYGROUND_AGENT_ID
 */

import { APIError } from "@letta-ai/letta-client/error";
import {
  createLettaClient,
  generateMetadataReport,
  MetadataMetadataSchema,
  parseAgentResponse,
} from "@playground/agents";
import { logger } from "@playground/shared-types";
import type { Json } from "@playground/supabase";
import { z } from "zod";
import { getSupabaseClient } from "./utils";

// =============================================================================
// Config
// =============================================================================

const envVal = Number(process.env.MAX_PENDING_AUDITS);

/**
 * Maximum number of metadata records to process per run.
 * Shared with the audit step via MAX_PENDING_AUDITS env var. Defaults to 50.
 */
const MAX_PENDING_AUDITS = Number.isNaN(envVal) || envVal <= 0 ? 50 : envVal;

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
 * Eligibility: the record has no existing `letta_report` of type 'metadata'
 * linked to its workflow. Scoped to DI records via an `!inner` join on
 * `di_services` (same pool as the audit step).
 *
 * @returns An object containing the list of eligible targets.
 */
async function fetchDiMetadataTargets(): Promise<{
  targets: DiMetadataTarget[];
}> {
  const supabase = getSupabaseClient();

  // Fetch ingestion records scoped to DI via !inner join on di_services,
  // with their linked workflow ID.
  const { data: records, error } = await supabase
    .from("ingestion_records")
    .select(
      `
      id,
      markdown,
      di_services!inner ( id ),
      workflows!inner ( id )
    `,
    )
    .not("ingestion_report_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(MAX_PENDING_AUDITS);

  if (error) {
    throw new Error(
      `Failed to fetch metadata candidates: ${JSON.stringify(error)}`,
    );
  }

  if (!records || records.length === 0) {
    return { targets: [] };
  }

  // Extract workflow IDs from the joined data
  const candidateWorkflowIds = records
    .map((r) => {
      const w = Array.isArray(r.workflows) ? r.workflows[0] : r.workflows;
      return w?.id;
    })
    .filter(Boolean) as string[];

  // Exclude candidates that already have a metadata report
  const { data: existingReports } = await supabase
    .from("letta_reports")
    .select("workflow_id")
    .in("workflow_id", candidateWorkflowIds)
    .eq("report_type", "metadata");

  const existingWorkflowIds = new Set(
    existingReports?.map((r) => r.workflow_id) ?? [],
  );

  const targets: DiMetadataTarget[] = records
    .map((r) => {
      const w = Array.isArray(r.workflows) ? r.workflows[0] : r.workflows;
      const workflowId = w?.id;
      if (!workflowId || existingWorkflowIds.has(workflowId)) return null;
      return {
        id: r.id as string,
        markdown: r.markdown as string,
        workflow_id: workflowId as string,
      };
    })
    .filter(Boolean) as DiMetadataTarget[];

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
    throw new Error("METADATA_AGENT_ID or PLAYGROUND_AGENT_ID is not defined");
  }

  const lettaClient = createLettaClient();
  const conversation = await lettaClient.conversations.create({
    agent_id: agentId,
  });
  const conversationId = conversation.id;
  const supabase = getSupabaseClient();

  logger.info(
    { runId, selected: targets.length },
    "DI metadata report selection",
  );

  let succeeded = 0;
  let failed = 0;

  for (const target of targets) {
    let finalContent = "";

    try {
      for await (const chunk of generateMetadataReport(
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
        throw new Error("No assistant response received for metadata report");
      }

      const parsed = parseAgentResponse(
        finalContent,
        agentId,
        MetadataMetadataSchema,
      );

      const { error: reportError } = await supabase
        .from("letta_reports")
        .insert({
          agent_id: agentId,
          report_type: "metadata",
          markdown: parsed.content,
          metadata: parsed.metadata as Json,
          status: parsed.status,
          raw_response: parsed.rawResponse ?? null,
          workflow_id: target.workflow_id,
        });

      if (reportError) {
        throw new Error(
          `Failed to insert letta_report: ${reportError.message}`,
        );
      }

      succeeded += 1;
    } catch (error) {
      failed += 1;

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
    }
  }

  return {
    attempted: targets.length,
    succeeded,
    failed,
  };
}

/**
 * Workflow step that forces generation of a metadata report for a specific workflow,
 * bypassing normal batch collection. Used primarily for manual arbitration/retry.
 *
 * @param workflowId - The ID of the workflow to force metadata for.
 */
export async function forceMetadataReportStep(workflowId: string) {
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
      "Workflow or Ingestion Record not found for forced metadata",
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

  const agentId =
    process.env.METADATA_AGENT_ID || process.env.PLAYGROUND_AGENT_ID;

  if (!agentId) {
    throw new Error("METADATA_AGENT_ID or PLAYGROUND_AGENT_ID is not defined");
  }

  const lettaClient = createLettaClient();
  const conversation = await lettaClient.conversations.create({
    agent_id: agentId,
  });
  const conversationId = conversation.id;

  logger.info(
    { workflowId, ingestionRecordId },
    "Starting forced metadata generation",
  );

  let finalContent = "";

  try {
    for await (const chunk of generateMetadataReport(
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
      throw new Error("No assistant response received for metadata report");
    }

    const parsed = parseAgentResponse(
      finalContent,
      agentId,
      MetadataMetadataSchema,
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
      })
      .select("id")
      .single();

    if (reportError || !report) {
      throw new Error(
        `Failed to insert letta_report: ${reportError?.message ?? "unknown error"}`,
      );
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

    throw error;
  }
}
