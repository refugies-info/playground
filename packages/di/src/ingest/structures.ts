import { logger } from "@playground/shared-types";
import type { Database } from "@playground/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { diClient } from "../client";
import type { StructureSummary } from "../types";
import { fetchAllCarifOrefItems, ingestCarifOrefItems } from "./generic";
import type { DiIngestionOptions } from "./shared";

export interface DiStructuresIngestionResult {
  runId: string;
  totalFetched: number;
  totalInserted: number;
  totalUpdated: number;
  totalUnchanged: number;
  errors: Array<{ structureId: string; error: unknown }>;
}

/**
 * Ingest carif-oref structures from Data Inclusion API into the di_structures table
 *
 * @param supabase - Supabase client with admin privileges
 * @param options - Ingestion options (pageSize, limit, onProgress callback)
 * @returns Ingestion results with counts and any errors
 *
 * @example
 * // Ingest all structures
 * await ingestCarifOrefStructures(supabase);
 *
 * // Ingest only 10 structures (for testing)
 * await ingestCarifOrefStructures(supabase, { limit: 10 });
 */
export async function ingestCarifOrefStructures(
  supabase: SupabaseClient<Database>,
  options: DiIngestionOptions = {},
): Promise<DiStructuresIngestionResult> {
  const result = await ingestCarifOrefItems<StructureSummary>(
    supabase,
    (params) => diClient.getStructures(params),
    "di_structures",
    "structures",
    options,
  );

  // Transform generic result to specific result type
  return {
    runId: result.runId,
    totalFetched: result.totalFetched,
    totalInserted: result.totalInserted,
    totalUpdated: result.totalUpdated,
    totalUnchanged: result.totalUnchanged,
    errors: result.errors.map((e) => ({
      structureId: e.id,
      error: e.error,
    })),
  };
}

/**
 * Fetch structures from DI API without storing them (for inspection/testing)
 */
export async function fetchCarifOrefStructures(
  options: DiIngestionOptions = {},
): Promise<StructureSummary[]> {
  logger.info("Fetching structures (inspect mode, no storage)");
  return fetchAllCarifOrefItems<StructureSummary>(
    (params) => diClient.getStructures(params),
    "structures",
    options,
  );
}
