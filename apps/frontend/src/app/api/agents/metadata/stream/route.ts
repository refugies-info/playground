import { createLettaClient, generateMetadataReport } from "@playground/agents";
import { logger } from "@playground/shared-types";
import { getSupabaseAdmin } from "@playground/supabase";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (_) {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { content } = body as {
    content: string;
  };
  const agentId = process.env.PLAYGROUND_AGENT_ID;

  if (!agentId) {
    logger.error(
      { error: "Missing PLAYGROUND_AGENT_ID" },
      "Metadata Agent Stream configuration error",
    );
    return new Response("Server configuration error", { status: 500 });
  }

  if (!content) {
    return new Response("Content is required", { status: 400 });
  }

  const encoder = new TextEncoder();

  // Track state for persistence
  let conversationId: string | undefined;
  let finalAssistantContent = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const client = createLettaClient(); // Initialize client inside the stream start to ensure fresh instance if needed

        for await (const chunk of generateMetadataReport(
          client,
          content,
          agentId,
        )) {
          // Capture conversation ID from meta event
          if (
            chunk.message_type === "conversation_meta" &&
            chunk.conversation_id
          ) {
            conversationId = chunk.conversation_id;
          }

          // Capture assistant content
          if (
            chunk.message_type === "assistant_message" &&
            typeof chunk.content === "string"
          ) {
            finalAssistantContent += chunk.content;
          }

          const data = `data: ${JSON.stringify(chunk)}\n\n`;
          controller.enqueue(encoder.encode(data));
        }

        // Persist report if we have content and conversation ID
        if (finalAssistantContent && conversationId) {
          try {
            const supabase = getSupabaseAdmin();
            await supabase.from("letta_reports").insert({
              agent_id: agentId,
              report_type: "metadata",
              markdown: finalAssistantContent,
              metadata: {
                letta: {
                  agent_id: agentId,
                  processed_at: new Date().toISOString(),
                },
              },
              status: "complete",
              conversation_id: conversationId,
            });
            logger.info(
              { conversationId },
              "Persisted metadata report successfully",
            );
          } catch (persistError) {
            logger.error(
              { error: persistError },
              "Failed to persist metadata report",
            );
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
