import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import {
  type IngestionRunSummary,
  mapIngestionRunSummary,
} from "@/lib/ingestion-run";
import type { IngestionSource } from "@/lib/ingestion-source";

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
  return data ? mapIngestionRunSummary(data) : null;
}
