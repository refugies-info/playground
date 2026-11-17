import { APIError } from "@letta-ai/letta-client/core/error";
import {
  accumulateUsage,
  createLettaClient,
  estimateCarbonImpact,
  generateMetadataReport,
  type LettaUsage,
  MetadataMetadataSchema,
  parseAgentResponse,
} from "@playground/agents";
import { LETTA_MODEL_HANDLE, logger } from "@playground/shared-types";
import type { Json } from "@playground/supabase";
import { getStepMetadata } from "@workflow/core";
import { FatalError, RetryableError } from "@workflow/errors";
import { getSupabaseClient } from "../common/supabase";
import { getEditorialSource } from "../sources";

/**
 * Forced metadata of a DI record by the multi-task agent (/metadata command).
 */
async function generateForcedDiMetadata(
  markdown: string,
  workflowId: string,
  agentId: string,
  model = LETTA_MODEL_HANDLE,
) {
  const lettaClient = createLettaClient();
  const { id: conversationId } = await lettaClient.conversations.create({
    agent_id: agentId,
    summary: `metadata-${workflowId}`,
  });

  let finalContent = "";
  const usage: LettaUsage = {};
  for await (const chunk of generateMetadataReport(
    lettaClient,
    markdown,
    conversationId,
    model,
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
    throw new Error("No assistant response received for metadata report");
  }

  const parsed = parseAgentResponse(
    finalContent,
    agentId,
    MetadataMetadataSchema,
    usage,
  );
  return {
    agentId,
    markdown: parsed.content,
    metadata: parsed.metadata,
    status: parsed.status,
    rawResponse: parsed.rawResponse,
    usage,
    model,
  };
}

/**
 * Workflow step that forces generation of a metadata report for a specific workflow,
 * bypassing normal batch collection. Used primarily for manual arbitration/retry.
 *
 * @param workflowId - The ID of the workflow to force metadata for.
 */
export async function forceMetadataReportStep(
  workflowId: string,
  model?: string,
) {
  "use step";

  const supabase = getSupabaseClient();
  const { attempt } = getStepMetadata();

  // 0. Resolve agent ID early — needed for the "generating" sentinel insert.
  const agentId =
    process.env.METADATA_AGENT_ID || process.env.PLAYGROUND_AGENT_ID;

  if (!agentId) {
    throw new FatalError(
      "METADATA_AGENT_ID or PLAYGROUND_AGENT_ID is not defined",
    );
  }

  // 0.1 Guard: block concurrent generation for this workflow.
  // If a "generating" report already exists, another request is in flight —
  // abort immediately to avoid a 409 conflict from the Letta API.
  // A retry finds its own sentinel, kept "generating" by the failed attempt.
  const { data: existingGenerating } = await supabase
    .from("letta_reports")
    .select("id")
    .eq("workflow_id", workflowId)
    .eq("report_type", "metadata")
    .eq("status", "generating")
    .maybeSingle();

  if (existingGenerating && attempt === 1) {
    throw new FatalError(
      `Metadata generation already in progress for workflow ${workflowId}`,
    );
  }

  // 0.2 Insert a "generating" sentinel report to track in-progress state.
  // This allows the UI to restore the loading state after a page refresh,
  // and prevents concurrent calls from racing into the Letta API.
  // The report will be updated (not replaced) once generation completes.
  // The model is the agent's actual handle (cached per process) — TEC-65.
  const { data: generatingReport, error: generatingInsertError } =
    existingGenerating
      ? { data: existingGenerating, error: null }
      : await supabase
          .from("letta_reports")
          .insert({
            agent_id: agentId,
            report_type: "metadata",
            status: "generating",
            markdown: "",
            metadata: {} as Json,
            workflow_id: workflowId,
            model: model ?? LETTA_MODEL_HANDLE,
          })
          .select("id")
          .single();

  if (generatingInsertError || !generatingReport) {
    throw new Error(
      `Failed to insert generating report: ${generatingInsertError?.message ?? "unknown error"}`,
    );
  }

  const generatingReportId = generatingReport.id;

  // Everything below is wrapped in a single try/catch so that any failure
  // (fetching data, calling Letta, parsing response) always updates the
  // sentinel to "error" — preventing a stuck "generating" report.
  let ingestionRecordId: string | undefined;

  try {
    // 1. Fetch workflow to get ingestion_record_id and editorial_record_id
    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .select("ingestion_record_id, editorial_record_id")
      .eq("id", workflowId)
      .single();

    if (workflowError || !workflow?.ingestion_record_id) {
      logger.error(
        { workflowId, error: workflowError },
        "Workflow or Ingestion Record not found for forced metadata",
      );
      throw new Error("Workflow or Ingestion Record not found");
    }

    ingestionRecordId = workflow.ingestion_record_id;
    const editorialRecordId = workflow.editorial_record_id ?? null;

    // 2. Fetch Ingestion Record
    const { data: record, error: recordError } = await supabase
      .from("ingestion_records")
      .select("id, markdown, service:services(origin, data)")
      .eq("id", ingestionRecordId)
      .single<{
        id: string;
        markdown: string;
        service: { origin: string | null; data: Json } | null;
      }>();

    if (recordError || !record) {
      throw new Error(`Ingestion Record not found: ${recordError?.message}`);
    }

    logger.info(
      { workflowId, ingestionRecordId, origin: record.service?.origin },
      "Starting forced metadata generation",
    );

    const source = getEditorialSource(record.service?.origin);
    const parsed = source
      ? await source.generateMetadata({
          serviceData: record.service?.data,
          model,
        })
      : await generateForcedDiMetadata(
          record.markdown,
          workflowId,
          agentId,
          model,
        );

    // UPDATE the "generating" report with the final result.
    // Triggers a Realtime UPDATE event on the UI to unblock the spinner.
    const { data: report, error: reportError } = await supabase
      .from("letta_reports")
      .update({
        agent_id: parsed.agentId,
        markdown: parsed.markdown,
        metadata: parsed.metadata as Json,
        status: parsed.status,
        raw_response: parsed.rawResponse ?? null,
        token_cost: parsed.usage?.totalTokens || null,
        carbon_impact: await estimateCarbonImpact(parsed.model, parsed.usage),
        model: parsed.model,
      })
      .eq("id", generatingReportId)
      .select("id")
      .single();

    if (reportError || !report) {
      throw new Error(
        `Failed to update letta_report: ${reportError?.message ?? "unknown error"}`,
      );
    }

    // Only a successful report becomes the record's active metadata. Linking an
    // `error` report would set metadata_report_id to a report the UI filters out
    // (it requires status 'complete'), and would silently shadow a previously
    // linked complete report — leaving the fiche with "Aucun rapport".
    if (parsed.status !== "complete") {
      logger.warn(
        { workflowId, reportId: report.id, reportStatus: parsed.status },
        "Metadata report not complete — leaving previous link and overrides untouched",
      );
      return { success: false, reportId: report.id, status: parsed.status };
    }

    const { error: linkIngestionError } = await supabase
      .from("ingestion_records")
      .update({ metadata_report_id: report.id })
      .eq("id", ingestionRecordId);

    if (linkIngestionError) {
      throw new Error(
        `Failed to set metadata_report_id on record: ${linkIngestionError.message}`,
      );
    }

    // 4. Clear editorial metadata overrides so the fresh AI report is used
    // as the new baseline — stale manual overrides from the previous version
    // would otherwise silently shadow the regenerated values. Only done for a
    // complete report (guarded above) so a failed run never wipes overrides.
    // Best-effort: don't throw if this fails, the report was already persisted.
    if (editorialRecordId) {
      logger.info(
        { editorialRecordId },
        "Clearing editorial metadata overrides after regeneration",
      );
      const { error: clearError } = await supabase
        .from("editorial_records")
        .update({ metadata: {} as Json })
        .eq("id", editorialRecordId);

      if (clearError) {
        logger.error(
          { editorialRecordId, error: clearError },
          "Failed to clear editorial metadata overrides after regeneration",
        );
      } else {
        logger.info(
          { editorialRecordId },
          "Cleared editorial metadata overrides after regeneration",
        );
      }
    }

    logger.info(
      { workflowId, reportId: report.id },
      "Forced metadata generation completed successfully",
    );

    return { success: true, reportId: report.id };
  } catch (error) {
    if (error instanceof APIError) {
      logger.error(
        { status: error.status, body: error.error },
        "Letta API error generating forced metadata report",
      );
    } else {
      logger.error(
        { error, ingestionRecordId },
        "Error generating forced metadata report",
      );
    }

    // Between attempts the sentinel stays "generating" (the UI keeps waiting
    // and shows why it retries); only the last attempt marks it "error".
    const isLastAttempt =
      error instanceof FatalError ||
      attempt >= forceMetadataReportStep.maxRetries + 1;
    const message = error instanceof Error ? error.message : String(error);
    try {
      await supabase
        .from("letta_reports")
        .update(
          isLastAttempt
            ? { status: "error", raw_response: message }
            : { raw_response: `Tentative ${attempt} échouée : ${message}` },
        )
        .eq("id", generatingReportId);
    } catch (dbError) {
      logger.error(
        { dbError, workflowId },
        "Failed to update error status for forced metadata report",
      );
    }

    // Albert's rate limit surfaces as a stream error: an immediate retry hits it again.
    if (error instanceof Error && error.message.includes("(429)")) {
      throw new RetryableError("Albert rate limited on metadata", {
        retryAfter: "1m",
      });
    }
    throw error;
  }
}

forceMetadataReportStep.maxRetries = 3;
