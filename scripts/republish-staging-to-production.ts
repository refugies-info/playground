/**
 * Republish staging publications to production
 *
 * This one-off migration script re-publishes all documents that were
 * published to staging (staging.refugies.info) to the production target
 * (refugies.info).
 *
 * Since staging and production are separate MongoDB instances, staging
 * remote_ids are not valid in production. Each workflow is published as
 * a CREATE (new dispositif), unless it already has a successful production
 * publication_record in which case it is skipped.
 *
 * Required env vars:
 *   RI_BASE_URL               = https://refugies.info  (production target)
 *   NEXT_PUBLIC_RI_BASE_URL   = https://refugies.info
 *   RI_WEBHOOK_SECRET         = <prod webhook secret>
 *   NEXT_PUBLIC_SUPABASE_URL  = <prod supabase url>
 *   SUPABASE_SERVICE_ROLE_KEY = <prod service role key>
 *   REPUBLISH_USER_ID         = <your user uuid>
 *   STAGING_RI_URL            = https://staging.refugies.info (default)
 *
 * Usage:
 *   REPUBLISH_USER_ID=<uuid> pnpm republish:prod
 *
 * Dry-run (no webhook calls, no DB writes):
 *   DRY_RUN=true REPUBLISH_USER_ID=<uuid> pnpm republish:prod
 */

import { logger } from "@playground/shared-types";
import { getSupabaseAdmin } from "@playground/supabase";
import { publishDocumentStep } from "@playground/workflows";

const STAGING_RI_URL =
  process.env.STAGING_RI_URL ?? "https://staging.refugies.info";
const PRODUCTION_RI_URL = (process.env.RI_BASE_URL ?? "").replace(/\/$/, "");
const DRY_RUN = process.env.DRY_RUN === "true";

async function main() {
  // ── Safety guards ──────────────────────────────────────────────────────────

  const userId = process.env.REPUBLISH_USER_ID;
  if (!userId) {
    logger.error("REPUBLISH_USER_ID env var is required");
    process.exit(1);
  }

  if (!PRODUCTION_RI_URL) {
    logger.error("RI_BASE_URL env var is required");
    process.exit(1);
  }

  if (PRODUCTION_RI_URL === STAGING_RI_URL) {
    logger.error(
      { RI_BASE_URL: PRODUCTION_RI_URL, STAGING_RI_URL },
      "RI_BASE_URL must not equal STAGING_RI_URL — aborting to avoid re-publishing to staging",
    );
    process.exit(1);
  }

  if (!process.env.RI_WEBHOOK_SECRET) {
    logger.error("RI_WEBHOOK_SECRET env var is required");
    process.exit(1);
  }

  logger.info(
    { stagingUrl: STAGING_RI_URL, productionUrl: PRODUCTION_RI_URL, DRY_RUN },
    "Starting staging→production republication",
  );

  // ── Query staging publications ─────────────────────────────────────────────

  const supabase = getSupabaseAdmin();

  const { data: stagingPubs, error: pubError } = await supabase
    .from("publication_records")
    .select("workflow_id, created_at")
    .eq("target", STAGING_RI_URL)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (pubError) {
    logger.error(pubError, "Failed to fetch staging publication_records");
    process.exit(1);
  }

  if (!stagingPubs || stagingPubs.length === 0) {
    logger.info(
      { stagingUrl: STAGING_RI_URL },
      "No published staging records found — nothing to do",
    );
    return;
  }

  // Deduplicate: keep only the latest publication per workflow
  const seenWorkflows = new Set<string>();
  const uniqueWorkflows: string[] = [];
  for (const pub of stagingPubs) {
    if (!seenWorkflows.has(pub.workflow_id)) {
      seenWorkflows.add(pub.workflow_id);
      uniqueWorkflows.push(pub.workflow_id);
    }
  }

  logger.info(
    { total: stagingPubs.length, unique: uniqueWorkflows.length },
    "Staging publications found",
  );

  // ── Skip workflows already published to production ─────────────────────────

  const { data: existingProdPubs } = await supabase
    .from("publication_records")
    .select("workflow_id")
    .eq("target", PRODUCTION_RI_URL)
    .eq("status", "published")
    .in("workflow_id", uniqueWorkflows);

  const alreadyPublished = new Set(
    (existingProdPubs ?? []).map((p) => p.workflow_id),
  );

  const toPublish = uniqueWorkflows.filter((id) => !alreadyPublished.has(id));

  logger.info(
    {
      alreadyInProduction: alreadyPublished.size,
      toPublish: toPublish.length,
    },
    "Publication plan",
  );

  if (toPublish.length === 0) {
    logger.info("All staging publications are already in production — done");
    return;
  }

  // ── Fetch editorial data for each workflow ─────────────────────────────────

  const { data: workflows, error: wfError } = await supabase
    .from("workflows")
    .select(
      `
      id,
      editorial_record_id,
      editorial_records (
        markdown,
        metadata
      )
    `,
    )
    .in("id", toPublish);

  if (wfError) {
    logger.error(wfError, "Failed to fetch workflow data");
    process.exit(1);
  }

  // ── Publish each workflow ──────────────────────────────────────────────────

  let succeeded = 0;
  let failed = 0;
  const errors: Array<{ workflowId: string; error: string }> = [];

  for (const workflow of workflows ?? []) {
    const editorialRecord = Array.isArray(workflow.editorial_records)
      ? workflow.editorial_records[0]
      : workflow.editorial_records;

    if (!editorialRecord?.markdown) {
      logger.warn(
        { workflowId: workflow.id },
        "No editorial record found — skipping",
      );
      failed++;
      errors.push({ workflowId: workflow.id, error: "No editorial record" });
      continue;
    }

    const markdown = editorialRecord.markdown as string;
    const metadata = (editorialRecord.metadata as Record<string, unknown>) ?? {};

    // Extract title from first H1 in markdown (fallback to empty string)
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch?.[1]?.trim() ?? "";

    logger.info(
      { workflowId: workflow.id, title: title.slice(0, 60) },
      `Publishing${DRY_RUN ? " [DRY RUN]" : ""}…`,
    );

    if (DRY_RUN) {
      succeeded++;
      continue;
    }

    const result = await publishDocumentStep({
      workflowId: workflow.id,
      title,
      markdown,
      metadata,
      userId,
      userEmail: "",
      platform: "refugies.info",
    });

    if (result.success) {
      logger.info(
        {
          workflowId: workflow.id,
          remoteId: result.data?.remoteId,
          publishedUrl: result.data?.publishedUrl,
        },
        "✅ Published",
      );
      succeeded++;
    } else {
      logger.error(
        { workflowId: workflow.id, error: result.error },
        "❌ Publication failed",
      );
      failed++;
      errors.push({ workflowId: workflow.id, error: result.error ?? "unknown" });
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────

  logger.info(
    {
      total: toPublish.length,
      succeeded,
      failed,
      dryRun: DRY_RUN,
      errors: errors.length > 0 ? errors : undefined,
    },
    DRY_RUN
      ? "Dry-run complete — no changes made"
      : "Republication complete",
  );

  if (failed > 0) {
    process.exit(1);
  }
}

main();
