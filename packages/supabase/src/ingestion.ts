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

export async function insertRcoRecord(
  supabase: SupabaseClient<Database>,
  xmlContent: string,
  // biome-ignore lint/suspicious/noExplicitAny: Supabase Json compatibility
  metadata: any,
): Promise<{
    rcoRecordId: string;
    contentFlowId: string;
    error?: unknown;
}> {
  // Extract info from metadata
  const formation = metadata?.lheo?.offres?.formation?.[0];
  const action = formation?.action?.[0];

  if (!formation || !action) {
    return {
      rcoRecordId: "",
      contentFlowId: "",
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
      contentFlowId: "",
      error: rcoError,
    };
  }

  // 2. Fetch Content Flow ID (created by trigger)
  // We might need to wait a small bit or just query? Triggers are usually immediate in same transaction context but here we are using client.
  // Actually, Supabase Triggers run synchronously ON AFTER INSERT?
  // User migration says: `create trigger` ... usually it's AFTER INSERT.
  // If we can't get it immediately, we might need a small retry or just assume it's there.
  // Let's try to fetch it.
  // 2. Fetch Content Flow ID (created by trigger)
  // Retry 3 times with 500ms delay to allow trigger to complete
  let contentFlow = null;
  let flowError = null;

  for (let i = 0; i < 3; i++) {
    const response = await supabase
      .from("content_flows")
      .select("id")
      .eq("rco_record_id", rcoRecord.id)
      .single();

    if (response.data) {
      contentFlow = response.data;
      flowError = null;
      break;
    }

    if (response.error) {
       flowError = response.error;
    }

    // Wait 500ms before retrying
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  if (flowError || !contentFlow) {
      console.error("Error fetching content flow after retries:", flowError);
      return {
          rcoRecordId: rcoRecord.id,
          contentFlowId: "",
          error: flowError || new Error("Content flow not found after retries")
      };
  }

  return {
    rcoRecordId: rcoRecord.id,
    contentFlowId: contentFlow.id,
  };
}

export async function ingestProcessedData(
  supabase: SupabaseClient<Database>,
  data: {
      rcoRecordId: string;
      markdownContent: string;
      // biome-ignore lint/suspicious/noExplicitAny: Supabase Json compatibility
      metadata: any;
      // biome-ignore lint/suspicious/noExplicitAny: Supabase Json compatibility
      complianceReport?: { markdown: string; metadata: any };
      // biome-ignore lint/suspicious/noExplicitAny: Supabase Json compatibility
      duplicatesReport?: { markdown: string; metadata: any };
  }
): Promise<IngestionResult> {
    const {
        rcoRecordId,
        markdownContent,
        metadata,
        complianceReport,
        duplicatesReport,
    } = data;

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
      .from("letta_reports")
      .insert({
        agent_id: reportData.metadata?.letta?.agentId,
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

export async function ingestRcoData(
  supabase: SupabaseClient<Database>,
  data: IngestionData,
): Promise<IngestionResult> {
    // wrapper for backward compatibility
    const rcoResult = await insertRcoRecord(supabase, data.xmlContent, data.metadata);
    if (rcoResult.error || !rcoResult.rcoRecordId) {
        return {
            rcoRecordId: "",
            ingestionRecordId: "",
            status: "error",
            error: rcoResult.error
        }
    }

    return ingestProcessedData(supabase, {
        rcoRecordId: rcoResult.rcoRecordId,
        markdownContent: data.markdownContent,
        metadata: data.metadata,
        complianceReport: data.complianceReport,
        duplicatesReport: data.duplicatesReport
    });
}
