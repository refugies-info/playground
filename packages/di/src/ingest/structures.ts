import { logger } from "@playground/shared-types";
import type { Database } from "@playground/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type ListedStructure,
  listStructuresEndpointApiV1StructuresGet,
  type PageListedStructure,
} from "../hey-api";
import {
  DEFAULT_BATCH_SIZE,
  DEFAULT_PAGE_SIZE,
  type DiIngestionOptions,
  SOURCE_CARIF_OREF,
} from "./shared";

export interface DiIngestionResult {
  totalFetched: number;
  totalInserted: number;
  totalSkipped: number;
  errors: Array<{ structureId: string; error: unknown }>;
}

/**
 * Fetch structures from Data Inclusion API with pagination
 * Filters by source = "carif-oref"
 * Stops when limit is reached (if specified)
 */
async function fetchAllCarifOrefStructures(
  options: DiIngestionOptions = {},
): Promise<ListedStructure[]> {
  const { pageSize = DEFAULT_PAGE_SIZE, limit, onProgress } = options;
  const allStructures: ListedStructure[] = [];
  let currentPage = 1;
  let totalPages: number | null = null;
  let totalItems: number | null = null;

  logger.info(
    { source: SOURCE_CARIF_OREF, pageSize, limit: limit ?? "unlimited" },
    "Starting DI API fetch",
  );

  while (true) {
    const response = await listStructuresEndpointApiV1StructuresGet({
      query: {
        page: currentPage,
        size: pageSize,
        sources: [SOURCE_CARIF_OREF],
      },
    });

    if (response.error) {
      logger.error(
        { page: currentPage, error: response.error },
        "Failed to fetch structures page",
      );
      throw new Error(
        `Failed to fetch structures page ${currentPage}: ${JSON.stringify(response.error)}`,
      );
    }

    const data = response.data as PageListedStructure;
    allStructures.push(...data.items);

    if (totalPages === null) {
      totalPages = data.pages;
      totalItems = data.total;
      logger.info(
        { totalItems, totalPages, pageSize, limit: limit ?? "unlimited" },
        "DI API pagination initialized",
      );
    }

    logger.debug(
      {
        page: currentPage,
        totalPages,
        itemsInPage: data.items.length,
        fetchedSoFar: allStructures.length,
        totalItems,
      },
      "Fetched page",
    );

    onProgress?.(allStructures.length, limit ?? data.total);

    // Stop if we've reached the limit
    if (limit && allStructures.length >= limit) {
      logger.info(
        { limit, fetched: allStructures.length },
        "Limit reached, stopping fetch",
      );
      break;
    }

    if (currentPage >= data.pages) {
      break;
    }

    currentPage++;
  }

  // Trim to exact limit if we fetched more
  const result = limit ? allStructures.slice(0, limit) : allStructures;

  logger.info(
    { totalFetched: result.length, pagesProcessed: currentPage },
    "Completed DI API fetch",
  );

  return result;
}

/**
 * Insert structures into the di_structures table
 * Stores the full structure as raw_data (JSON string) and the parsed structure in data (jsonb)
 */
async function insertStructures(
  supabase: SupabaseClient<Database>,
  structures: ListedStructure[],
): Promise<{
  inserted: number;
  skipped: number;
  errors: Array<{ structureId: string; error: unknown }>;
}> {
  let inserted = 0;
  const skipped = 0;
  const errors: Array<{ structureId: string; error: unknown }> = [];

  const totalBatches = Math.ceil(structures.length / DEFAULT_BATCH_SIZE);
  logger.info(
    {
      totalStructures: structures.length,
      batchSize: DEFAULT_BATCH_SIZE,
      totalBatches,
    },
    "Starting database insertion",
  );

  for (let i = 0; i < structures.length; i += DEFAULT_BATCH_SIZE) {
    const batchIndex = Math.floor(i / DEFAULT_BATCH_SIZE) + 1;
    const batch = structures.slice(i, i + DEFAULT_BATCH_SIZE);

    const records = batch.map((structure) => ({
      raw_data: JSON.stringify(structure),
      data: structure,
    }));

    const { data, error } = await supabase
      .from("di_structures")
      .insert(records)
      .select("id");

    if (error) {
      logger.warn(
        {
          batchIndex,
          totalBatches,
          batchSize: batch.length,
          error: error.message,
        },
        "Batch insert failed, falling back to individual inserts",
      );

      // If batch fails, try individual inserts to identify problematic records
      let batchInserted = 0;
      let batchErrors = 0;

      for (const structure of batch) {
        const { error: singleError } = await supabase
          .from("di_structures")
          .insert({
            raw_data: JSON.stringify(structure),
            data: structure,
          });

        if (singleError) {
          errors.push({ structureId: structure.id, error: singleError });
          batchErrors++;
          logger.error(
            {
              structureId: structure.id,
              structureName: structure.nom,
              error: singleError.message,
            },
            "Failed to insert structure",
          );
        } else {
          inserted++;
          batchInserted++;
        }
      }

      logger.info(
        { batchIndex, batchInserted, batchErrors },
        "Completed fallback insertion for batch",
      );
    } else {
      const count = data?.length ?? batch.length;
      inserted += count;

      logger.debug(
        {
          batchIndex,
          totalBatches,
          insertedInBatch: count,
          totalInserted: inserted,
        },
        "Batch inserted successfully",
      );
    }
  }

  logger.info(
    { inserted, skipped, errorCount: errors.length },
    "Completed database insertion",
  );

  return { inserted, skipped, errors };
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
): Promise<DiIngestionResult> {
  const startTime = Date.now();
  logger.info({ source: SOURCE_CARIF_OREF }, "=== Starting DI ingestion ===");

  // 1. Fetch all structures from DI API
  const structures = await fetchAllCarifOrefStructures(options);

  // 2. Insert into Supabase
  const { inserted, skipped, errors } = await insertStructures(
    supabase,
    structures,
  );

  const durationMs = Date.now() - startTime;
  const durationSec = (durationMs / 1000).toFixed(2);

  logger.info(
    {
      totalFetched: structures.length,
      totalInserted: inserted,
      totalSkipped: skipped,
      errorCount: errors.length,
      durationMs,
      durationSec: `${durationSec}s`,
    },
    "=== DI ingestion completed ===",
  );

  if (errors.length > 0) {
    logger.warn(
      { errorCount: errors.length, firstErrors: errors.slice(0, 5) },
      "Some structures failed to insert",
    );
  }

  return {
    totalFetched: structures.length,
    totalInserted: inserted,
    totalSkipped: skipped,
    errors,
  };
}

/**
 * Fetch structures from DI API without storing them (for inspection/testing)
 */
export async function fetchCarifOrefStructures(
  options: DiIngestionOptions = {},
): Promise<ListedStructure[]> {
  logger.info("Fetching structures (inspect mode, no storage)");
  return fetchAllCarifOrefStructures(options);
}
