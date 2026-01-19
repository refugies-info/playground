import {
  createLettaClient,
  EditorialMetadataSchema,
  type LettaReportType,
  parseAgentResponse,
  simplifyContent,
} from "@playground/agents";
import { logger } from "@playground/shared-types";
import { getSupabaseAdmin } from "@playground/supabase";
import type { NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Request body schema for the editorial stream endpoint.
 * Accepts either:
 * - markdownContent: Pre-built markdown with frontmatter (preferred)
 * - content + metadata + instructions: Legacy format, will be combined
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
      "Editorial Agent Stream configuration error",
    );
    return new Response("Server configuration error", { status: 500 });
  }

  const encoder = new TextEncoder();

  // Track the final assistant response for persistence
  let finalAssistantContent = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const client = createLettaClient();

        for await (const chunk of simplifyContent(client, content, agentId)) {
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
            await persistEditorialReport(
              flowId,
              agentId,
              finalAssistantContent,
            );
          } catch (persistError) {
            logger.error(
              { error: persistError },
              "Failed to persist editorial report",
            );
            // Don't fail the stream, but log the error
          }
        }

        // Send done signal
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        logger.error({ error }, "Error in editorial agent stream");
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
 * Persists the editorial agent response to letta_reports and links it to the editorial_record.
 */
async function persistEditorialReport(
  flowId: string,
  agentId: string,
  responseContent: string,
): Promise<void> {
  const reportType: LettaReportType = "editorial";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase credentials");
  }

  const supabase = getSupabaseAdmin(url, key);

  // 1. Get the editorial_record_id from the workflow
  const { data: workflow, error: workflowError } = await supabase
    .from("workflows")
    .select("editorial_record_id")
    .eq("id", flowId)
    .single();

  if (workflowError || !workflow?.editorial_record_id) {
    logger.warn(
      { flowId, error: workflowError },
      "Could not find editorial_record for flowId",
    );
    return;
  }

  // Parse and validate metadata from responseContent (frontmatter)
  const result = parseAgentResponse(
    responseContent,
    agentId,
    EditorialMetadataSchema,
  );

  // 2. Insert the letta_report
  const { data: report, error: reportError } = await supabase
    .from("letta_reports")
    .insert({
      agent_id: agentId,
      report_type: reportType,
      markdown: result.content,
      metadata: result.metadata as any,
      status: result.status,
      raw_response: result.rawResponse,
    })
    .select("id")
    .single();

  if (reportError) {
    throw new Error(`Failed to insert letta_report: ${reportError.message}`);
  }

  // 3. Link the report to the editorial_record
  const { error: updateError } = await supabase
    .from("editorial_records")
    .update({ content_report_id: report.id })
    .eq("id", workflow.editorial_record_id);

  if (updateError) {
    logger.error(
      { error: updateError },
      "Failed to link report to editorial_record",
    );
  } else {
    logger.info(
      {
        reportId: report.id,
        editorialRecordId: workflow.editorial_record_id,
        type: reportType,
      },
      "Editorial report persisted successfully",
    );
  }
}
