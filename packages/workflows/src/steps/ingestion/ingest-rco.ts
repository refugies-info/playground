/**
 * @file ingest-rco.ts
 *
 * Steps of the RCO (API Offre Info) ingestion. No AI involved: search,
 * change detection and DI continuity are deterministic.
 */

import {
  getRcoClientFromEnv,
  ingestRcoActions,
  isRcoAuthError,
  isRcoRateLimitError,
  type RcoBatchResult,
  type RcoRunOptions,
  searchActionNumbers,
} from "@playground/offre-info";
import { logger } from "@playground/shared-types";
import {
  completeIngestionRun,
  createIngestionRun,
  getIngestionRun,
  markIngestionRunRunning,
  saveIngestionCheckpoint,
} from "@playground/supabase/ingestion-runs";
import { FatalError } from "@workflow/errors";
import { getSupabaseClient } from "./utils";

export type RcoCheckpoint = {
  numeroActions: string[];
  nextIndex: number;
  totals: RcoBatchResult;
};

export const EMPTY_RCO_TOTALS: RcoBatchResult = {
  requested: 0,
  processed: 0,
  interrupted: false,
  missing: 0,
  changes: { new: 0, unchanged: 0, baseline: 0, sessions_only: 0, content: 0 },
  structuresWritten: 0,
  ingestionRecordsCreated: 0,
  errors: [],
  outcomes: [],
};

const toRunStats = (totals: RcoBatchResult) => ({
  totalFetched: totals.processed,
  totalInserted: totals.changes.new,
  totalUpdated:
    totals.changes.baseline +
    totals.changes.sessions_only +
    totals.changes.content,
  totalUnchanged: totals.changes.unchanged,
  totalErrors: totals.errors.length,
});

const toFatalOnAuthError = (error: unknown): never => {
  if (isRcoAuthError(error)) throw new FatalError((error as Error).message);
  throw error;
};

async function resumeRun(
  runId: string,
): Promise<{ runId: string } & RcoCheckpoint> {
  const supabase = getSupabaseClient();
  const run = await getIngestionRun(supabase, runId);
  if (
    !run ||
    run.source !== "rco" ||
    run.status !== "interrupted" ||
    !run.checkpoint
  ) {
    throw new FatalError(`Run ${runId} is not a resumable RCO run`);
  }
  await markIngestionRunRunning(supabase, runId);
  const checkpoint = run.checkpoint as RcoCheckpoint;
  logger.info({ runId, nextIndex: checkpoint.nextIndex }, "▶ Resuming RCO run");
  return {
    runId,
    ...checkpoint,
    // Checkpoints saved before a totals field existed miss it.
    totals: { ...EMPTY_RCO_TOTALS, ...checkpoint.totals },
  };
}

async function searchActions(options: RcoRunOptions): Promise<string[]> {
  if (options.numeroActions) return options.numeroActions;
  try {
    return await searchActionNumbers(getRcoClientFromEnv(), {
      page: options.searchPage,
      pageSize: options.pageSize,
      maxActions: options.maxActions === "all" ? undefined : options.maxActions,
    });
  } catch (error) {
    if (isRcoRateLimitError(error)) {
      throw new FatalError("RCO rate limit reached during search, retry later");
    }
    return toFatalOnAuthError(error);
  }
}

export async function prepareRcoRunStep(
  options: RcoRunOptions,
): Promise<{ runId: string } & RcoCheckpoint> {
  "use step";
  if (options.resumeRunId) return resumeRun(options.resumeRunId);

  const supabase = getSupabaseClient();
  const runId = await createIngestionRun(supabase, {
    source: "rco",
    type: "services",
    options,
  });
  let numeroActions: string[];
  try {
    numeroActions = await searchActions(options);
  } catch (error) {
    // A run left "running" would block the button for hours.
    await completeIngestionRun(
      supabase,
      runId,
      toRunStats(EMPTY_RCO_TOTALS),
      "failed",
      {
        message: (error as Error).message,
      },
    );
    throw error;
  }
  const checkpoint: RcoCheckpoint = {
    numeroActions,
    nextIndex: 0,
    totals: EMPTY_RCO_TOTALS,
  };
  await saveIngestionCheckpoint(supabase, runId, checkpoint);
  logger.info(
    { runId, count: checkpoint.numeroActions.length },
    "✔ RCO actions found",
  );
  return { runId, ...checkpoint };
}

export async function ingestRcoBatchStep(
  runId: string,
  numeroActions: string[],
  dryRun: boolean,
): Promise<RcoBatchResult> {
  "use step";
  try {
    const result = await ingestRcoActions(
      getSupabaseClient(),
      getRcoClientFromEnv(),
      numeroActions,
      {
        runId,
        dryRun,
      },
    );
    logger.info({ runId, dryRun, ...result }, "✔ RCO batch ingested");
    return result;
  } catch (error) {
    return toFatalOnAuthError(error);
  }
}

export async function saveRcoCheckpointStep(
  runId: string,
  checkpoint: RcoCheckpoint,
): Promise<void> {
  "use step";
  await saveIngestionCheckpoint(getSupabaseClient(), runId, checkpoint);
}

export async function completeRcoRunStep(
  runId: string,
  totals: RcoBatchResult,
  status: "completed" | "interrupted" | "failed",
  failure?: string,
): Promise<void> {
  "use step";
  const errorDetails = failure
    ? { failure, errors: totals.errors }
    : totals.errors;
  await completeIngestionRun(
    getSupabaseClient(),
    runId,
    toRunStats(totals),
    status,
    failure || totals.errors.length > 0 ? errorDetails : undefined,
  );
}
