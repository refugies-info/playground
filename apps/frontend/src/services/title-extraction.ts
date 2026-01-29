import type { Lheo } from "@playground/rco";
import { logger } from "@playground/shared-types";
import matter from "gray-matter";
import type { Heading, Root } from "mdast";
import remarkParse from "remark-parse";
import { unified } from "unified";

/**
 * Metadata can be a partial LHEO structure or have direct title fields.
 * Uses the canonical Lheo type from @playground/rco package.
 */
export type Metadata = Partial<Lheo> & {
  title?: string;
  "intitule-formation"?: string;
  [key: string]: unknown;
};

/**
 * Extract title from markdown content.
 * Priority:
 * 1. Title from YAML frontmatter
 * 2. First H1 heading in markdown (parsed with remark)
 * 3. "Untitled" as fallback
 */
export async function extractTitleFromMarkdown(
  markdown: string,
): Promise<string> {
  if (!markdown) return "Untitled";

  try {
    // Parse YAML frontmatter
    const { data, content } = matter(markdown);

    // Check for title in frontmatter
    if (data.title && typeof data.title === "string") {
      return data.title.trim();
    }

    // Use remark to parse markdown and find first H1 heading
    const tree = unified().use(remarkParse).parse(content) as Root;

    // Find the first heading with depth 1 (H1)
    for (const node of tree.children) {
      if (node.type === "heading" && (node as Heading).depth === 1) {
        const heading = node as Heading;
        // Extract text from heading children
        const text = heading.children
          .filter((child) => child.type === "text")
          .map((child) => ("value" in child ? child.value : ""))
          .join("")
          .trim();

        if (text) {
          return text;
        }
      }
    }
  } catch (error) {
    // If parsing fails, continue to fallback
    logger.error(error, "Failed to parse markdown for title extraction");
  }

  return "Untitled";
}

/**
 * Safely extracts the title from LHEO metadata.
 * Handles the nested structure: lheo.offres.formation[0]["intitule-formation"]
 * Also checks for direct title or intitule-formation fields.
 */
export function extractTitleFromMetadata(metadata: Metadata): string | null {
  // Check for direct title field
  if (metadata.title && typeof metadata.title === "string") {
    return metadata.title;
  }

  // Check for direct intitule-formation field
  if (
    metadata["intitule-formation"] &&
    typeof metadata["intitule-formation"] === "string"
  ) {
    return metadata["intitule-formation"];
  }

  // Navigate through LHEO structure: metadata.offres.formation[0]["intitule-formation"]
  // metadata is already Partial<Lheo>, so we access offres directly
  if (!metadata.offres) {
    return null;
  }

  const formations = metadata.offres.formation;
  if (!formations || formations.length === 0) {
    return null;
  }

  // Get the first formation
  const firstFormation = formations[0];
  if (!firstFormation) {
    return null;
  }

  const intitule = firstFormation["intitule-formation"];
  if (!intitule) {
    return null;
  }

  // IntituleFormation type from LHEO has a _text property
  if (typeof intitule === "object" && "_text" in intitule) {
    const text = intitule._text;
    return typeof text === "string" ? text : null;
  }

  // Fallback for direct string (shouldn't happen with canonical types, but be safe)
  if (typeof intitule === "string") {
    return intitule;
  }

  return null;
}
