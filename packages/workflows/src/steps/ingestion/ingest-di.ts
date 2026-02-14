import { APIError } from "@letta-ai/letta-client/error";
import {
  createLettaClient,
  generateIngestionReport,
  parseIngestionResponse,
} from "@playground/agents";
import { logger } from "@playground/shared-types";
import { getSupabaseAdmin, type Json } from "@playground/supabase";
import {
  ingestCarifOrefServices,
  ingestCarifOrefStructures,
  processIngestionRecords,
} from "@refugies-info/di";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
  }

  return getSupabaseAdmin(url, key);
}

const DI_FETCH_PAGE_SIZE = 1000;
const envVal = Number(process.env.MAX_PENDING_AUDITS);
const MAX_PENDING_AUDITS = Number.isNaN(envVal) || envVal <= 0 ? 50 : envVal;

type DiAuditTarget = {
  id: string;
  markdown: string;
};

async function fetchDiServiceIdsForRun(runId: string): Promise<string[]> {
  const supabase = getSupabaseClient();
  const serviceIds: string[] = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("di_services")
      .select("id")
      .eq("ingestion_run_id", runId)
      .range(page * DI_FETCH_PAGE_SIZE, (page + 1) * DI_FETCH_PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Failed to fetch DI services: ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const service of data) {
      serviceIds.push(String(service.id));
    }

    hasMore = data.length === DI_FETCH_PAGE_SIZE;
    page += 1;
  }

  return serviceIds;
}

async function fetchDiAuditTargets(
  serviceIds: string[],
): Promise<{ targets: DiAuditTarget[]; totalCandidates: number }> {
  const supabase = getSupabaseClient();
  let totalCandidates = 0;

  if (serviceIds.length === 0) {
    return { targets: [], totalCandidates };
  }

  // 1. Get total candidates count for reporting (records that could be audited)
  const { count, error: countError } = await supabase
    .from("ingestion_records")
    .select("id, workflows!inner(compliance_status)", {
      count: "exact",
      head: true,
    })
    .in("di_service_id", serviceIds)
    .is("ingestion_report_id", null)
    .or("compliance_status.is.null,compliance_status.eq.pending", {
      foreignTable: "workflows",
    });

  if (countError) {
    throw new Error(`Failed to count audit candidates: ${countError.message}`);
  }
  totalCandidates = count || 0;

  // 2. Atomic claim and fetch via stored procedure
  // This handles the 50-record safety limit, race conditions, and zombie reclamation
  const { data, error: rpcError } = await supabase.rpc(
    "claim_di_audit_targets",
    {
      p_service_ids: serviceIds,
      max_total_pending: MAX_PENDING_AUDITS,
    },
  );

  if (rpcError) {
    throw new Error(`Failed to claim audit targets: ${rpcError.message}`);
  }

  const targets = (data as DiAuditTarget[]) || [];

  logger.info(
    { selected: targets.length, totalCandidates },
    "Audit capacity check and target selection complete",
  );

  return {
    targets,
    totalCandidates,
  };
}

export async function generateDiAuditReportsStep(runId: string) {
  "use step";

  const serviceIds = await fetchDiServiceIdsForRun(runId);

  if (serviceIds.length === 0) {
    logger.info({ runId }, "No DI services found for audit reporting");
    return { attempted: 0, succeeded: 0, failed: 0 };
  }

  const { targets, totalCandidates } = await fetchDiAuditTargets(serviceIds);

  if (targets.length === 0) {
    logger.info({ runId }, "No ingestion records found for audit reporting");
    return {
      attempted: 0,
      succeeded: 0,
      failed: 0,
      totalCandidates,
      skipped: totalCandidates,
    };
  }

  const agentId = process.env.PLAYGROUND_AGENT_ID;

  if (!agentId) {
    throw new Error("PLAYGROUND_AGENT_ID is not defined");
  }

  const lettaClient = createLettaClient();
  const conversation = await lettaClient.conversations.create({
    agent_id: agentId,
  });
  const conversationId = conversation.id;
  const supabase = getSupabaseClient();

  const skipped = Math.max(0, totalCandidates - targets.length);

  logger.info(
    {
      runId,
      totalCandidates,
      selected: targets.length,
      skipped,
    },
    "DI audit report selection",
  );

  let succeeded = 0;
  let failed = 0;

  for (const target of targets) {
    let finalContent = "";

    try {
      for await (const chunk of generateIngestionReport(
        lettaClient,
        target.markdown,
        conversationId,
      )) {
        if (chunk.message_type === "assistant_message") {
          if (typeof chunk.content !== "string") {
            throw new Error(
              `Expected assistant message content to be a string, but got ${typeof chunk.content}`,
            );
          }
          finalContent += chunk.content;
        }
      }

      if (!finalContent) {
        throw new Error("No assistant response received for ingestion report");
      }

      const parsed = parseIngestionResponse(finalContent, agentId);

      const { data: report, error: reportError } = await supabase
        .from("letta_reports")
        .insert({
          agent_id: agentId,
          report_type: "ingestion",
          markdown: parsed.content,
          metadata: parsed.metadata as Json,
          status: parsed.status,
          raw_response: parsed.rawResponse ?? null,
          workflow_id: runId,
        })
        .select("id")
        .single();

      if (reportError || !report) {
        throw new Error(
          `Failed to insert letta_report: ${reportError?.message ?? "unknown error"}`,
        );
      }

      const { error: updateError } = await supabase
        .from("ingestion_records")
        .update({ ingestion_report_id: report.id })
        .eq("id", target.id);

      if (updateError) {
        throw new Error(
          `Failed to link ingestion_report to ingestion_record: ${updateError.message}`,
        );
      }

      succeeded += 1;
    } catch (error) {
      failed += 1;

      if (error instanceof APIError) {
        logger.error(
          { status: error.status, body: error.error },
          "Letta API error generating DI ingestion report",
        );
      } else {
        logger.error(
          { error, ingestionRecordId: target.id },
          "Error generating DI ingestion report",
        );
      }
    }
  }

  return {
    attempted: targets.length,
    succeeded,
    failed,
    totalCandidates,
    skipped,
  };
}

export async function ingestStructuresStep() {
  "use step";
  const supabase = getSupabaseClient();
  logger.info("Starting DI Structures Ingestion Step...");
  logger.info("Starting DI Structures Ingestion Step...");
  const result = await ingestCarifOrefStructures(supabase);
  logger.info({ result }, "DI Structures Ingestion Step Completed");
  return result;
}

export async function ingestServicesStep() {
  "use step";
  const supabase = getSupabaseClient();
  logger.info("Starting DI Services Ingestion Step...");
  logger.info("Starting DI Services Ingestion Step...");
  const result = await ingestCarifOrefServices(supabase);
  logger.info({ result }, "DI Services Ingestion Step Completed");
  return result;
}

export async function processRecordsStep(runId: string) {
  "use step";
  if (!runId) {
    logger.warn("No runId provided to processRecordsStep, skipping.");
    return;
  }
  const supabase = getSupabaseClient();
  logger.info({ runId }, "Starting Ingestion Records Processing Step...");
  await processIngestionRecords(supabase, runId);
  logger.info("Ingestion Records Processing Step Completed");
}

export async function diIngestionWorkflow() {
  "use workflow";

  // 1. Ingest Structures
  const structuresResult = await ingestStructuresStep();

  // 2. Ingest Services
  const servicesResult = await ingestServicesStep();

  // 3. Process new/updated services to create ingestion records
  let auditResult:
    | Awaited<ReturnType<typeof generateDiAuditReportsStep>>
    | undefined;
  if (servicesResult.runId) {
    await processRecordsStep(servicesResult.runId);
    auditResult = await generateDiAuditReportsStep(servicesResult.runId);
  }

  return {
    structures: structuresResult,
    services: servicesResult,
    audit: auditResult,
  };
}
