import { createLettaClient, simplifyContent } from "@playground/agents";
import { logger } from "@playground/shared-types";
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

  const { content, instructions, metadata } = body as {
    content: string;
    instructions: string;
    metadata?: Record<string, unknown>;
  };
  const agentId = process.env.PLAYGROUND_AGENT_ID;

  if (!agentId) {
    logger.error(
      { error: "Missing PLAYGROUND_AGENT_ID" },
      "Editorial Agent Stream configuration error",
    );
    return new Response("Server configuration error", { status: 500 });
  }

  if (!content) {
    return new Response("Content is required", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const client = createLettaClient();

        for await (const chunk of simplifyContent(
          client,
          content,
          instructions,
          agentId,
          metadata, // Pass metadata to the AI agent
        )) {
          const data = `data: ${JSON.stringify(chunk)}\n\n`;
          controller.enqueue(encoder.encode(data));
        }

        // Send done signal
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
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
