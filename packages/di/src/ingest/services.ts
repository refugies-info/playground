import { logger } from "@playground/shared-types";
import type { Database } from "@playground/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listServicesEndpointApiV1ServicesGet,
  type PageService,
  type Service,
} from "../hey-api";
import {
  DEFAULT_BATCH_SIZE,
  DEFAULT_PAGE_SIZE,
  type DiIngestionOptions,
  SOURCE_CARIF_OREF,
} from "./shared";

export interface DiServicesIngestionResult {
  totalFetched: number;
  totalInserted: number;
  totalSkipped: number;
  errors: Array<{ serviceId: string; error: unknown }>;
}

/**
 * Fetch services from Data Inclusion API with pagination
 * Filters by source = "carif-oref"
 * Stops when limit is reached (if specified)
 */
async function fetchAllCarifOrefServices(
  options: DiIngestionOptions = {},
): Promise<Service[]> {
  const { pageSize = DEFAULT_PAGE_SIZE, limit, onProgress } = options;
  const allServices: Service[] = [];
  let currentPage = 1;
  let totalPages: number | null = null;
  let totalItems: number | null = null;

  logger.info(
    { source: SOURCE_CARIF_OREF, pageSize, limit: limit ?? "unlimited" },
    "Starting DI API fetch for services",
  );

  while (true) {
    const response = await listServicesEndpointApiV1ServicesGet({
      query: {
        page: currentPage,
        size: pageSize,
        sources: [SOURCE_CARIF_OREF],
      },
    });

    if (response.error) {
      logger.error(
        { page: currentPage, error: response.error },
        "Failed to fetch services page",
      );
      throw new Error(
        `Failed to fetch services page ${currentPage}: ${JSON.stringify(response.error)}`,
      );
    }

    const data = response.data as PageService;
    allServices.push(...data.items);

    if (totalPages === null) {
      totalPages = data.pages;
      totalItems = data.total;
      logger.info(
        { totalItems, totalPages, pageSize, limit: limit ?? "unlimited" },
        "DI API pagination initialized for services",
      );
    }

    logger.debug(
      {
        page: currentPage,
        totalPages,
        itemsInPage: data.items.length,
        fetchedSoFar: allServices.length,
        totalItems,
      },
      "Fetched services page",
    );

    onProgress?.(allServices.length, limit ?? data.total);

    // Stop if we've reached the limit
    if (limit && allServices.length >= limit) {
      logger.info(
        { limit, fetched: allServices.length },
        "Limit reached, stopping services fetch",
      );
      break;
    }

    if (currentPage >= data.pages) {
      break;
    }

    currentPage++;
  }

  // Trim to exact limit if we fetched more
  const result = limit ? allServices.slice(0, limit) : allServices;

  logger.info(
    { totalFetched: result.length, pagesProcessed: currentPage },
    "Completed DI API fetch for services",
  );

  return result;
}

/**
 * Insert services into the di_services table
 * Stores the full service as raw_data (JSON string) and the parsed service in data (jsonb)
 */
async function insertServices(
  supabase: SupabaseClient<Database>,
  services: Service[],
): Promise<{
  inserted: number;
  skipped: number;
  errors: Array<{ serviceId: string; error: unknown }>;
}> {
  let inserted = 0;
  const skipped = 0;
  const errors: Array<{ serviceId: string; error: unknown }> = [];

  const totalBatches = Math.ceil(services.length / DEFAULT_BATCH_SIZE);
  logger.info(
    {
      totalServices: services.length,
      batchSize: DEFAULT_BATCH_SIZE,
      totalBatches,
    },
    "Starting database insertion for services",
  );

  for (let i = 0; i < services.length; i += DEFAULT_BATCH_SIZE) {
    const batchIndex = Math.floor(i / DEFAULT_BATCH_SIZE) + 1;
    const batch = services.slice(i, i + DEFAULT_BATCH_SIZE);

    const records = batch.map((service) => ({
      raw_data: JSON.stringify(service),
      data: service,
    }));

    const { data, error } = await supabase
      .from("di_services")
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
        "Batch insert failed for services, falling back to individual inserts",
      );

      // If batch fails, try individual inserts to identify problematic records
      let batchInserted = 0;
      let batchErrors = 0;

      for (const service of batch) {
        const { error: singleError } = await supabase
          .from("di_services")
          .insert({
            raw_data: JSON.stringify(service),
            data: service,
          });

        if (singleError) {
          errors.push({ serviceId: service.id, error: singleError });
          batchErrors++;
          logger.error(
            {
              serviceId: service.id,
              serviceName: service.nom,
              error: singleError.message,
            },
            "Failed to insert service",
          );
        } else {
          inserted++;
          batchInserted++;
        }
      }

      logger.info(
        { batchIndex, batchInserted, batchErrors },
        "Completed fallback insertion for services batch",
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
        "Services batch inserted successfully",
      );
    }
  }

  logger.info(
    { inserted, skipped, errorCount: errors.length },
    "Completed database insertion for services",
  );

  return { inserted, skipped, errors };
}

/**
 * Ingest carif-oref services from Data Inclusion API into the di_services table
 *
 * @param supabase - Supabase client with admin privileges
 * @param options - Ingestion options (pageSize, limit, onProgress callback)
 * @returns Ingestion results with counts and any errors
 *
 * @example
 * // Ingest all services
 * await ingestCarifOrefServices(supabase);
 *
 * // Ingest only 10 services (for testing)
 * await ingestCarifOrefServices(supabase, { limit: 10 });
 */
export async function ingestCarifOrefServices(
  supabase: SupabaseClient<Database>,
  options: DiIngestionOptions = {},
): Promise<DiServicesIngestionResult> {
  const startTime = Date.now();
  logger.info(
    { source: SOURCE_CARIF_OREF },
    "=== Starting DI services ingestion ===",
  );

  // 1. Fetch all services from DI API
  const services = await fetchAllCarifOrefServices(options);

  // 2. Insert into Supabase
  const { inserted, skipped, errors } = await insertServices(
    supabase,
    services,
  );

  const durationMs = Date.now() - startTime;
  const durationSec = (durationMs / 1000).toFixed(2);

  logger.info(
    {
      totalFetched: services.length,
      totalInserted: inserted,
      totalSkipped: skipped,
      errorCount: errors.length,
      durationMs,
      durationSec: `${durationSec}s`,
    },
    "=== DI services ingestion completed ===",
  );

  if (errors.length > 0) {
    logger.warn(
      { errorCount: errors.length, firstErrors: errors.slice(0, 5) },
      "Some services failed to insert",
    );
  }

  return {
    totalFetched: services.length,
    totalInserted: inserted,
    totalSkipped: skipped,
    errors,
  };
}

/**
 * Fetch services from DI API without storing them (for inspection/testing)
 */
export async function fetchCarifOrefServices(
  options: DiIngestionOptions = {},
): Promise<Service[]> {
  logger.info("Fetching services (inspect mode, no storage)");
  return fetchAllCarifOrefServices(options);
}
