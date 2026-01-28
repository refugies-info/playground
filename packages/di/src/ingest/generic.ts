import { logger } from "@playground/shared-types";
import type { Database } from "@playground/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DiApiResponseSchema } from "./schemas";
import {
  DEFAULT_BATCH_SIZE,
  DEFAULT_PAGE_SIZE,
  type DiIngestionOptions,
  SOURCE_CARIF_OREF,
} from "./shared";

/**
 * Generic result type for DI ingestion
 */
export interface DiGenericIngestionResult {
  totalFetched: number;
  totalInserted: number;
  totalSkipped: number;
  errors: Array<{ id: string; error: unknown }>;
}

/**
 * Generic page type for DI API responses
 */
export interface DiPage<T> {
  items: T[];
  total: number;
  pages: number;
}

/**
 * Generic DI item type
 */
export type DiItem = { id: string; nom: string; source: string };

/**
 * Generic fetch function for DI API
 * Fetches items from Data Inclusion API with pagination
 * Filters by source = "carif-oref"
 * Stops when limit is reached (if specified)
 *
 * @param endpointFn - The API endpoint function to call
 * @param itemType - The type of item being fetched (for logging)
 * @param options - Ingestion options (pageSize, limit, onProgress callback)
 */
export async function fetchAllCarifOrefItems<T extends DiItem>(
  endpointFn: (params: {
    query: { page: number; size: number; sources: string[] };
  }) => Promise<{ data?: DiPage<T>; error?: unknown }>,
  itemType: string,
  options: DiIngestionOptions = {},
): Promise<T[]> {
  const { pageSize = DEFAULT_PAGE_SIZE, limit, onProgress } = options;
  const allItems: T[] = [];
  let currentPage = 1;
  let totalPages: number | null = null;
  let totalItems: number | null = null;

  logger.info(
    { source: SOURCE_CARIF_OREF, pageSize, limit: limit ?? "unlimited" },
    `Starting DI API fetch for ${itemType}`,
  );

  while (true) {
    const response = await endpointFn({
      query: {
        page: currentPage,
        size: pageSize,
        sources: [SOURCE_CARIF_OREF],
      },
    });

    // Validate API response structure with Zod
    const parsed = DiApiResponseSchema.safeParse(response);
    if (!parsed.success) {
      logger.error(
        { page: currentPage, error: parsed.error.format() },
        `Invalid API response structure for ${itemType}`,
      );
      throw new Error(
        `Invalid API response for ${itemType} page ${currentPage}: ${parsed.error.message}`,
      );
    }

    if (parsed.data.error) {
      logger.error(
        { page: currentPage, error: parsed.data.error },
        `Failed to fetch ${itemType} page`,
      );
      throw new Error(
        `Failed to fetch ${itemType} page ${currentPage}: ${JSON.stringify(parsed.data.error)}`,
      );
    }

    const data = parsed.data.data;
    if (!data) {
      throw new Error(
        `Failed to fetch ${itemType} page ${currentPage}: no data returned`,
      );
    }
    allItems.push(...(data.items as T[]));

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
  }

  // Trim to exact limit if we fetched more
  const result = limit ? allItems.slice(0, limit) : allItems;

  logger.info(
    { totalFetched: result.length, pagesProcessed: currentPage },
    `Completed DI API fetch for ${itemType}`,
  );

  return result;
}

/**
 * Generic insert function for DI items
 * Inserts items into Supabase table
 * Stores the full item as raw_data (JSON string) and the parsed item in data (jsonb)
 *
 * @param supabase - Supabase client with admin privileges
 * @param items - Items to insert
 * @param tableName - Name of the table to insert into
 * @param itemType - The type of item being inserted (for logging)
 */
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
  let inserted = 0;
  const skipped = 0;
  const errors: Array<{ id: string; error: unknown }> = [];

  const totalBatches = Math.ceil(items.length / DEFAULT_BATCH_SIZE);
  logger.info(
    {
      totalItems: items.length,
      batchSize: DEFAULT_BATCH_SIZE,
      totalBatches,
    },
    `Starting database insertion for ${itemType}`,
  );

  for (let i = 0; i < items.length; i += DEFAULT_BATCH_SIZE) {
    const batchIndex = Math.floor(i / DEFAULT_BATCH_SIZE) + 1;
    const batch = items.slice(i, i + DEFAULT_BATCH_SIZE);

    const records = batch.map((item) => ({
      raw_data: JSON.stringify(item),
      data: item,
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

      // If batch fails, try individual inserts to identify problematic records
      let batchInserted = 0;
      let batchErrors = 0;

      for (const item of batch) {
        const { error: singleError } = await supabase.from(tableName).insert({
          raw_data: JSON.stringify(item),
          data: item,
        });

        if (singleError) {
          errors.push({ id: item.id, error: singleError });
          batchErrors++;
          logger.error(
            {
              id: item.id,
              nom: item.nom,
              error: singleError.message,
            },
            `Failed to insert ${itemType.slice(0, -1)}`, // Remove 's' for singular
          );
        } else {
          inserted++;
          batchInserted++;
        }
      }

      logger.info(
        { batchIndex, batchInserted, batchErrors },
        `Completed fallback insertion for ${itemType} batch`,
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
        `${itemType.slice(0, -1).charAt(0).toUpperCase() + itemType.slice(0, -1).slice(1)} batch inserted successfully`,
      );
    }
  }

  logger.info(
    { inserted, skipped, errorCount: errors.length },
    `Completed database insertion for ${itemType}`,
  );

  return { inserted, skipped, errors };
}

/**
 * Generic ingestion function for DI items
 * Ingests items from Data Inclusion API into Supabase table
 *
 * @param supabase - Supabase client with admin privileges
 * @param endpointFn - The API endpoint function to call
 * @param tableName - Name of the table to insert into
 * @param itemType - The type of item being ingested (for logging)
 * @param options - Ingestion options (pageSize, limit, onProgress callback)
 * @returns Ingestion results with counts and any errors
 */
export async function ingestCarifOrefItems<T extends DiItem>(
  supabase: SupabaseClient<Database>,
  endpointFn: (params: {
    query: { page: number; size: number; sources: string[] };
  }) => Promise<{ data?: DiPage<T>; error?: unknown }>,
  tableName: "di_structures" | "di_services",
  itemType: string,
  options: DiIngestionOptions = {},
): Promise<DiGenericIngestionResult> {
  const startTime = Date.now();
  logger.info(
    { source: SOURCE_CARIF_OREF },
    `=== Starting DI ${itemType} ingestion ===`,
  );

  // 1. Fetch all items from DI API
  const items = await fetchAllCarifOrefItems(endpointFn, itemType, options);

  // 2. Insert into Supabase
  const { inserted, skipped, errors } = await insertItems(
    supabase,
    items,
    tableName,
    itemType,
  );

  const durationMs = Date.now() - startTime;
  const durationSec = (durationMs / 1000).toFixed(2);

  logger.info(
    {
      totalFetched: items.length,
      totalInserted: inserted,
      totalSkipped: skipped,
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
    totalFetched: items.length,
    totalInserted: inserted,
    totalSkipped: skipped,
    errors,
  };
}
