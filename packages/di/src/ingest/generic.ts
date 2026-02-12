import { logger } from "@playground/shared-types";
import type { Database, Json } from "@playground/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Page } from "../types";
import {
  computeContentHash,
  DEFAULT_BATCH_SIZE,
  DEFAULT_PAGE_SIZE,
  type DiIngestionOptions,
  SOURCE_CARIF_OREF,
} from "./shared";

/**
 * Zod schema for Page structure
 */
const PageSchema = z.object({
  items: z.array(z.unknown()),
  total: z.number(),
  pages: z.number(),
});

/**
 * Generic fetch function for DI API

import type { Database, Json } from "@playground/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Page } from "../types";
import {
  computeContentHash,
  DEFAULT_BATCH_SIZE,
  DEFAULT_PAGE_SIZE,
  type DiIngestionOptions,
  SOURCE_CARIF_OREF,
} from "./shared";

/**
 * Result type for DI ingestion with version tracking
 */
export interface DiIngestionResult {
  /** UUID of the ingestion run record */
  runId: string;
  /** Total items fetched from DI API */
  totalFetched: number;
  /** New records inserted (version 1) */
  totalInserted: number;
  /** Existing records updated (version 2+) */
  totalUpdated: number;
  /** Records skipped (hash unchanged) */
  totalUnchanged: number;
  /** Records that failed to insert */
  errors: Array<{ id: string; error: unknown }>;
}

/**
 * Generic DI item type
 */
export type DiItem = { id: string; nom: string; source: string };

/**
 * Existing record info from database
 */
interface ExistingRecord {
  di_id: string;
  content_hash: string | null;
  version: number;
}

/**
 * Generic fetch function for DI API
 * Fetches items from Data Inclusion API with pagination
 * Filters by source = "carif-oref"
 * Stops when limit is reached (if specified)
 *
 * @param fetchFn - The API client function to call
 * @param itemType - The type of item being fetched (for logging)
 * @param options - Ingestion options (pageSize, limit, onProgress callback)
 */
export async function fetchAllCarifOrefItems<T extends DiItem>(
  fetchFn: (
    params: {
      page: number;
      size: number;
      sources: string[];
    } & Record<string, unknown>,
  ) => Promise<Page<T>>,
  itemType: string,
  options: DiIngestionOptions<T> = {},
): Promise<T[]> {
  const {
    pageSize = DEFAULT_PAGE_SIZE,
    limit,
    onProgress,
    extraQueryParams = {},
    filter,
  } = options;
  const allItems: T[] = [];
  const seenIds = new Set<string>();
  let currentPage = 1;
  let totalPages: number | null = null;
  let totalItems: number | null = null;

  logger.info(
    { source: SOURCE_CARIF_OREF, pageSize, limit: limit ?? "unlimited" },
    `Starting DI API fetch for ${itemType}`,
  );

  while (true) {
    try {
      const data = await fetchFn({
        page: currentPage,
        size: pageSize,
        sources: [SOURCE_CARIF_OREF],
        ...extraQueryParams,
      });

      const parsed = PageSchema.safeParse(data);
      if (!parsed.success) {
        logger.error(
          { page: currentPage, error: parsed.error.format() },
          `Invalid API response structure for ${itemType}`,
        );
        throw new Error(
          `Invalid API response for ${itemType} page ${currentPage}: ${parsed.error.message}`,
        );
      }

      // Filter and deduplicate items from this page
      for (const item of data.items) {
        if (seenIds.has(item.id)) {
          logger.debug(
            { id: item.id, type: itemType },
            "Skipping duplicate item ID during fetch",
          );
          continue;
        }

        if (filter && !filter(item)) {
          logger.debug(
            { id: item.id, type: itemType },
            "Item filtered out by custom filter",
          );
          continue;
        }

        allItems.push(item);
        seenIds.add(item.id);

        // Stop if we've reached the limit
        if (limit && allItems.length >= limit) {
          break;
        }
      }

      if (totalPages === null) {
        totalPages = data.pages;
        totalItems = data.total;
        logger.info(
          { totalItems, totalPages, pageSize, limit: limit ?? "unlimited" },
          `DI API pagination initialized for ${itemType}`,
        );
      }

      logger.debug(
        {
          page: currentPage,
          totalPages,
          itemsInPage: data.items.length,
          fetchedSoFar: allItems.length,
          totalItems,
        },
        `Fetched ${itemType} page`,
      );

      onProgress?.(allItems.length, limit ?? data.total);

      // Stop if we've reached the limit
      if (limit && allItems.length >= limit) {
        logger.info(
          { limit, fetched: allItems.length },
          `Limit reached, stopping ${itemType} fetch`,
        );
        break;
      }

      if (currentPage >= data.pages) {
        break;
      }

      currentPage++;
    } catch (error) {
      logger.error(
        { page: currentPage, error },
        `Failed to fetch ${itemType} page`,
      );
      throw error;
    }
  }

  // Result is already limited and filtered
  const result = allItems;

  logger.info(
    { totalFetched: result.length, pagesProcessed: currentPage },
    `Completed DI API fetch for ${itemType}`,
  );

  return result;
}

/**
 * Create an ingestion run record to track this ingestion
 */
async function createIngestionRun(
  supabase: SupabaseClient<Database>,
  type: "structures" | "services",
  options: DiIngestionOptions,
): Promise<string> {
  const { data, error } = await supabase
    .from("ingestion_runs")
    .insert({
      source: "di",
      type,
      status: "running",
      options: options as Json,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create ingestion run: ${error?.message}`);
  }

  return data.id;
}

/**
 * Update ingestion run with final stats
 */
async function completeIngestionRun(
  supabase: SupabaseClient<Database>,
  runId: string,
  stats: {
    totalFetched: number;
    totalInserted: number;
    totalUpdated: number;
    totalUnchanged: number;
    totalErrors: number;
  },
  status: "completed" | "failed" = "completed",
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

/**
 * Fetch existing records to check for changes
 */
async function fetchExistingRecords(
  supabase: SupabaseClient<Database>,
  tableName: "di_structures" | "di_services",
  diIds: string[],
): Promise<Map<string, ExistingRecord>> {
  const viewName =
    tableName === "di_structures"
      ? "di_structures_latest"
      : "di_services_latest";

  // Fetch in batches to avoid query size limits
  const existingMap = new Map<string, ExistingRecord>();

  for (let i = 0; i < diIds.length; i += DEFAULT_BATCH_SIZE) {
    const batch = diIds.slice(i, i + DEFAULT_BATCH_SIZE);

    const { data, error } = await supabase
      .from(viewName)
      .select("di_id, content_hash, version")
      .in("di_id", batch);

    if (error) {
      logger.warn(
        { error: error.message },
        `Failed to fetch existing records from ${viewName}`,
      );
      continue;
    }

    for (const record of data ?? []) {
      if (record.di_id) {
        existingMap.set(record.di_id, {
          di_id: record.di_id,
          content_hash: record.content_hash,
          version: record.version ?? 1,
        });
      }
    }
  }

  return existingMap;
}

/**
 * Upsert items into database with version tracking
 * - New items: inserted with version 1
 * - Changed items: inserted with version N+1
 * - Unchanged items: skipped
 */
async function upsertItems<T extends DiItem>(
  supabase: SupabaseClient<Database>,
  items: T[],
  tableName: "di_structures" | "di_services",
  itemType: string,
  runId: string,
): Promise<{
  inserted: number;
  updated: number;
  unchanged: number;
  errors: Array<{ id: string; error: unknown }>;
}> {
  let inserted = 0;
  let updated = 0;
  let unchanged = 0;
  const errors: Array<{ id: string; error: unknown }> = [];

  // Get all DI IDs from incoming items
  const diIds = items.map((item) => item.id);

  // Fetch existing records to compare hashes
  const existingRecords = await fetchExistingRecords(
    supabase,
    tableName,
    diIds,
  );

  logger.info(
    {
      totalItems: items.length,
      existingCount: existingRecords.size,
      batchSize: DEFAULT_BATCH_SIZE,
    },
    `Starting upsert for ${itemType}`,
  );

  // Categorize items
  const toInsert: Array<{ item: T; hash: string; isUpdate: boolean }> = [];

  for (const item of items) {
    const hash = computeContentHash(item);
    const existing = existingRecords.get(item.id);

    if (!existing) {
      // New record
      toInsert.push({ item, hash, isUpdate: false });
    } else if (existing.content_hash !== hash) {
      // Changed record
      toInsert.push({ item, hash, isUpdate: true });
    } else {
      // Unchanged
      unchanged++;
    }
  }

  logger.info(
    {
      newRecords: toInsert.filter((r) => !r.isUpdate).length,
      updatedRecords: toInsert.filter((r) => r.isUpdate).length,
      unchangedRecords: unchanged,
    },
    `${itemType} categorization complete`,
  );

  // Insert in batches
  const totalBatches = Math.ceil(toInsert.length / DEFAULT_BATCH_SIZE);

  for (let i = 0; i < toInsert.length; i += DEFAULT_BATCH_SIZE) {
    const batchIndex = Math.floor(i / DEFAULT_BATCH_SIZE) + 1;
    const batch = toInsert.slice(i, i + DEFAULT_BATCH_SIZE);

    const records = batch.map(({ item, hash }) => ({
      raw_data: JSON.stringify(item),
      data: item,
      content_hash: hash,
      ingestion_run_id: runId,
    }));

    const { data, error } = await supabase
      .from(tableName)
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
        `Batch insert failed for ${itemType}, falling back to individual inserts`,
      );

      // Fallback to individual inserts
      for (const { item, hash, isUpdate } of batch) {
        const { error: singleError } = await supabase.from(tableName).insert({
          raw_data: JSON.stringify(item),
          data: item,
          content_hash: hash,
          ingestion_run_id: runId,
        });

        if (singleError) {
          errors.push({ id: item.id, error: singleError });
          logger.error(
            { id: item.id, nom: item.nom, error: singleError.message },
            `Failed to insert ${itemType.slice(0, -1)}`,
          );
        } else {
          if (isUpdate) {
            updated++;
          } else {
            inserted++;
          }
        }
      }
    } else {
      // Count inserts vs updates
      for (const { isUpdate } of batch) {
        if (isUpdate) {
          updated++;
        } else {
          inserted++;
        }
      }

      logger.debug(
        {
          batchIndex,
          totalBatches,
          insertedInBatch: data?.length ?? batch.length,
          totalInserted: inserted,
          totalUpdated: updated,
        },
        `${itemType} batch inserted successfully`,
      );
    }
  }

  logger.info(
    { inserted, updated, unchanged, errorCount: errors.length },
    `Completed upsert for ${itemType}`,
  );

  return { inserted, updated, unchanged, errors };
}

/**
 * Generic ingestion function for DI items with version tracking
 * Ingests items from Data Inclusion API into Supabase table
 *
 * @param supabase - Supabase client with admin privileges
 * @param fetchFn - The API client function to call
 * @param tableName - Name of the table to insert into
 * @param itemType - The type of item being ingested (for logging)
 * @param options - Ingestion options (pageSize, limit, onProgress callback)
 * @returns Ingestion results with counts and any errors
 */
export async function ingestCarifOrefItems<T extends DiItem>(
  supabase: SupabaseClient<Database>,
  fetchFn: (
    params: {
      page: number;
      size: number;
      sources: string[];
    } & Record<string, unknown>,
  ) => Promise<Page<T>>,
  tableName: "di_structures" | "di_services",
  itemType: string,
  options: DiIngestionOptions = {},
): Promise<DiIngestionResult> {
  const startTime = Date.now();
  const type = tableName === "di_structures" ? "structures" : "services";

  logger.info(
    { source: SOURCE_CARIF_OREF },
    `=== Starting DI ${itemType} ingestion ===`,
  );

  // Create ingestion run record
  const runId = await createIngestionRun(supabase, type, options);
  logger.info({ runId }, "Created ingestion run");

  try {
    // 1. Fetch all items from DI API
    const items = await fetchAllCarifOrefItems(fetchFn, itemType, options);

    // 2. Upsert into Supabase with version tracking
    const { inserted, updated, unchanged, errors } = await upsertItems(
      supabase,
      items,
      tableName,
      itemType,
      runId,
    );

    const durationMs = Date.now() - startTime;
    const durationSec = (durationMs / 1000).toFixed(2);

    // 3. Update ingestion run with stats
    await completeIngestionRun(supabase, runId, {
      totalFetched: items.length,
      totalInserted: inserted,
      totalUpdated: updated,
      totalUnchanged: unchanged,
      totalErrors: errors.length,
    });

    logger.info(
      {
        runId,
        totalFetched: items.length,
        totalInserted: inserted,
        totalUpdated: updated,
        totalUnchanged: unchanged,
        errorCount: errors.length,
        durationMs,
        durationSec: `${durationSec}s`,
      },
      `=== DI ${itemType} ingestion completed ===`,
    );

    if (errors.length > 0) {
      logger.warn(
        { errorCount: errors.length, firstErrors: errors.slice(0, 5) },
        `Some ${itemType} failed to insert`,
      );
    }

    return {
      runId,
      totalFetched: items.length,
      totalInserted: inserted,
      totalUpdated: updated,
      totalUnchanged: unchanged,
      errors,
    };
  } catch (error) {
    // Mark run as failed
    await completeIngestionRun(
      supabase,
      runId,
      {
        totalFetched: 0,
        totalInserted: 0,
        totalUpdated: 0,
        totalUnchanged: 0,
        totalErrors: 1,
      },
      "failed",
      { message: error instanceof Error ? error.message : String(error) },
    );
    throw error;
  }
}

// Legacy exports for backwards compatibility (deprecated)
/** @deprecated Use DiIngestionResult instead */
export type DiGenericIngestionResult = DiIngestionResult;

/** @deprecated Use ingestCarifOrefItems instead, which now handles inserts and updates. */
export async function insertItems<T extends DiItem>(
  supabase: SupabaseClient<Database>,
  items: T[],
  tableName: "di_structures" | "di_services",
  itemType: string,
): Promise<{
  inserted: number;
  skipped: number;
  errors: Array<{ id: string; error: unknown }>;
}> {
  logger.warn(
    "insertItems is deprecated, use ingestCarifOrefItems with upsert logic instead",
  );

  // Create a temporary run for legacy compatibility
  const runId = await createIngestionRun(
    supabase,
    tableName === "di_structures" ? "structures" : "services",
    {},
  );

  const result = await upsertItems(supabase, items, tableName, itemType, runId);

  await completeIngestionRun(supabase, runId, {
    totalFetched: items.length,
    totalInserted: result.inserted,
    totalUpdated: result.updated,
    totalUnchanged: result.unchanged,
    totalErrors: result.errors.length,
  });

  return {
    inserted: result.inserted + result.updated,
    skipped: result.unchanged,
    errors: result.errors,
  };
}
