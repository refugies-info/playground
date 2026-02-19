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
 *         └── [4a] generateDiMetadataReportsStep  ◄── THIS FILE
 *                   │
 *                   ├── fetchDiMetadataTargets()
 *                   │         └── RPC: fetch_di_metadata_candidates
 *                   │             (no service IDs needed — scoped to DI via JOIN)
 *                   │
 *                   └── For each target:
 *                             ├── generateMetadataReport()  [Letta agent]
 *                             ├── parseAgentResponse()
 *                             └── Insert into letta_reports (type: 'metadata')
 *
 * Key decisions:
 * - Does NOT create editorial_records (unlike persistMetadataReportStep)
 * - Idempotent: records already having a metadata report are filtered out by the RPC
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
 * linked to its workflow. DI scoping is handled server-side via a JOIN on
 * `di_services` — no need to pass service IDs.
 *
 * @returns An object containing the list of eligible targets.
 * @throws If the RPC call fails.
 */
async function fetchDiMetadataTargets(): Promise<{
  targets: DiMetadataTarget[];
}> {
  const supabase = getSupabaseClient();

  // @ts-expect-error: RPC not yet in generated types (added in migration 20260220090000)
  const { data, error } = await supabase.rpc("fetch_di_metadata_candidates", {
    p_limit: MAX_PENDING_AUDITS,
  });

  if (error) {
    throw new Error(
      `Failed to fetch metadata candidates: ${JSON.stringify(error)}`,
    );
  }

  return {
    targets: (data as DiMetadataTarget[]) || [],
  };
}

// =============================================================================
// Step
// =============================================================================

/**
 * Workflow step that generates metadata reports for DI ingestion records.
 *
 * This step is idempotent: records that already have a `letta_report` of type
 * 'metadata' are skipped automatically by the `fetch_di_metadata_candidates`
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
