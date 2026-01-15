import {
  buildMarkdownWithFrontmatter,
  createLettaClient,
  simplifyContent,
} from "@playground/agents";
import { logger } from "@playground/shared-types";
import type { NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Request body schema for the editorial stream endpoint.
 * Accepts either:
 * - markdownContent: Pre-built markdown with frontmatter (preferred)
 * - content + metadata + instructions: Legacy format, will be combined
 */
const requestBodySchema = z
  .object({
    markdownContent: z.string().optional(),
    content: z.string().optional(),
    instructions: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .refine((data) => data.markdownContent || data.content, {
    message: "Either markdownContent or content is required",
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

  const { markdownContent, content, instructions, metadata } = parseResult.data;

  const agentId = process.env.PLAYGROUND_AGENT_ID;

  if (!agentId) {
    logger.error(
      { error: "Missing PLAYGROUND_AGENT_ID" },
      "Editorial Agent Stream configuration error",
    );
    return new Response("Server configuration error", { status: 500 });
  }

  // Build markdown with frontmatter if not provided directly
  let inputMarkdown: string;

  if (markdownContent) {
    // New unified format: markdown with frontmatter already provided
    inputMarkdown = markdownContent;
  } else {
    // Legacy format: combine content + metadata + instructions into markdown
    // content is guaranteed to exist due to the refine above
    inputMarkdown = buildMarkdownWithFrontmatter(
      content as string,
      metadata,
      instructions,
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const client = createLettaClient();

        for await (const chunk of simplifyContent(
          client,
          inputMarkdown,
          agentId,
        )) {
          const data = `data: ${JSON.stringify(chunk)}\n\n`;
          controller.enqueue(encoder.encode(data));
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
