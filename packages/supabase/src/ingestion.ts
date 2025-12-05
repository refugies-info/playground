import { type SupabaseClient } from "@supabase/supabase-js";

// Wait, I saw `packages/supabase/scripts/seed-ingestion.ts` had `parseYYYYMMMDD`.
// I should probably make it a utility if I want to reuse it, or just keep it local if it's specific.
// I'll keep it local to this file for now as it's specific to this data format.

export interface IngestionResult {
  recordId: string;
  status: "success" | "error";
  error?: any;
  reportResults?: { type: string; status: "success" | "error"; error?: any }[];
}

export interface IngestionData {
  xmlContent: string;
  markdownContent: string;
  metadata: any;
  complianceReport?: { markdown: string; metadata: any };
  duplicatesReport?: { markdown: string; metadata: any };
}

function parseYYYYMMMDD_Local(dateStr: string): Date {
    if (!dateStr || dateStr.length !== 8) return new Date(); // Fallback
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    return new Date(`${year}-${month}-${day}`);
}

export async function ingestRcoData(
  supabase: SupabaseClient,
  data: IngestionData
): Promise<IngestionResult> {
  const { xmlContent, markdownContent, metadata, complianceReport, duplicatesReport } = data;

  // Extract info from metadata
  // Assuming metadata structure based on seed-ingestion.ts
  const formation = metadata?.lheo?.offres?.formation?.[0];
  const action = formation?.action?.[0];

  if (!formation || !action) {
      return { recordId: "", status: "error", error: "Invalid metadata structure" };
  }

  const trainingOfferId = formation.attributes?.numero;
  const trainingActionId = action.attributes?.numero;

  const sourceCreatedAt = parseYYYYMMMDD_Local(action.attributes?.datecrea).toISOString();
  const sourceUpdatedAt = parseYYYYMMMDD_Local(action.attributes?.datemaj).toISOString();

  console.log(
    `Inserting ingestion record for training_offer_id: ${trainingOfferId}, training_id: ${trainingActionId}`
  );

  const { data: record, error: recordError } = await supabase
    .from("rco_ingestion_records")
    .insert({
      training_offer_id: trainingOfferId,
      training_action_id: trainingActionId,
      source_created_at: sourceCreatedAt,
      source_updated_at: sourceUpdatedAt,
      source_raw: xmlContent,
      markdown: markdownContent,
      metadata: metadata,
      is_current_version: true,
    })
    .select()
    .single();

  if (recordError) {
    console.error("Error inserting ingestion record:", recordError);
    return { recordId: "", status: "error", error: recordError };
  }

  const recordId = record.id;
  const reportResults = [];

  // Insert Reports if they exist
  const reportsToInsert = [];
  if (complianceReport) reportsToInsert.push({ ...complianceReport, type: "compliance" });
  if (duplicatesReport) reportsToInsert.push({ ...duplicatesReport, type: "duplicates" });

  for (const report of reportsToInsert) {
      console.log(`Inserting ${report.type} report...`);
      const { error: reportError } = await supabase
        .from("rco_ingestion_reports")
        .insert({
          record_id: recordId,
          report_type: report.type,
          markdown: report.markdown,
          metadata: report.metadata,
        });

      if (reportError) {
          console.error(`Error inserting ${report.type} report:`, reportError);
          reportResults.push({ type: report.type, status: "error" as const, error: reportError });
      } else {
          reportResults.push({ type: report.type, status: "success" as const });
      }
  }

  return {
      recordId,
      status: "success",
      reportResults
  };
}
