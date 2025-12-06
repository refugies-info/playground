import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export interface IngestionResult {
  rcoRecordId: string;
  ingestionRecordId: string;
  status: "success" | "error";
  error?: unknown;
  reportResults?: {
    type: string;
    status: "success" | "error";
    error?: unknown;
  }[];
}

export interface IngestionData {
  xmlContent: string;
  markdownContent: string;
  // biome-ignore lint/suspicious/noExplicitAny: Supabase Json compatibility
  metadata: any;
  // biome-ignore lint/suspicious/noExplicitAny: Supabase Json compatibility
  complianceReport?: { markdown: string; metadata: any };
  // biome-ignore lint/suspicious/noExplicitAny: Supabase Json compatibility
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
  supabase: SupabaseClient<Database>,
  data: IngestionData,
): Promise<IngestionResult> {
  const {
    xmlContent,
    markdownContent,
    metadata,
    complianceReport,
    duplicatesReport,
  } = data;

  // Extract info from metadata
  // Assuming metadata structure based on seed-ingestion.ts
  const formation = metadata?.lheo?.offres?.formation?.[0];
  const action = formation?.action?.[0];

  if (!formation || !action) {
    return {
      rcoRecordId: "",
      ingestionRecordId: "",
      status: "error",
      error: "Invalid metadata structure",
    };
  }

  const trainingOfferId = formation.attributes?.numero;
  const trainingActionId = action.attributes?.numero;

  const sourceCreatedAt = parseYYYYMMMDD_Local(
    action.attributes?.datecrea,
  ).toISOString();
  const sourceUpdatedAt = parseYYYYMMMDD_Local(
    action.attributes?.datemaj,
  ).toISOString();

  // biome-ignore lint/suspicious/noConsole: Log ingestion progress
  console.log(
    `Inserting rco_record for training_offer_id: ${trainingOfferId}, training_id: ${trainingActionId}`,
  );

  // 1. Insert Raw RCO Record
  const { data: rcoRecord, error: rcoError } = await supabase
    .from("rco_records")
    .insert({
      training_offer_id: trainingOfferId,
      training_action_id: trainingActionId,
      source_created_at: sourceCreatedAt,
      source_updated_at: sourceUpdatedAt,
      source_raw: xmlContent,
      metadata: metadata,
    })
    .select()
    .single();

  if (rcoError) {
    // biome-ignore lint/suspicious/noConsole: Log error
    console.error("Error inserting rco_record:", rcoError);
    return {
      rcoRecordId: "",
      ingestionRecordId: "",
      status: "error",
      error: rcoError,
    };
  }

  const rcoRecordId = rcoRecord.id;
  const reportResults: {
    type: string;
    status: "success" | "error";
    error?: unknown;
  }[] = [];

  // 2. Insert Reports
  let complianceReportId = null;
  let duplicatesReportId = null;

  // Helper to insert report
  const insertReport = async (
    type: string,
    // biome-ignore lint/suspicious/noExplicitAny: Supabase Json compatibility
    reportData: { markdown: string; metadata: any },
  ) => {
    // biome-ignore lint/suspicious/noConsole: Log progress
    console.log(`Inserting ${type} report...`);
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        report_type: type,
        markdown: reportData.markdown,
        metadata: reportData.metadata,
      })
      .select("id")
      .single();

    if (reportError) {
      // biome-ignore lint/suspicious/noConsole: Log error
      console.error(`Error inserting ${type} report:`, reportError);
      reportResults.push({ type, status: "error", error: reportError });
      return null;
    }
    reportResults.push({ type, status: "success" });
    return report.id;
  };

  if (complianceReport) {
    complianceReportId = await insertReport("compliance", complianceReport);
  }

  if (duplicatesReport) {
    duplicatesReportId = await insertReport("duplicates", duplicatesReport);
  }

  // 3. Insert Ingestion Record
  // biome-ignore lint/suspicious/noConsole: Log progress
  console.log("Inserting ingestion_record...");
  const { data: ingestionRecord, error: ingestionError } = await supabase
    .from("ingestion_records")
    .insert({
      markdown: markdownContent,
      metadata: metadata,
      rco_record_id: rcoRecordId,
      compliance_report_id: complianceReportId,
      duplicates_report_id: duplicatesReportId,
    })
    .select()
    .single();

  if (ingestionError) {
    // biome-ignore lint/suspicious/noConsole: Log error
    console.error("Error inserting ingestion_record:", ingestionError);
    // We might want to rollback or something, but for now just report error
    return {
      rcoRecordId,
      ingestionRecordId: "", // Failed
      status: "error",
      error: ingestionError,
      reportResults,
    };
  }

  return {
    rcoRecordId,
    ingestionRecordId: ingestionRecord.id,
    status: "success",
    reportResults,
  };
}
