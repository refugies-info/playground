import { rcoProvider } from "@playground/rco-offre-info";
import { logger } from "@playground/shared-types";
import type { Database } from "@playground/supabase";
import {
  completeIngestionRun,
  createIngestionRun,
  type IngestionRunStats,
  saveIngestionCheckpoint,
} from "@playground/supabase/ingestion-runs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FatalError } from "@workflow/errors";
import { getSupabaseClient } from "../common/supabase";

// What an external source must provide to be ingested by the steps below.
// The batch result stays the provider's own shape: it is stored as the run
// checkpoint and read back by the latest run card.
export type IngestionProvider<Item = unknown, Result = unknown> = {
  fetchAll(): Promise<Item[]>;
  isFatalError(error: unknown): boolean;
  ingestBatch(
    supabase: SupabaseClient<Database>,
    items: Item[],
    runId: string,
  ): Promise<Result>;
  emptyResult(): Result;
  addResult(total: Result, batch: Result): Result;
  toRunStats(result: Result): IngestionRunStats;
  errorsOf(result: Result): unknown[];
};

// Keyed by `ingestion_runs.source`.
const PROVIDERS = { rco: rcoProvider } satisfies Record<
  string,
  IngestionProvider
>;

export type IngestionSourceKey = keyof typeof PROVIDERS;
type SourceResult = Awaited<
  ReturnType<(typeof PROVIDERS)[IngestionSourceKey]["ingestBatch"]>
>;

// Keeps the services_latest `.in()` lookups under the URL length limit.
const INGEST_CHUNK_SIZE = 200;

export async function createSourceRunStep(
  source: IngestionSourceKey,
): Promise<string> {
  "use step";
  return createIngestionRun(getSupabaseClient(), {
    source,
    type: "services",
    options: {},
  });
}

export async function ingestSourceStep(
  source: IngestionSourceKey,
  runId: string,
): Promise<SourceResult> {
  "use step";
  const provider = PROVIDERS[source];
  const supabase = getSupabaseClient();
  let items: Awaited<ReturnType<typeof provider.fetchAll>>;
  try {
    items = await provider.fetchAll();
  } catch (error) {
    if (provider.isFatalError(error))
      throw new FatalError((error as Error).message);
    throw error;
  }
  logger.info(
    { runId, count: items.length },
    `✔ ${source.toUpperCase()} actions found`,
  );

  let totals = provider.emptyResult();
  for (let start = 0; start < items.length; start += INGEST_CHUNK_SIZE) {
    const batch = await provider.ingestBatch(
      supabase,
      items.slice(start, start + INGEST_CHUNK_SIZE),
      runId,
    );
    totals = provider.addResult(totals, batch);
    logger.info(
      { runId, ...provider.toRunStats(batch) },
      `✔ ${source.toUpperCase()} batch ingested`,
    );
  }
  // Read by the latest run card.
  await saveIngestionCheckpoint(supabase, runId, { totals });
  return totals;
}

export async function completeSourceRunStep(
  source: IngestionSourceKey,
  runId: string,
  status: "completed" | "failed",
  totals: SourceResult = PROVIDERS[source].emptyResult(),
  failure?: string,
): Promise<void> {
  "use step";
  const provider = PROVIDERS[source];
  const errors = provider.errorsOf(totals);
  const errorDetails = failure ? { failure, errors } : errors;
  await completeIngestionRun(
    getSupabaseClient(),
    runId,
    provider.toRunStats(totals),
    status,
    failure || errors.length > 0 ? errorDetails : undefined,
  );
}
