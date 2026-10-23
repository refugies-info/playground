import { toOriginId } from "@playground/offre-info";
import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import {
  type IngestionRunDocument,
  type IngestionRunSummary,
  mapIngestionRunSummary,
  rcoOutcomeActionNumbers,
} from "@/lib/ingestion-run";
import type { IngestionSource } from "@/lib/ingestion-source";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

// Fiches already known for these actions (DI or RCO), by numero_action.
async function getDocumentsByActionNumber(
  supabase: SupabaseServerClient,
  actionNumbers: string[],
): Promise<Map<string, IngestionRunDocument>> {
  if (actionNumbers.length === 0) return new Map();
  const actionNumberByOriginId = new Map(
    actionNumbers.map((actionNumber) => [
      toOriginId(actionNumber),
      actionNumber,
    ]),
  );

  const { data, error } = await supabase
    .from("workflows_enriched")
    .select("id, title, external_id")
    .in("external_id", [...actionNumberByOriginId.keys()]);

  if (error) {
    logger.error(error, "Error fetching documents of ingestion run actions");
    return new Map();
  }

  const documentsByActionNumber = new Map<string, IngestionRunDocument>();
  for (const { id, title, external_id } of data ?? []) {
    const actionNumber = external_id && actionNumberByOriginId.get(external_id);
    if (id && actionNumber && !documentsByActionNumber.has(actionNumber)) {
      documentsByActionNumber.set(actionNumber, { id, title });
    }
  }
  return documentsByActionNumber;
}

export async function getLatestIngestionRun(
  source: IngestionSource,
): Promise<IngestionRunSummary | null> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data, error } = await supabase
    .from("ingestion_runs")
    .select(
      "id, source, status, created_at, completed_at, options, total_fetched, total_inserted, total_updated, total_unchanged, total_errors, checkpoint",
    )
    .eq("source", source)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    logger.error(error, "Error fetching latest ingestion run");
    return null;
  }
  if (!data) return null;

  const documentsByActionNumber = await getDocumentsByActionNumber(
    supabase,
    rcoOutcomeActionNumbers(data.checkpoint),
  );
  return mapIngestionRunSummary(data, documentsByActionNumber);
}
