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
 * Repairs frontmatter whose closing `---` delimiter is missing.
 *
 * The metadata agent (Agathe) reliably emits a YAML frontmatter block followed
 * by a markdown body (`## Métadonnées mappées`, tables, …) but intermittently
 * forgets the closing `---` line. Without it, gray-matter/js-yaml tries to parse
 * the markdown tables as YAML and throws, turning an otherwise valid report into
 * an `error`. Since the output is LLM-generated, prompting alone is unreliable;
 * we recover deterministically here.
 *
 * `content` must already start with an opening `---` delimiter line. If a proper
 * closing delimiter already precedes the markdown body, the content is returned
 * unchanged. Otherwise a `---` line is inserted right before the first markdown
 * section (heading or table row) that follows the YAML.
 */
function ensureClosingFrontmatter(content: string): string {
  const open = content.match(/^---\r?\n/);
  if (!open) return content;

  const rest = content.slice(open[0].length);

  // A proper closing delimiter is a `---` alone on its own line.
  const closeMatch = rest.match(/\r?\n---[ \t]*(?:\r?\n|$)/);
  // The markdown body starts at the first heading (`#`..`######`) or table row.
  const bodyMatch = rest.match(/\r?\n(?:#{1,6}[ \t]|\| )/);

  const closeIdx = closeMatch?.index ?? Number.POSITIVE_INFINITY;
  const bodyIdx = bodyMatch?.index ?? Number.POSITIVE_INFINITY;

  // Already closed before any markdown body — nothing to repair.
  if (closeIdx <= bodyIdx) return content;

  // Closing delimiter missing (or misplaced after the body): inject one just
  // before the markdown body so the YAML frontmatter block is well-formed.
  if (bodyMatch?.index !== undefined) {
    const yaml = rest.slice(0, bodyMatch.index);
    const body = rest.slice(bodyMatch.index); // starts with a newline
    return `${open[0]}${yaml}\n---${body}`;
  }

  return content;
}

/**
 * Extracts valid markdown content by locating the start of the frontmatter.
 */
function extractValidContent(content: string): string {
  // Find the first occurrence of --- that looks like a frontmatter delimiter
  // (i.e. it finishes a line).
  const match = content.match(/---\r?\n/);
  if (match && match.index !== undefined) {
    return ensureClosingFrontmatter(content.slice(match.index));
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
    agentId: agentId,
    processedAt: new Date().toISOString(),
  };

  if (usage) {
    if (typeof usage.promptTokens === "number")
      lettaMetadata.promptTokens = usage.promptTokens;
    if (typeof usage.completionTokens === "number")
      lettaMetadata.completionTokens = usage.completionTokens;
    if (typeof usage.totalTokens === "number")
      lettaMetadata.totalTokens = usage.totalTokens;
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
