import { logger } from "@playground/shared-types";
import type { Database } from "@playground/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { listServicesEndpointApiV1ServicesGet, type Service } from "../hey-api";
import { fetchAllCarifOrefItems, ingestCarifOrefItems } from "./generic";
import type { DiIngestionOptions } from "./shared";

export interface DiServicesIngestionResult {
  totalFetched: number;
  totalInserted: number;
  totalSkipped: number;
  errors: Array<{ serviceId: string; error: unknown }>;
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
  const result = await ingestCarifOrefItems(
    supabase,
    listServicesEndpointApiV1ServicesGet,
    "di_services",
    "services",
    options,
  );

  // Transform generic result to specific result type
  return {
    totalFetched: result.totalFetched,
    totalInserted: result.totalInserted,
    totalSkipped: result.totalSkipped,
    errors: result.errors.map((e) => ({
      serviceId: e.id,
      error: e.error,
    })),
  };
}

/**
 * Fetch services from DI API without storing them (for inspection/testing)
 */
export async function fetchCarifOrefServices(
  options: DiIngestionOptions = {},
): Promise<Service[]> {
  logger.info("Fetching services (inspect mode, no storage)");
  return fetchAllCarifOrefItems(
    listServicesEndpointApiV1ServicesGet,
    "services",
    options,
  );
}
