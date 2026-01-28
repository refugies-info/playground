import type { Database } from "@playground/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type ListedStructure,
  listStructuresEndpointApiV1StructuresGet,
  type PageListedStructure,
} from "./hey-api";

const DEFAULT_PAGE_SIZE = 100;
const SOURCE_CARIF_OREF = "carif-oref";

export interface DiIngestionResult {
  totalFetched: number;
  totalInserted: number;
  totalSkipped: number;
  errors: Array<{ structureId: string; error: unknown }>;
}

export interface DiIngestionOptions {
  pageSize?: number;
  onProgress?: (current: number, total: number | null) => void;
}

/**
 * Fetch all structures from Data Inclusion API with pagination
 * Filters by source = "carif-oref"
 */
async function fetchAllCarifOrefStructures(
  options: DiIngestionOptions = {},
): Promise<ListedStructure[]> {
  const { pageSize = DEFAULT_PAGE_SIZE, onProgress } = options;
  const allStructures: ListedStructure[] = [];
  let currentPage = 1;
  let totalPages: number | null = null;

  while (true) {
    const response = await listStructuresEndpointApiV1StructuresGet({
      query: {
        page: currentPage,
        size: pageSize,
        sources: [SOURCE_CARIF_OREF],
      },
    });

    if (response.error) {
      throw new Error(
        `Failed to fetch structures page ${currentPage}: ${JSON.stringify(response.error)}`,
      );
    }

    const data = response.data as PageListedStructure;
    allStructures.push(...data.items);

    if (totalPages === null) {
      totalPages = data.pages;
    }

    onProgress?.(allStructures.length, data.total);

    if (currentPage >= data.pages) {
      break;
    }

    currentPage++;
  }

  return allStructures;
}

/**
 * Insert structures into the di_structures table
 * Stores the full structure as raw_data (JSON string) and extracts key fields to metadata
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

  // Batch insert for efficiency
  const BATCH_SIZE = 100;

  for (let i = 0; i < structures.length; i += BATCH_SIZE) {
    const batch = structures.slice(i, i + BATCH_SIZE);

    const records = batch.map((structure) => ({
      raw_data: JSON.stringify(structure),
      data: structure,
    }));

    const { data, error } = await supabase
      .from("di_structures")
      .insert(records)
      .select("id");

    if (error) {
      // If batch fails, try individual inserts to identify problematic records
      for (const structure of batch) {
        const { error: singleError } = await supabase
          .from("di_structures")
          .insert({
            raw_data: JSON.stringify(structure),
            data: structure,
          });

        if (singleError) {
          errors.push({ structureId: structure.id, error: singleError });
        } else {
          inserted++;
        }
      }
    } else {
      inserted += data?.length ?? batch.length;
    }
  }

  return { inserted, skipped, errors };
}

/**
 * Ingest all carif-oref structures from Data Inclusion API into the di_structures table
 *
 * @param supabase - Supabase client with admin privileges
 * @param options - Ingestion options (pageSize, onProgress callback)
 * @returns Ingestion results with counts and any errors
 */
export async function ingestCarifOrefStructures(
  supabase: SupabaseClient<Database>,
  options: DiIngestionOptions = {},
): Promise<DiIngestionResult> {
  // 1. Fetch all structures from DI API
  const structures = await fetchAllCarifOrefStructures(options);

  // 2. Insert into Supabase
  const { inserted, skipped, errors } = await insertStructures(
    supabase,
    structures,
  );

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
  return fetchAllCarifOrefStructures(options);
}
