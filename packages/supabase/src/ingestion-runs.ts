import { createHash } from "node:crypto";
import { logger } from "@playground/shared-types";
import type { SupabaseClient } from "@supabase/supabase-js";
import stringify from "json-stable-stringify";
import type { Database, Json } from "./types";

type Supabase = SupabaseClient<Database>;

export type IngestionRunStats = {
  totalFetched: number;
  totalInserted: number;
  totalUpdated: number;
  totalUnchanged: number;
  totalErrors: number;
};

export type IngestionRunStatus =
  | "running"
  | "completed"
  | "failed"
  | "interrupted";

// A run still "running" after this delay is considered crashed.
const RUNNING_RUN_TIMEOUT_MS = 3 * 60 * 60 * 1000;

export async function createIngestionRun(
  supabase: Supabase,
  {
    source,
    type,
    options,
  }: {
    source: "di" | "rco";
    type: "structures" | "services";
    options: unknown;
  },
): Promise<string> {
  const { data, error } = await supabase
    .from("ingestion_runs")
    .insert({ source, type, status: "running", options: options as Json })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create ingestion run: ${error?.message}`);
  }
  return data.id;
}

export async function completeIngestionRun(
  supabase: Supabase,
  runId: string,
  stats: IngestionRunStats,
  status: Exclude<IngestionRunStatus, "running"> = "completed",
  errorDetails?: unknown,
): Promise<void> {
  const { error } = await supabase
    .from("ingestion_runs")
    .update({
      completed_at: new Date().toISOString(),
      status,
      total_fetched: stats.totalFetched,
      total_inserted: stats.totalInserted,
      total_updated: stats.totalUpdated,
      total_unchanged: stats.totalUnchanged,
      total_errors: stats.totalErrors,
      error_details: (errorDetails ?? null) as Json,
    })
    .eq("id", runId);

  if (error) {
    logger.error(
      { runId, error: error.message },
      "Failed to update ingestion run",
    );
  }
}

export async function findRunningIngestion(
  supabase: Supabase,
): Promise<{ id: string; source: string } | null> {
  const { data, error } = await supabase
    .from("ingestion_runs")
    .select("id, source")
    .eq("status", "running")
    .gte(
      "created_at",
      new Date(Date.now() - RUNNING_RUN_TIMEOUT_MS).toISOString(),
    )
    .limit(1)
    .maybeSingle();
  if (error)
    throw new Error(`Failed to check running ingestions: ${error.message}`);
  return data;
}

/**
 * json-stable-stringify sorts object keys but not array values, and sources
 * may return the same values in a different order between runs.
 * See: https://github.com/ljharb/json-stable-stringify/issues/12
 */
function sortArraysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortArraysDeep).sort((a, b) => {
      const sa =
        a !== null && typeof a === "object" ? (stringify(a) ?? "") : String(a);
      const sb =
        b !== null && typeof b === "object" ? (stringify(b) ?? "") : String(b);
      return sa < sb ? -1 : sa > sb ? 1 : 0;
    });
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        sortArraysDeep(v),
      ]),
    );
  }
  return value;
}

/** SHA-1 of a stable serialization, used to detect changes between runs. */
export function computeContentHash(data: unknown): string {
  const normalized = typeof data === "string" ? data : sortArraysDeep(data);
  const stableString =
    (typeof normalized === "string" ? normalized : stringify(normalized)) || "";
  return createHash("sha1").update(stableString).digest("hex");
}
