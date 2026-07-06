import matter from "gray-matter";
import type { ZodSchema, ZodVoid } from "zod";
import type { LettaMetadata, LettaReportResult, LettaUsage } from "./types";

/**
 * Checks if the content contains valid YAML frontmatter.
 */
function checkHasFrontmatter(content: string): boolean {
  // Use a more permissive regex that finds --- followed by a newline,
  // even if it's preceded by conversational text.
  return content.match(/---\r?\n/) !== null;
}

/**
 * Extracts valid markdown content by locating the start of the frontmatter.
 */
function extractValidContent(content: string): string {
  // Find the first occurrence of --- that looks like a frontmatter delimiter
  // (i.e. it finishes a line).
  const match = content.match(/---\r?\n/);
  if (match && match.index !== undefined) {
    return content.slice(match.index);
  }
  return content;
}

/**
 * Checks if the schema is the NoFrontmatterSchema (z.void()).
 */
function isNoFrontmatterSchema(schema?: ZodSchema): schema is ZodVoid {
  // biome-ignore lint/suspicious/noExplicitAny: Accessing internal Zod type name
  return (schema as any)?._def?.typeName === "ZodVoid";
}

/**
 * Generic parser for Letta agent responses with Zod validation for frontmatter metadata.
 *
 * If the schema is NoFrontmatterSchema (z.void()), frontmatter is not required
 * and raw content is returned as-is with "complete" status.
 *
 * @param agentResponse - The raw markdown response from the agent
 * @param agentId - The agent ID used for processing
 * @param schema - Zod schema to validate extracted frontmatter, or NoFrontmatterSchema if no frontmatter expected
 * @param usage - Optional usage statistics
 */
export function parseAgentResponse(
  agentResponse: string,
  agentId: string,
  schema?: ZodSchema,
  usage?: LettaUsage,
): LettaReportResult {
  const lettaMetadata: LettaMetadata = {
    agent_id: agentId,
    processed_at: new Date().toISOString(),
  };

  if (usage) {
    if (typeof usage.prompt_tokens === "number")
      lettaMetadata.prompt_tokens = usage.prompt_tokens;
    if (typeof usage.completion_tokens === "number")
      lettaMetadata.completion_tokens = usage.completion_tokens;
    if (typeof usage.total_tokens === "number")
      lettaMetadata.total_tokens = usage.total_tokens;
  }

  // Check if frontmatter is required based on schema type
  const requireFrontmatter = !isNoFrontmatterSchema(schema);

  // 1. Basic check for frontmatter
  const hasFrontmatter = checkHasFrontmatter(agentResponse);

  if (!hasFrontmatter) {
    if (requireFrontmatter) {
      return {
        status: "error",
        content: "",
        rawResponse: agentResponse,
        metadata: { letta: lettaMetadata },
      };
    }
    // No frontmatter but not required - return content as-is with complete status
    return {
      status: "complete",
      content: agentResponse,
      rawResponse: agentResponse,
      metadata: { letta: lettaMetadata },
    };
  }

  try {
    // 2. Extract and parse frontmatter
    const cleanContent = extractValidContent(agentResponse);
    const parsed = matter(cleanContent);

    // 3. Optional Zod validation (skip if NoFrontmatterSchema)
    if (schema && !isNoFrontmatterSchema(schema)) {
      const validation = schema.safeParse(parsed.data);
      if (!validation.success) {
        return {
          status: "error",
          content: "",
          rawResponse: agentResponse,
          metadata: {
            letta: lettaMetadata,
            validation_errors: validation.error.flatten(),
          },
        };
      }
    }

    // 4. Success: Merge Letta metadata and return
    const enhancedData = {
      ...parsed.data,
      letta: lettaMetadata,
    };

    return {
      status: "complete",
      content: matter.stringify(parsed.content, enhancedData),
      rawResponse: agentResponse,
      metadata: enhancedData,
    };
  } catch (error) {
    // Fallback if parsing itself crashes
    return {
      status: "error",
      content: "",
      rawResponse: agentResponse,
      metadata: {
        letta: lettaMetadata,
        parse_error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}
