import { APIError } from "@letta-ai/letta-client/core/error";
import {
  accumulateUsage,
  createConversation,
  createLettaClient,
  estimateCarbonImpact,
  generateIngestionReport,
  type LettaUsage,
  parseIngestionResponse,
} from "@playground/agents";
import {
  LETTA_MODEL_HANDLE,
  logger,
  TYPE_COMPLIANCE_IA,
  TYPE_UPDATE_COMPLIANCE,
} from "@playground/shared-types";
import type { Json } from "@playground/supabase";
import { getStepMetadata } from "@workflow/core";
import { FatalError } from "@workflow/errors";
import { recordActivity } from "../common/activity-log";
import { getSupabaseClient } from "../common/supabase";
import { getEditorialSource } from "../sources";

/**
 * Forced audit of a DI record by the multi-task agent (/audit command).
 */
async function generateForcedDiReport(markdown: string, workflowId: string) {
  const agentId = process.env.PLAYGROUND_AGENT_ID;
  if (!agentId) {
    throw new FatalError("PLAYGROUND_AGENT_ID is not defined");
  }

  const lettaClient = createLettaClient();
  const conversationId = await createConversation(
    lettaClient,
    agentId,
    `compliance-${workflowId}`,
  );

  let finalContent = "";
  const usage: LettaUsage = {};
  for await (const chunk of generateIngestionReport(
    lettaClient,
    markdown,
    conversationId,
  )) {
    accumulateUsage(usage, chunk);
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

  const parsed = parseIngestionResponse(finalContent, agentId, usage);
  return {
    agentId,
    markdown: parsed.content,
    metadata: parsed.metadata,
    status: parsed.status,
    rawResponse: parsed.rawResponse,
    usage,
    model: LETTA_MODEL_HANDLE,
    complianceStatus:
      parsed.status !== "complete"
        ? "error"
        : parsed.metadata.compliant && !parsed.metadata.duplicate
          ? "compliant"
          : "non_compliant",
  };
}

/**
 * Workflow step that forces generation of an audit report for a specific workflow,
 * bypassing normal batch collection. Used primarily for manual arbitration/retry.
 *
 * @param workflowId - The ID of the workflow to force audit for.
 */
export async function forceAuditReportStep(workflowId: string) {
  "use step";

  const supabase = getSupabaseClient();

  // 1. Fetch workflow to get ingestion_record_id
  const { data: workflow, error: workflowError } = await supabase
    .from("workflows")
    .select("ingestion_record_id, latest_ingestion_record_id")
    .eq("id", workflowId)
    .single();

  if (workflowError || !workflow?.ingestion_record_id) {
    logger.error(
      { workflowId, error: workflowError },
      "Workflow or Ingestion Record not found for forced audit",
    );
    throw new Error("Workflow or Ingestion Record not found");
  }

  const ingestionRecordId = workflow.ingestion_record_id;

  // A previous version exists when the workflow's latest source differs from
  // its active one — the forced audit then records an update verdict rather
  // than a first-time compliance verdict.
  const hasPreviousVersion =
    workflow.latest_ingestion_record_id != null &&
    workflow.latest_ingestion_record_id !== ingestionRecordId;

  // Set compliance status to pending on ingestion_records (RI-1093)
  // Include updated_at to ensure zombie reclamation works correctly
  await supabase
    .from("ingestion_records")
    .update({
      compliance_status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", ingestionRecordId);

  // 2. Fetch Ingestion Record
  const { data: record, error: recordError } = await supabase
    .from("ingestion_records")
    .select("id, markdown, metadata, service:services(origin, data)")
    .eq("id", ingestionRecordId)
    .single<{
      id: string;
      markdown: string;
      metadata: Json;
      service: { origin: string | null; data: Json } | null;
    }>();

  if (recordError || !record) {
    throw new Error(`Ingestion Record not found: ${recordError?.message}`);
  }

  logger.info(
    { workflowId, ingestionRecordId, origin: record.service?.origin },
    "Starting forced arbitration audit",
  );

  try {
    const source = getEditorialSource(record.service?.origin);
    const result = source
      ? await source.arbitrate({
          ingestionRecordId,
          metadata: record.metadata,
          serviceData: record.service?.data,
          workflowId,
        })
      : await generateForcedDiReport(record.markdown, workflowId);

    // Insert Report
    const { data: report, error: reportError } = await supabase
      .from("letta_reports")
      .insert({
        agent_id: result.agentId,
        report_type: "ingestion",
        markdown: result.markdown,
        metadata: result.metadata as Json,
        status: result.status,
        raw_response: result.rawResponse ?? null,
        workflow_id: workflowId,
        token_cost: result.usage?.totalTokens || null,
        carbon_impact: await estimateCarbonImpact(result.model, result.usage),
        model: result.model,
      })
      .select("id")
      .single();

    if (reportError || !report) {
      throw new Error(
        `Failed to insert letta_report: ${reportError?.message ?? "unknown error"}`,
      );
    }

    // Link Report to Ingestion Record
    const { error: updateError } = await supabase
      .from("ingestion_records")
      .update({ ingestion_report_id: report.id })
      .eq("id", ingestionRecordId);

    if (updateError) {
      throw new Error(
        `Failed to link ingestion_report to ingestion_record: ${updateError.message}`,
      );
    }

    const finalComplianceStatus = result.complianceStatus;

    const { error: finalStatusError } = await supabase
      .from("ingestion_records")
      .update({ compliance_status: finalComplianceStatus })
      .eq("id", ingestionRecordId);

    if (finalStatusError) {
      logger.error(
        { error: finalStatusError, ingestionRecordId },
        "Failed to update ingestion_record final status",
      );
      throw new Error(
        `Failed to update compliance status: ${finalStatusError.message}`,
      );
    }

    // Compliance verdict with PapaIA (update if a previous version exists)
    await recordActivity({
      action: hasPreviousVersion ? TYPE_UPDATE_COMPLIANCE : TYPE_COMPLIANCE_IA,
      workflowId,
      lettaReportId: report.id,
      activity: {
        complianceStatus: finalComplianceStatus,
        ingestionRecordId,
        compliant: Boolean(result.metadata.compliant),
        duplicate: Boolean(result.metadata.duplicate),
      },
    });

    logger.info(
      {
        workflowId,
        reportId: report.id,
        complianceStatus: finalComplianceStatus,
      },
      "Forced arbitration audit completed successfully",
    );

    return {
      success: true,
      reportId: report.id,
      complianceStatus: finalComplianceStatus,
    };
  } catch (error) {
    if (error instanceof APIError) {
      logger.error(
        { status: error.status, body: error.error },
        "Letta API error generating forced ingestion report",
      );
    } else {
      logger.error(
        { error, ingestionRecordId },
        "Error generating forced ingestion report",
      );
    }

    const isLastAttempt =
      error instanceof FatalError ||
      getStepMetadata().attempt >= forceAuditReportStep.maxRetries + 1;
    if (!isLastAttempt) throw error;

    // FINAL SECURITY: Ensure ingestion_record is no longer 'pending' if we hit an error (RI-1093)
    try {
      await supabase
        .from("ingestion_records")
        .update({ compliance_status: "error" })
        .eq("id", ingestionRecordId);
    } catch (dbError) {
      logger.error(
        { dbError, ingestionRecordId },
        "Failed to force error status on catch",
      );
    }

    throw error;
  }
}

forceAuditReportStep.maxRetries = 3;
