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
  logger.info({ runId }, "Finding services without ingestion records");

  // 1. Build a map of known di_service UUIDs by di_id (stable API ID)
  // di_id is used instead of di_service_id (UUID) because each new version
  // of a service gets a new UUID — di_id remains stable across versions.
  // We store a Set of ALL known UUIDs per di_id to avoid false positives
  // when multiple ingestion_records exist for the same di_id (duplicates).
  const knownUuidsByDiId = new Map<string, Set<string>>();
  let irPage = 0;
  let irHasMore = true;

  while (irHasMore) {
    const { data: existing, error: existingError } = await supabase
      .from("ingestion_records")
      .select("id, di_service_id, di_services(di_id)")
      .not("di_service_id", "is", null)
      .range(irPage * FETCH_PAGE_SIZE, (irPage + 1) * FETCH_PAGE_SIZE - 1);

    if (existingError) throw new Error(existingError.message);

    if (!existing || existing.length === 0) {
      irHasMore = false;
      break;
    }

    for (const record of existing) {
      const diId = (record.di_services as { di_id: string } | null)?.di_id;
      if (diId && record.di_service_id) {
        if (!knownUuidsByDiId.has(diId)) knownUuidsByDiId.set(diId, new Set());
        knownUuidsByDiId.get(diId)!.add(record.di_service_id);
      }
    }

    irHasMore = existing.length === FETCH_PAGE_SIZE;
    irPage++;
  }

  logger.info(
    { existingCount: knownUuidsByDiId.size },
    "Found existing ingestion records",
  );

  // 2. Fetch latest version of each service and detect new/updated ones
  // di_services_latest returns exactly one row per di_id (highest version),
  // so we never process outdated duplicates.
  let allServices: Database["public"]["Views"]["di_services_latest"]["Row"][] =
    [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: services, error: servicesError } = await supabase
      .from("di_services_latest")
      .select("*")
      .range(page * FETCH_PAGE_SIZE, (page + 1) * FETCH_PAGE_SIZE - 1);

    if (servicesError) throw new Error(servicesError.message);

    if (!services || services.length === 0) {
      hasMore = false;
      break;
    }

    // Keep only:
    // - New services (di_id not in map)
    // - Updated services (di_id known but this UUID never seen = new version)
    const newOrUpdatedServices = services.filter((s) => {
      if (!s.id || !s.di_id) return false;
      const knownUuids = knownUuidsByDiId.get(s.di_id);
      if (!knownUuids) return true; // new service
      return !knownUuids.has(s.id); // UUID never seen = updated service
    });

    allServices = allServices.concat(newOrUpdatedServices);

    logger.debug(
      {
        page: page + 1,
        fetched: services.length,
        newOrUpdated: newOrUpdatedServices.length,
        total: allServices.length,
      },
      "Fetched services page",
    );

    hasMore = services.length === FETCH_PAGE_SIZE;
    page++;
  }

  if (allServices.length === 0) {
    logger.info("No new services found needing ingestion records");
    return 0;
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
      origin: "DI",
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
  return totalInserted;
}
