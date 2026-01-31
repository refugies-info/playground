import type { Database, Json } from "@playground/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { diRecordToIngestionRecord } from "./transform";

export async function processIngestionRecords(
  supabase: SupabaseClient<Database>,
  runId: string,
) {
  const { data: services, error: servicesError } = await supabase
    .from("di_services")
    .select("*")
    .eq("ingestion_run_id", runId);

  if (servicesError) throw new Error(servicesError.message);
  if (!services || services.length === 0) return;

  // Extract unique structure IDs
  const structureIds = [
    ...new Set(services.map((s) => s.di_structure_id).filter(Boolean)),
  ] as string[];

  // Fetch all needed structures (latest versions)
  // We can use `di_structures_latest` view
  const { data: structures, error: structuresError } = await supabase
    .from("di_structures_latest")
    .select("*")
    .in("di_id", structureIds);

  if (structuresError) throw new Error(structuresError.message);

  const structureMap = new Map(structures?.map((s) => [s.di_id, s]));

  const ingestionInserts = [];

  for (const service of services) {
    if (!service.di_structure_id) continue;

    const structure = structureMap.get(service.di_structure_id);
    if (!structure) continue;

    const markdown = diRecordToIngestionRecord(
      service.data as Record<string, unknown>,
      structure.data as Record<string, unknown>,
    );

    ingestionInserts.push({
      di_service_id: service.id,
      di_structure_id: structure.id,
      markdown,
      metadata: (service.data as Json) || {},
      // version is handled by trigger now!
    });
  }

  if (ingestionInserts.length > 0) {
    const { error: insertError } = await supabase
      .from("ingestion_records")
      .insert(ingestionInserts);
    if (insertError) throw new Error(insertError.message);
  }
}
