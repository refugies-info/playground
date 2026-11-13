import type { SupabaseClient } from "@supabase/supabase-js";
import { computeContentHash, type IngestionRunStats } from "./ingestion-runs";
import type { Database, Json } from "./types";

type Supabase = SupabaseClient<Database>;

export type IngestionOrigin = Database["public"]["Enums"]["origin"];

export type LatestService = {
  origin: IngestionOrigin;
  content_hash: string | null;
  data: Json | null;
  structure_id: string | null;
};

export type ServiceVersion = {
  document: { id: string };
  hash: string;
  structure: { id: string };
  // Called after the services insert: a throw leaves the same rows as before.
  toIngestionRecord: (() => { markdown: string; metadata: Json }) | null;
};

export type IngestionProvider<Item, Result> = {
  runSource: "rco";
  fetchAll: () => Promise<Item[]>;
  isFatalError: (error: unknown) => boolean;
  ingestBatch: (
    supabase: Supabase,
    items: Item[],
    runId: string,
  ) => Promise<Result>;
  emptyResult: () => Result;
  addResult: (total: Result, batch: Result) => Result;
  toRunStats: (result: Result) => IngestionRunStats;
  errorsOf: (result: Result) => unknown[];
};

const toVersionRow = (
  document: { id: string },
  hash: string,
  runId: string,
  origin: IngestionOrigin,
) => ({
  raw_data: JSON.stringify(document),
  data: document as unknown as Json,
  content_hash: hash,
  origin,
  ingestion_run_id: runId,
});

export async function fetchLatestServices(
  supabase: Supabase,
  originIds: string[],
): Promise<Map<string, LatestService>> {
  const { data, error } = await supabase
    .from("services_latest")
    .select("origin_id, origin, content_hash, data, structure_id")
    .in("origin_id", originIds);
  if (error) throw new Error(`services_latest lookup failed: ${error.message}`);

  const latestByOriginId = new Map<string, LatestService>();
  for (const row of data ?? []) {
    if (!row.origin_id || !row.origin) continue;
    latestByOriginId.set(row.origin_id, {
      origin: row.origin,
      content_hash: row.content_hash,
      data: row.data,
      structure_id: row.structure_id,
    });
  }
  return latestByOriginId;
}

export async function fetchStructureIdsBySiret(
  supabase: Supabase,
  sirets: string[],
): Promise<Map<string, string>> {
  if (sirets.length === 0) return new Map();
  const { data, error } = await supabase
    .from("structures_latest")
    .select("origin_id, siret:data->>siret")
    .in("data->>siret", [...new Set(sirets)]);
  if (error)
    throw new Error(`structures_latest siret lookup failed: ${error.message}`);

  const structureIdBySiret = new Map<string, string>();
  for (const row of data ?? []) {
    if (row.origin_id && row.siret && !structureIdBySiret.has(row.siret)) {
      structureIdBySiret.set(row.siret, row.origin_id);
    }
  }
  return structureIdBySiret;
}

export async function writeStructures(
  supabase: Supabase,
  structures: { id: string }[],
  runId: string,
  origin: IngestionOrigin,
): Promise<{ uuidByOriginId: Map<string, string>; written: number }> {
  const structureById = new Map(
    structures.map((structure) => [structure.id, structure]),
  );
  const { data: latest, error } = await supabase
    .from("structures_latest")
    .select("id, origin_id, content_hash")
    .in("origin_id", [...structureById.keys()]);
  if (error)
    throw new Error(`structures_latest lookup failed: ${error.message}`);

  const uuidByOriginId = new Map<string, string>();
  const hashByOriginId = new Map<string, string | null>();
  for (const row of latest ?? []) {
    if (!row.origin_id || !row.id) continue;
    uuidByOriginId.set(row.origin_id, row.id);
    hashByOriginId.set(row.origin_id, row.content_hash);
  }

  const changed = [...structureById.values()]
    .map((structure) => ({ structure, hash: computeContentHash(structure) }))
    .filter(({ structure, hash }) => hashByOriginId.get(structure.id) !== hash);
  if (changed.length === 0) return { uuidByOriginId, written: 0 };

  const { data: inserted, error: insertError } = await supabase
    .from("structures")
    .insert(
      changed.map(({ structure, hash }) =>
        toVersionRow(structure, hash, runId, origin),
      ),
    )
    .select("id, origin_id");
  if (insertError)
    throw new Error(`structures insert failed: ${insertError.message}`);

  for (const row of inserted ?? []) {
    if (row.origin_id) uuidByOriginId.set(row.origin_id, row.id);
  }
  return { uuidByOriginId, written: changed.length };
}

export async function writeServiceVersions(
  supabase: Supabase,
  versions: ServiceVersion[],
  structureUuidByOriginId: Map<string, string>,
  runId: string,
  origin: IngestionOrigin,
): Promise<number> {
  const { data: services, error } = await supabase
    .from("services")
    .insert(
      versions.map(({ document, hash }) =>
        toVersionRow(document, hash, runId, origin),
      ),
    )
    .select("id, origin_id");
  if (error || !services)
    throw new Error(`services insert failed: ${error?.message}`);

  const serviceIdByOriginId = new Map(
    services.map((service) => [service.origin_id, service.id]),
  );
  const records = versions
    .filter(({ toIngestionRecord }) => toIngestionRecord !== null)
    .map(({ document, structure, toIngestionRecord }) => ({
      service_id: serviceIdByOriginId.get(document.id) as string,
      structure_id: structureUuidByOriginId.get(structure.id) ?? null,
      ...(toIngestionRecord as NonNullable<typeof toIngestionRecord>)(),
    }));
  if (records.length === 0) return 0;

  const { error: recordError } = await supabase
    .from("ingestion_records")
    .insert(records);
  if (recordError) {
    // Otherwise the next run sees an unchanged hash and never creates the records.
    await supabase
      .from("services")
      .delete()
      .in(
        "id",
        services.map((service) => service.id),
      );
    throw new Error(`ingestion_records insert failed: ${recordError.message}`);
  }
  return records.length;
}
