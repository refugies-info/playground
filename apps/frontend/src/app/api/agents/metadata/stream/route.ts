import {
  createLettaClient,
  generateMetadataReport,
  type LettaReportType,
  MetadataMetadataSchema,
  parseAgentResponse,
} from "@playground/agents";
import { logger } from "@playground/shared-types";
import { getSupabaseAdmin } from "@playground/supabase";
import matter from "gray-matter";
import type { NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Request body schema for the metadata stream endpoint.
 * Expects markdown with frontmatter containing metadata from previous phases.
 *
 * flowId is required to link the generated report to the editorial record.
 */
const requestBodySchema = z.object({
  flowId: z.string().min(1, "flowId is required"),
  content: z.string().min(1, "Markdown content cannot be empty"),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (_) {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Validate request body with zod
  const parseResult = requestBodySchema.safeParse(body);
  if (!parseResult.success) {
    return new Response(
      JSON.stringify({
        error: "Validation error",
        details: parseResult.error.flatten(),
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const { flowId, content } = parseResult.data;

  const agentId = process.env.PLAYGROUND_AGENT_ID;

  if (!agentId) {
    logger.error(
      { error: "Missing PLAYGROUND_AGENT_ID" },
      "Metadata Agent Stream configuration error",
    );
    return new Response("Server configuration error", { status: 500 });
  }

  // Retrieve conversation_id from workflow
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    logger.error("Missing Supabase credentials");
    return new Response("Server configuration error", { status: 500 });
  }

  const supabase = getSupabaseAdmin(url, key);
  const { data: workflow, error: workflowError } = await supabase
    .from("workflows")
    .select("conversation_id, editorial_record_id, ingestion_record_id")
    .eq("id", flowId)
    .single();

  if (workflowError || !workflow?.conversation_id) {
    logger.error(
      { error: workflowError, flowId },
      "Workflow not found or missing conversation_id",
    );
    return new Response(
      JSON.stringify({ error: "Workflow or conversation not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  // Fetch metadata from editorial_record or ingestion_record and hydrate content
  // Priority: editorial_record > ingestion_record
  let fullContent = content;
  let metadata: Record<string, unknown> | null = null;

  if (workflow.editorial_record_id) {
    const { data: record, error: recordError } = await supabase
      .from("editorial_records")
      .select("metadata")
      .eq("id", workflow.editorial_record_id)
      .single();

    if (
      !recordError &&
      record?.metadata &&
      typeof record.metadata === "object"
    ) {
      metadata = record.metadata as Record<string, unknown>;
    } else {
      logger.warn(
        { error: recordError, editorialRecordId: workflow.editorial_record_id },
        "Could not fetch metadata from editorial_record",
      );
    }
  }

  // Fallback to ingestion_record if no metadata found yet
  if (!metadata && workflow.ingestion_record_id) {
    const { data: record, error: recordError } = await supabase
      .from("ingestion_records")
      .select("metadata")
      .eq("id", workflow.ingestion_record_id)
      .single();

    if (
      !recordError &&
      record?.metadata &&
      typeof record.metadata === "object"
    ) {
      metadata = record.metadata as Record<string, unknown>;
    } else {
      logger.warn(
        { error: recordError, ingestionRecordId: workflow.ingestion_record_id },
        "Could not fetch metadata from ingestion_record",
      );
    }
  }

  if (metadata) {
    fullContent = matter.stringify(content, metadata);
  }

  const conversationId = workflow.conversation_id;
  const encoder = new TextEncoder();

  // Track the final assistant response for persistence
  let finalAssistantContent = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const client = createLettaClient();

        for await (const chunk of generateMetadataReport(
          client,
          fullContent,
          conversationId,
        )) {
          // Capture assistant message content for persistence
          if (chunk.message_type === "assistant_message") {
            if (typeof chunk.content === "string") {
              finalAssistantContent = chunk.content;
            }
          }

          const data = `data: ${JSON.stringify(chunk)}\n\n`;
          controller.enqueue(encoder.encode(data));
        }

        // Persist the letta_report after successful streaming
        if (finalAssistantContent) {
          try {
            await persistMetadataReport(flowId, agentId, finalAssistantContent);
          } catch (persistError) {
            logger.error(
              { error: persistError },
              "Failed to persist metadata report",
            );
            // Don't fail the stream, but log the error
          }
        }

        // Send done signal
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        logger.error({ error }, "Error in metadata agent stream");
        const errorData = `data: ${JSON.stringify({
          type: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        })}\n\n`;
        controller.enqueue(encoder.encode(errorData));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

/**
 * Persists the metadata agent response to letta_reports and links it to the editorial_record.
 * The report is always stored for debugging purposes, even if linking fails.
 */
async function persistMetadataReport(
  flowId: string,
  agentId: string,
  responseContent: string,
): Promise<void> {
  const reportType: LettaReportType = "metadata";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase credentials");
  }

  const supabase = getSupabaseAdmin(url, key);

  // Parse and validate metadata from responseContent (frontmatter)
  const result = parseAgentResponse(
    responseContent,
    agentId,
    MetadataMetadataSchema,
  );

  // 1. Insert the letta_report first (always, for debugging)
  // The workflow_id enables the database trigger to auto-link to editorial_record
  const { data: report, error: reportError } = await supabase
    .from("letta_reports")
    .insert({
      agent_id: agentId,
      report_type: reportType,
      markdown: result.content,
      metadata: result.metadata as any,
      status: result.status,
      raw_response: result.rawResponse,
      workflow_id: flowId,
    })
    .select("id")
    .single();

  if (reportError) {
    throw new Error(`Failed to insert letta_report: ${reportError.message}`);
  }

  logger.info(
    { reportId: report.id, flowId, type: reportType },
    "Metadata report stored successfully",
  );

  // 2. Try to get the editorial_record_id from the workflow
  const { data: workflow, error: workflowError } = await supabase
    .from("workflows")
    .select("editorial_record_id")
    .eq("id", flowId)
    .single();

  if (workflowError || !workflow?.editorial_record_id) {
    logger.warn(
      { flowId, reportId: report.id, error: workflowError },
      "Could not find editorial_record for flowId - report stored but not linked",
    );
    return;
  }

  // 3. Link the report to the editorial_record
  const { error: updateError } = await supabase
    .from("editorial_records")
    .update({ metadata_report_id: report.id })
    .eq("id", workflow.editorial_record_id);

  if (updateError) {
    logger.error(
      { error: updateError, reportId: report.id },
      "Failed to link report to editorial_record",
    );
  } else {
    logger.info(
      {
        reportId: report.id,
        editorialRecordId: workflow.editorial_record_id,
        type: reportType,
      },
      "Metadata report linked to editorial_record",
    );
  }
}
