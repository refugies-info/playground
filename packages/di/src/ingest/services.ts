import { logger } from "@playground/shared-types";
import type { Database } from "@playground/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { diClient } from "../client";
import type { Service } from "../types";
import { fetchAllCarifOrefItems, ingestCarifOrefItems } from "./generic";
import type { DiIngestionOptions } from "./shared";

export interface DiServicesIngestionResult {
  runId: string;
  totalFetched: number;
  totalInserted: number;
  totalUpdated: number;
  totalUnchanged: number;
  errors: Array<{ serviceId: string; error: unknown }>;
}

/**
 * Creates a filter for Carif-Oref services that handles both property filtering
 * and deduplication based on (nom, structure_id).
 */
const createServiceFilter = (): ((service: Service) => boolean) => {
  const seenKeys = new Set<string>();

  return (service: Service): boolean => {
    // 1. Property filtering
    const conventionnement = service.extra?.action?.conventionnement;
    const hasThematique = service.thematiques?.includes(
      "lecture-ecriture-calcul--maitriser-le-francais",
    );

    if (conventionnement !== "1" || !hasThematique) {
      return false;
    }

    // 2. Deduplication based on (nom, structure_id)
    const key = `${service.nom}|${service.structure_id}`;
    if (seenKeys.has(key)) {
      return false;
    }

    seenKeys.add(key);
    return true;
  };
};

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
  options: DiIngestionOptions<Service> = {},
): Promise<DiServicesIngestionResult> {
  // Merge extra=true into options to populate the extra field on services
  // and set default filter if none provided
  const optionsWithExtra: DiIngestionOptions<Service> = {
    filter: createServiceFilter(),
    ...options,
    extraQueryParams: {
      ...options.extraQueryParams,
      extra: true,
    },
  };

  const result = await ingestCarifOrefItems<Service>(
    supabase,
    (params) => diClient.getServices(params),
    "di_services",
    "services",
    optionsWithExtra,
  );

  // Transform generic result to specific result type
  return {
    runId: result.runId,
    totalFetched: result.totalFetched,
    totalInserted: result.totalInserted,
    totalUpdated: result.totalUpdated,
    totalUnchanged: result.totalUnchanged,
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
  options: DiIngestionOptions<Service> = {},
): Promise<Service[]> {
  // Merge extra=true into options to populate the extra field on services
  // and set default filter if none provided
  const optionsWithExtra: DiIngestionOptions<Service> = {
    filter: createServiceFilter(),
    ...options,
    extraQueryParams: {
      ...options.extraQueryParams,
      extra: true,
    },
  };

  logger.info("Fetching services (inspect mode, no storage)");
  return fetchAllCarifOrefItems<Service>(
    (params) => diClient.getServices(params),
    "services",
    optionsWithExtra,
  );
}
