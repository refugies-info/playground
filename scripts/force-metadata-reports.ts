/**
 * Force re-generation of metadata reports
 *
 * This one-off script triggers metadata report generation for all ingestion
 * records that already have a compliance (audit) report completed.
 *
 * By default, it targets the **local** Supabase instance (env vars from `.env`).
 * Use `--prod` to target the production database (env vars from `.env.production`).
 *
 * The frontend fetches metadata from `letta_reports` directly via
 * `workflow_id` + `report_type = 'metadata'` (most recent first), so
 * no editorial_record linking is necessary — new reports will appear
 * automatically.
 *
 * Usage:
 *   pnpm force:metadata              # local (default)
 *   pnpm force:metadata --prod       # production (with confirmation prompt)
 *   pnpm force:metadata --dry-run    # preview only, no writes
 *   pnpm force:metadata --retry-failed  # retry only errored workflows
 *
 * Flags can be combined:
 *   pnpm force:metadata --prod --retry-failed --dry-run
 */

import * as path from "node:path";
import * as readline from "node:readline";
import {
  createLettaClient,
  findOrCreateConversation,
  generateMetadataReport,
  MetadataMetadataSchema,
  parseAgentResponse,
} from "@playground/agents";
import { logger } from "@playground/shared-types";
import { getSupabaseAdmin, type Json } from "@playground/supabase";
import * as dotenv from "dotenv";

// =============================================================================
// Config
// =============================================================================

const args = process.argv.slice(2);

const IS_PROD = args.includes("--prod");

// =============================================================================
// Environment loading
// =============================================================================

/**
 * Load the appropriate .env file based on --prod flag.
 * Local (.env) is loaded by default; --prod loads .env.production instead.
 */
function loadEnvironment(): void {
  if (IS_PROD) {
    // Clear critical vars to prevent silent fallback to local .env values
    // (tsx/dotenv may auto-load .env before we get here)
    for (const key of [
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "LETTA_API_KEY",
      "LETTA_PROJECT_ID",
      "PLAYGROUND_AGENT_ID",
      "METADATA_AGENT_ID",
    ]) {
      delete process.env[key];
    }

    const envPath = path.resolve(process.cwd(), ".env.production");
    const result = dotenv.config({ path: envPath, override: true });
    if (result.error) {
      logger.error(
        { path: envPath },
        "Failed to load .env.production — does the file exist? See .env.production.example",
      );
      process.exit(1);
    }
  } else {
    // Default: load .env (local dev)
    dotenv.config({ override: true });
  }
}

/**
 * Prompt the user for confirmation before running against production.
 * Returns true if user confirms, false otherwise.
 */
async function confirmProductionRun(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr,
  });

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "unknown";
  const _supabaseUrl =
    rawUrl.length > 47 ? `${rawUrl.substring(0, 44)}...` : rawUrl;

  return new Promise((resolve) => {
    rl.question("Continue? (y/N) ", (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

/** Unique timestamp per run to avoid Letta conversation conflicts on retry. */
const RUN_TIMESTAMP = Date.now();

/**
 * Maximum number of concurrent Letta agent calls.
 * Each call gets its own conversation to avoid context mixing.
 */
const CONCURRENCY = 5;

// =============================================================================
// Concurrency helper (copied from packages/workflows/src/steps/ingestion/utils.ts)
// =============================================================================

/**
 * Runs an array of async tasks with a concurrency limit.
 * Works like `Promise.allSettled` but limits simultaneous tasks.
 */
async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency = 5,
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const idx = nextIndex++;
      try {
        const value = await tasks[idx]();
        results[idx] = { status: "fulfilled", value };
      } catch (reason) {
        results[idx] = { status: "rejected", reason };
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()),
  );

  return results;
}

// =============================================================================
// Types
// =============================================================================

/** A target record for metadata generation. */
type MetadataTarget = {
  /** UUID of the ingestion_record */
  ingestionRecordId: string;
  /** Markdown content to send to the Letta agent */
  markdown: string;
  /** UUID of the associated workflow */
  workflowId: string;
};

// =============================================================================
// Main
// =============================================================================

async function main() {
  // ── Environment & confirmation ────────────────────────────────────────────

  loadEnvironment();

  // Parse flags after loadEnvironment() so env var fallbacks read the right file
  const DRY_RUN = args.includes("--dry-run") || process.env.DRY_RUN === "true";
  const RETRY_FAILED =
    args.includes("--retry-failed") || process.env.RETRY_FAILED === "true";

  if (IS_PROD && !DRY_RUN) {
    const confirmed = await confirmProductionRun();
    if (!confirmed) {
      logger.info("Aborted by user");
      process.exit(0);
    }
  }

  // ── Safety guards ──────────────────────────────────────────────────────────

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    logger.error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required",
    );
    process.exit(1);
  }

  if (!process.env.LETTA_API_KEY || !process.env.LETTA_PROJECT_ID) {
    logger.error("LETTA_API_KEY and LETTA_PROJECT_ID are required");
    process.exit(1);
  }

  const agentId =
    process.env.METADATA_AGENT_ID || process.env.PLAYGROUND_AGENT_ID;

  if (!agentId) {
    logger.error("METADATA_AGENT_ID or PLAYGROUND_AGENT_ID is required");
    process.exit(1);
  }

  logger.info(
    { supabaseUrl, agentId, DRY_RUN, RETRY_FAILED, CONCURRENCY, IS_PROD },
    "Starting forced metadata report generation",
  );

  // ── Fetch eligible ingestion records ───────────────────────────────────────

  const supabase = getSupabaseAdmin(supabaseUrl, supabaseKey);

  // All ingestion_records with a compliance report (ingestion_report_id IS NOT NULL),
  // joined with their workflow to get workflow_id.
  const { data: records, error: queryError } = await supabase
    .from("ingestion_records")
    .select(
      `
      id,
      markdown,
      workflows!inner ( id )
    `,
    )
    .not("ingestion_report_id", "is", null);

  if (queryError) {
    logger.error(queryError, "Failed to fetch ingestion records");
    process.exit(1);
  }

  if (!records || records.length === 0) {
    logger.info(
      "No ingestion records with compliance report found — nothing to do",
    );
    return;
  }

  // Build targets list
  const allTargets: MetadataTarget[] = records
    .map((r) => {
      const w = Array.isArray(r.workflows) ? r.workflows[0] : r.workflows;
      const workflowId = w?.id;
      if (!workflowId || !r.markdown) return null;
      return {
        ingestionRecordId: r.id as string,
        markdown: r.markdown as string,
        workflowId: workflowId as string,
      };
    })
    .filter(Boolean) as MetadataTarget[];

  // ── Optional: filter to only failed workflows ──────────────────────────────

  let targets: MetadataTarget[];

  if (RETRY_FAILED) {
    const workflowIds = allTargets.map((t) => t.workflowId);

    // Fetch all metadata reports for these workflows, most recent first
    const { data: latestReports } = await supabase
      .from("letta_reports")
      .select("workflow_id, status, created_at")
      .in("workflow_id", workflowIds)
      .eq("report_type", "metadata")
      .order("created_at", { ascending: false });

    // Keep only the most recent report per workflow
    const latestByWorkflow = new Map<string, string>();
    for (const report of latestReports ?? []) {
      if (report.workflow_id && !latestByWorkflow.has(report.workflow_id)) {
        latestByWorkflow.set(report.workflow_id, report.status ?? "error");
      }
    }

    // Include workflows whose latest report is 'error' OR have no report at all
    targets = allTargets.filter((t) => {
      const status = latestByWorkflow.get(t.workflowId);
      return !status || status === "error";
    });

    logger.info(
      {
        totalEligible: allTargets.length,
        retrying: targets.length,
        skipped: allTargets.length - targets.length,
      },
      "RETRY_FAILED mode — targeting only workflows with failed/missing metadata reports",
    );
  } else {
    targets = allTargets;
  }

  logger.info(
    { totalRecords: records.length, eligibleTargets: targets.length },
    "Metadata generation targets identified",
  );

  if (targets.length === 0) {
    logger.info("No eligible targets after filtering — done");
    return;
  }

  // ── Generate metadata reports ──────────────────────────────────────────────

  if (DRY_RUN) {
    for (const target of targets) {
      logger.info(
        {
          workflowId: target.workflowId,
          ingestionRecordId: target.ingestionRecordId,
          markdownLength: target.markdown.length,
        },
        "[DRY RUN] Would generate metadata report",
      );
    }
    logger.info(
      { total: targets.length },
      "Dry-run complete — no Letta calls or DB writes made",
    );
    return;
  }

  const lettaClient = createLettaClient();

  let succeeded = 0;
  let failed = 0;
  const errors: Array<{ workflowId: string; error: string }> = [];

  const results = await runWithConcurrency(
    targets.map((target) => async () => {
      logger.info(
        {
          workflowId: target.workflowId,
          ingestionRecordId: target.ingestionRecordId,
        },
        "▶ Starting metadata generation",
      );

      const conversationId = await findOrCreateConversation(
        lettaClient,
        agentId,
        `forced-metadata-${target.workflowId}-${RUN_TIMESTAMP}`,
      );

      let finalContent = "";

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
          workflow_id: target.workflowId,
        });

      if (reportError) {
        throw new Error(
          `Failed to insert letta_report: ${reportError.message}`,
        );
      }

      logger.info(
        {
          workflowId: target.workflowId,
          ingestionRecordId: target.ingestionRecordId,
          reportStatus: parsed.status,
        },
        `✔ Metadata report stored (status: ${parsed.status})`,
      );
    }),
    CONCURRENCY,
  );

  // ── Process results ────────────────────────────────────────────────────────

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const target = targets[i];

    if (result.status === "fulfilled") {
      succeeded += 1;
      logger.info(
        {
          workflowId: target.workflowId,
          progress: `${succeeded + failed}/${targets.length}`,
        },
        `✔ [${succeeded + failed}/${targets.length}] Metadata succeeded`,
      );
    } else {
      failed += 1;
      const error = result.reason;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      logger.error(
        {
          workflowId: target.workflowId,
          ingestionRecordId: target.ingestionRecordId,
          err: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
        },
        `✘ [${succeeded + failed}/${targets.length}] Metadata failed`,
      );

      errors.push({ workflowId: target.workflowId, error: errorMessage });

      // Insert an error report so the failure is visible in the UI
      // and can be retried manually
      try {
        await supabase.from("letta_reports").insert({
          agent_id: agentId,
          report_type: "metadata",
          markdown: "",
          metadata: {} as Json,
          status: "error",
          raw_response: errorMessage,
          workflow_id: target.workflowId,
        });
      } catch (dbError) {
        logger.error(
          { dbError, workflowId: target.workflowId },
          "Failed to insert error letta_report for metadata",
        );
      }
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────

  logger.info(
    {
      total: targets.length,
      succeeded,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    },
    "Forced metadata report generation complete",
  );

  if (failed > 0) {
    process.exit(1);
  }
}

main();
