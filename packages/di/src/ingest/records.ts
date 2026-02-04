import { logger } from "@playground/shared-types";
import type { Database, Json } from "@playground/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { diRecordToIngestionRecord } from "./transform";

const BATCH_SIZE = 100;
const FETCH_PAGE_SIZE = 1000; // Supabase default limit

export async function processIngestionRecords(
  supabase: SupabaseClient<Database>,
  runId: string,
) {
  // Fetch all services with pagination to handle >1000 records
  let allServices: Database["public"]["Tables"]["di_services"]["Row"][] = [];
  let page = 0;
  let hasMore = true;

  logger.info({ runId }, "Fetching services from ingestion run");

  while (hasMore) {
    const { data: services, error: servicesError } = await supabase
      .from("di_services")
      .select("*")
      .eq("ingestion_run_id", runId)
      .range(page * FETCH_PAGE_SIZE, (page + 1) * FETCH_PAGE_SIZE - 1);

    if (servicesError) throw new Error(servicesError.message);

    if (!services || services.length === 0) {
      hasMore = false;
      break;
    }

    allServices = allServices.concat(services);
    logger.debug(
      { page: page + 1, fetched: services.length, total: allServices.length },
      "Fetched services page",
    );

    hasMore = services.length === FETCH_PAGE_SIZE;
    page++;
  }

  if (allServices.length === 0) {
    logger.info("No services found for this run");
    return;
  }

  logger.info(
    { serviceCount: allServices.length },
    "Processing ingestion records",
  );

  // Extract unique structure IDs
  const structureIds = [
    ...new Set(allServices.map((s) => s.di_structure_id).filter(Boolean)),
  ] as string[];

  logger.info(
    { uniqueStructureCount: structureIds.length },
    "Fetching structures",
  );

  // Fetch structures in batches to avoid URI length limits
  const structureMap = new Map();
  const totalBatches = Math.ceil(structureIds.length / BATCH_SIZE);

  for (let i = 0; i < structureIds.length; i += BATCH_SIZE) {
    const batch = structureIds.slice(i, i + BATCH_SIZE);
    const batchIndex = Math.floor(i / BATCH_SIZE) + 1;

    logger.debug(
      { batchIndex, totalBatches, batchSize: batch.length },
      "Fetching structure batch",
    );

    const { data: structures, error: structuresError } = await supabase
      .from("di_structures_latest")
      .select("*")
      .in("di_id", batch);

    if (structuresError) throw new Error(structuresError.message);

    for (const structure of structures || []) {
      if (structure.di_id) {
        structureMap.set(structure.di_id, structure);
      }
    }
  }

  logger.info(
    { fetchedStructures: structureMap.size },
    "Structures fetched successfully",
  );

  // Transform services to ingestion records
  const ingestionInserts = [];

  for (const service of allServices) {
    if (!service.di_structure_id) continue;

    const structure = structureMap.get(service.di_structure_id);
    if (!structure) {
      logger.warn(
        { serviceId: service.id, structureId: service.di_structure_id },
        "Structure not found for service",
      );
      continue;
    }

    const markdown = diRecordToIngestionRecord(
      service.data as Record<string, unknown>,
      structure.data as Record<string, unknown>,
    );

    // Include structure in metadata, matching frontmatter format
    const metadataWithStructure = {
      ...(service.data as Record<string, unknown>),
      structure: structure.data,
    };

    ingestionInserts.push({
      source: "DI",
      di_service_id: service.id,
      di_structure_id: structure.id,
      markdown,
      metadata: metadataWithStructure as Json,
      // version is handled by trigger now!
    });
  }

  logger.info(
    { recordCount: ingestionInserts.length },
    "Inserting ingestion records",
  );

  // Insert in batches to avoid payload size limits
  const insertBatches = Math.ceil(ingestionInserts.length / BATCH_SIZE);
  let totalInserted = 0;

  for (let i = 0; i < ingestionInserts.length; i += BATCH_SIZE) {
    const batch = ingestionInserts.slice(i, i + BATCH_SIZE);
    const batchIndex = Math.floor(i / BATCH_SIZE) + 1;

    logger.debug(
      { batchIndex, insertBatches, batchSize: batch.length },
      "Inserting batch",
    );

    const { error: insertError } = await supabase
      .from("ingestion_records")
      .insert(batch);

    if (insertError) throw new Error(insertError.message);

    totalInserted += batch.length;
  }

  logger.info({ totalInserted }, "Ingestion records created successfully");
}
