import { createLettaClient, simplifyContent } from "@playground/agents";
import { logger } from "@playground/shared-types";
import { getSupabaseAdmin } from "@playground/supabase";
import { persistEditorialWorkflow } from "@playground/workflows";
import matter from "gray-matter";
import type { NextRequest } from "next/server";
import { start } from "workflow/api";
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

  if (workflowError || !workflow) {
    logger.error({ error: workflowError, flowId }, "Workflow not found");
    return new Response(JSON.stringify({ error: "Workflow not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Create Letta conversation if missing (for DI workflows created by trigger)
  let conversationId = workflow.conversation_id;
  if (!conversationId) {
    logger.info({ flowId }, "Creating conversation for workflow");
    const lettaClient = createLettaClient();
    const conversation = await lettaClient.conversations.create({
      agent_id: agentId,
    });
    conversationId = conversation.id;

    // Link conversation to workflow
    const { error: convLinkError } = await supabase
      .from("workflows")
      .update({ conversation_id: conversationId })
      .eq("id", flowId);

    if (convLinkError) {
      logger.error(
        { error: convLinkError, flowId, conversationId },
        "Failed to link conversation to workflow",
      );
      return new Response(
        JSON.stringify({ error: "Failed to create conversation" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    logger.info(
      { flowId, conversationId },
      "Created and linked conversation to workflow",
    );
  }

  // Fetch metadata from editorial_record or ingestion_record to preserve context
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

  const encoder = new TextEncoder();

  // Track the final assistant response for persistence
  let finalAssistantContent = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const client = createLettaClient();

        for await (const chunk of simplifyContent(
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

        /**
         * Persist using Vercel Workflow
         */
        if (finalAssistantContent) {
          try {
            await start(persistEditorialWorkflow, [
              flowId,
              agentId,
              finalAssistantContent,
            ]);
            logger.info({ flowId }, "Triggered persistEditorialWorkflow");
          } catch (persistError) {
            logger.error(
              { error: persistError },
              "Failed to trigger persistEditorialWorkflow",
            );
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
