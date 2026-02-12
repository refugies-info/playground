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
 * Filter for Carif-Oref services based on conventionnement and thematique.
 */
const servicePropertyFilter = (service: Service): boolean => {
  const conventionnement = service.extra?.action?.conventionnement;
  const hasThematique = service.thematiques?.includes(
    "lecture-ecriture-calcul--maitriser-le-francais",
  );

  return conventionnement === "1" && !!hasThematique;
};

/**
 * Generates a deduplication key for a service based on (nom, structure_id).
 */
const getServiceDeduplicateKey = (service: Service): string => {
  return `${service.nom}|${service.structure_id}`;
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
  // and set default filter and deduplication settings if none provided
  const optionsWithExtra: DiIngestionOptions<Service> = {
    filter: servicePropertyFilter,
    deduplicateKey: getServiceDeduplicateKey,
    excludeAllDuplicates: true,
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
  // and set default filter and deduplication settings if none provided
  const optionsWithExtra: DiIngestionOptions<Service> = {
    filter: servicePropertyFilter,
    deduplicateKey: getServiceDeduplicateKey,
    excludeAllDuplicates: true,
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
