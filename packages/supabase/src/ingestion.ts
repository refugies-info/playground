import { logger } from "@playground/shared-types";
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
  ingestionReport?: { markdown: string; metadata: any };
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
  flowId: string;
  error?: unknown;
}> {
  // Extract info from metadata
  const formation = metadata?.lheo?.offres?.formation?.[0];
  const action = formation?.action?.[0];

  if (!formation || !action) {
    return {
      rcoRecordId: "",
      flowId: "",
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

  logger.info(
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
    logger.error(rcoError, "Error inserting rco_record");
    return {
      rcoRecordId: "",
      flowId: "",
      error: rcoError,
    };
  }

  // 2. Fetch Content Flow ID (created by trigger)
  // The trigger `on_new_rco_record` is synchronous, so the content_flow should exist immediately.
  const { data: flow, error: flowError } = await supabase
    .from("workflows")
    .select("id")
    .eq("rco_record_id", rcoRecord.id)
    .single();

  if (flowError || !flow) {
    logger.error(flowError, "Error fetching content flow after retries");
    return {
      rcoRecordId: rcoRecord.id,
      flowId: "",
      error: flowError || new Error("Content flow not found after retries"),
    };
  }

  return {
    rcoRecordId: rcoRecord.id,
    flowId: flow.id,
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
    ingestionReport?: { markdown: string; metadata: any };
  },
): Promise<IngestionResult> {
  const { rcoRecordId, markdownContent, metadata, ingestionReport } = data;

  const reportResults: {
    type: string;
    status: "success" | "error";
    error?: unknown;
  }[] = [];

  // 2. Insert Reports
  let ingestionReportId = null;

  // Helper to insert report
  const insertReport = async (
    type: string,
    // biome-ignore lint/suspicious/noExplicitAny: Supabase Json compatibility
    reportData: { markdown: string; metadata: any },
  ) => {
    logger.info(`Inserting ${type} report...`);
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
      logger.error(reportError, `Error inserting ${type} report`);
      reportResults.push({ type, status: "error", error: reportError });
      return null;
    }
    reportResults.push({ type, status: "success" });
    return report.id;
  };

  if (ingestionReport) {
    ingestionReportId = await insertReport("ingestion", ingestionReport);
  }

  // 3. Insert Ingestion Record

  logger.info("Inserting ingestion_record...");
  const { data: ingestionRecord, error: ingestionError } = await supabase
    .from("ingestion_records")
    .insert({
      markdown: markdownContent,
      metadata: metadata,
      rco_record_id: rcoRecordId,
      ingestion_report_id: ingestionReportId,
    })
    .select()
    .single();

  if (ingestionError) {
    logger.error(ingestionError, "Error inserting ingestion_record");
    return {
      rcoRecordId,
      ingestionRecordId: "", // Failed
      status: "error",
      error: ingestionError,
      reportResults,
    };
  }

  // 4. Update Content Flow Status based on Compliance
  let status = "unknown";
  const complianceVal = ingestionReport?.metadata?.compliant;

  logger.info(
    "Compliance Metadata Value:",
    complianceVal,
    "Type:",
    typeof complianceVal,
  );

  if (complianceVal === true || complianceVal === "true") {
    status = "compliant";
  } else if (complianceVal === false || complianceVal === "false") {
    status = "non_compliant";
  }

  logger.info(`Updating content_flow status to: ${status}`);
  const { error: statusError } = await supabase
    .from("workflows")
    .update({ status })
    .eq("rco_record_id", rcoRecordId);

  if (statusError) {
    logger.error(statusError, "Error updating content_flow status");
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
  const rcoResult = await insertRcoRecord(
    supabase,
    data.xmlContent,
    data.metadata,
  );
  if (rcoResult.error || !rcoResult.rcoRecordId) {
    return {
      rcoRecordId: "",
      ingestionRecordId: "",
      status: "error",
      error: rcoResult.error,
    };
  }

  return ingestProcessedData(supabase, {
    rcoRecordId: rcoResult.rcoRecordId,
    markdownContent: data.markdownContent,
    metadata: data.metadata,
    ingestionReport: data.ingestionReport,
  });
}
