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

const DI_AUDIT_LIMIT_ENV = "DI_INGESTION_AUDIT_LIMIT";
const DI_FETCH_PAGE_SIZE = 1000;
const DI_BATCH_SIZE = 100;

type DiAuditTarget = {
  id: string;
  markdown: string;
};

function getDiAuditLimit(): number | null {
  const rawLimit = process.env[DI_AUDIT_LIMIT_ENV];

  if (!rawLimit || !rawLimit.trim()) {
    return null;
  }

  const parsed = Number(rawLimit);

  if (!Number.isFinite(parsed) || parsed < 0) {
    logger.warn(
      { rawLimit },
      `Invalid ${DI_AUDIT_LIMIT_ENV} value, defaulting to unlimited`,
    );
    return null;
  }

  return Math.floor(parsed);
}

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
  limit: number | null,
): Promise<{ targets: DiAuditTarget[]; totalCandidates: number }> {
  const supabase = getSupabaseClient();
  const targets: DiAuditTarget[] = [];
  let totalCandidates = 0;

  // Check how many records are currently pending (null compliance_status AND null ingestion_report_id)
  const { count: pendingCount, error: countError } = await supabase
    .from("ingestion_records")
    .select("id, workflows!inner(compliance_status)", {
      count: "exact",
      head: true,
    })
    .is("ingestion_report_id", null)
    .is("workflows.compliance_status", null);

  if (countError) {
    throw new Error(`Failed to count pending audits: ${countError.message}`);
  }

  const MAX_PENDING_AUDITS = 50;
  const currentPending = pendingCount || 0;
  const remainingSlots = Math.max(0, MAX_PENDING_AUDITS - currentPending);

  logger.info(
    { currentPending, remainingSlots },
    "Checking audit capacity (max 50)",
  );

  if (remainingSlots === 0) {
    logger.info("No slots available for new audits");
    return { targets: [], totalCandidates: 0 };
  }

  const effectiveLimit =
    limit === null ? remainingSlots : Math.min(limit, remainingSlots);

  if (serviceIds.length === 0) {
    return { targets, totalCandidates };
  }

  for (let i = 0; i < serviceIds.length; i += DI_BATCH_SIZE) {
    const batch = serviceIds.slice(i, i + DI_BATCH_SIZE);

    const { data, error } = await supabase
      .from("ingestion_records")
      .select("id, markdown, created_at")
      .in("di_service_id", batch)
      .is("ingestion_report_id", null)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch ingestion records: ${error.message}`);
    }

    const records = data ?? [];
    totalCandidates += records.length;

    for (const record of records) {
      if (targets.length < effectiveLimit) {
        targets.push({ id: record.id, markdown: record.markdown });
      }
    }
  }

  return {
    targets,
    totalCandidates,
  };
}

export async function generateDiAuditReportsStep(runId: string) {
  "use step";

  const auditLimit = getDiAuditLimit();

  if (auditLimit === 0) {
    logger.info(
      { runId, limit: auditLimit },
      "DI audit limit set to 0, skipping Letta audit reports",
    );
    return { attempted: 0, succeeded: 0, failed: 0, limit: auditLimit };
  }

  const serviceIds = await fetchDiServiceIdsForRun(runId);

  if (serviceIds.length === 0) {
    logger.info({ runId }, "No DI services found for audit reporting");
    return { attempted: 0, succeeded: 0, failed: 0, limit: auditLimit };
  }

  const { targets, totalCandidates } = await fetchDiAuditTargets(
    serviceIds,
    auditLimit,
  );

  if (targets.length === 0) {
    logger.info({ runId }, "No ingestion records found for audit reporting");
    return {
      attempted: 0,
      succeeded: 0,
      failed: 0,
      limit: auditLimit,
      totalCandidates,
      skipped: 0,
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

  const skipped =
    auditLimit === null ? 0 : Math.max(0, totalCandidates - targets.length);

  logger.info(
    {
      runId,
      limit: auditLimit ?? "unlimited",
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
    limit: auditLimit,
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
