import { rcoProvider } from "@playground/rco-offre-info";
import { logger } from "@playground/shared-types";
import {
  completeIngestionRun,
  createIngestionRun,
  saveIngestionCheckpoint,
} from "@playground/supabase/ingestion-runs";
import { FatalError } from "@workflow/errors";
import { getSupabaseClient } from "../common/supabase";

const PROVIDERS = { rco: rcoProvider } as const;

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
    source: PROVIDERS[source].runSource,
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
      { runId, processed: batch.processed, changes: batch.changes },
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
