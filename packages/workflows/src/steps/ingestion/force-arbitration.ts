import { APIError } from "@letta-ai/letta-client/error";
import {
  createLettaClient,
  generateIngestionReport,
  parseIngestionResponse,
} from "@playground/agents";
import { logger } from "@playground/shared-types";
import { getSupabaseAdmin, type Json } from "@playground/supabase";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
  }

  return getSupabaseAdmin(url, key);
}

export async function forceArbitrationStep(workflowId: string) {
  "use step";

  const supabase = getSupabaseClient();

  // 1. Fetch workflow to get ingestion_record_id
  const { data: workflow, error: workflowError } = await supabase
    .from("workflows")
    .select("ingestion_record_id")
    .eq("id", workflowId)
    .single();

  if (workflowError || !workflow?.ingestion_record_id) {
    logger.error(
      { workflowId, error: workflowError },
      "Workflow or Ingestion Record not found for arbitration",
    );
    throw new Error("Workflow or Ingestion Record not found");
  }

  const ingestionRecordId = workflow.ingestion_record_id;

  // 2. Fetch Ingestion Record
  const { data: record, error: recordError } = await supabase
    .from("ingestion_records")
    .select("id, markdown")
    .eq("id", ingestionRecordId)
    .single();

  if (recordError || !record) {
    throw new Error(`Ingestion Record not found: ${recordError?.message}`);
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

  logger.info({ workflowId, ingestionRecordId }, "Starting forced arbitration");

  let finalContent = "";

  try {
    for await (const chunk of generateIngestionReport(
      lettaClient,
      record.markdown,
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

    // Insert Report
    const { data: report, error: reportError } = await supabase
      .from("letta_reports")
      .insert({
        agent_id: agentId,
        report_type: "ingestion",
        markdown: parsed.content,
        metadata: parsed.metadata as Json,
        status: parsed.status,
        raw_response: parsed.rawResponse ?? null,
        workflow_id: workflowId,
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

    logger.info(
      { workflowId, reportId: report.id },
      "Forced arbitration completed successfully",
    );

    return { success: true, reportId: report.id };
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
    throw error;
  }
}

export async function forceArbitrationWorkflow(workflowId: string) {
  "use workflow";
  return await forceArbitrationStep(workflowId);
}
