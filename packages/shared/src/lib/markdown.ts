import matter from "gray-matter";
import type { Heading, Root } from "mdast";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { logger } from "../logger";

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
    const { content } = matter(markdown);

    // Use remark to parse markdown and find first H1 heading
    const tree = unified().use(remarkParse).parse(content) as Root;

    // Find the first heading with depth 1 (H1)
    for (const node of tree.children) {
      if (node.type === "heading" && (node as Heading).depth === 1) {
        const heading = node as Heading;
        // Extract text from heading children recursively (handles **bold**, _em_, etc.)
        const extractText = (
          nodes: { type: string; value?: string; children?: unknown[] }[],
        ): string =>
          nodes
            .map((n) =>
              "value" in n && n.value
                ? n.value
                : n.children
                  ? extractText(
                      n.children as {
                        type: string;
                        value?: string;
                        children?: unknown[];
                      }[],
                    )
                  : "",
            )
            .join("");
        const text = extractText(
          heading.children as {
            type: string;
            value?: string;
            children?: unknown[];
          }[],
        ).trim();
        if (text) {
          return text;
        }
      }
    }
  } catch (error) {
    logger.error(error, "Failed to parse markdown for title extraction");
  }

  return "";
}

/**
 * Utility to strip the first H1 heading from a markdown string using AST.
 * This is used for preview/publication payload construction where the title
 * is passed in metadata, not in the markdown body.
 */
export async function stripFirstH1(markdown: string): Promise<string> {
  if (!markdown) return "";

  try {
    const { content } = matter(markdown);

    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkDirective);

    const tree = processor.parse(content) as Root;

    // Remove the first H1 heading
    const h1Index = tree.children.findIndex(
      (node) => node.type === "heading" && (node as Heading).depth === 1,
    );

    if (h1Index !== -1) {
      const h1Node = tree.children[h1Index];
      // Get position of H1
      if (h1Node.position) {
        const startLine = h1Node.position.start.line - 1; // 0-indexed
        const endLine = h1Node.position.end.line - 1; // 0-indexed

        const lines = content.split("\n");
        // Remove lines occupied by H1
        lines.splice(startLine, endLine - startLine + 1);
        return lines.join("\n").trim();
      }
    }

    return markdown.trim();
  } catch (error) {
    logger.error(error, "Failed to strip H1 from markdown");
    // Fallback solely to regex if AST fails
    return markdown.replace(/^#\s+.+$\n?/m, "").trim();
  }
}

/**
 * Utility to check if a markdown string contains at least one H1 heading using AST.
 */
export async function hasH1(markdown: string): Promise<boolean> {
  if (!markdown) return false;

  try {
    const { content } = matter(markdown);
    const tree = unified().use(remarkParse).parse(content) as Root;

    return tree.children.some(
      (node) => node.type === "heading" && (node as Heading).depth === 1,
    );
  } catch (error) {
    logger.error(error, "Failed to parse markdown to check for H1");
    // Fallback to regex if AST fails
    return /^#\s+.+$/m.test(markdown);
  }
}

/**
 * Utility to extract markdown content without YAML frontmatter.
 * This is useful for displaying raw ingestion records where the content
 * is in the frontmatter fields (description, conditions_acces, etc.)
 * but we want to show only the markdown body.
 */
export function stripFrontmatter(markdown: string): string {
  if (!markdown) return "";

  try {
    const { content } = matter(markdown);
    return content.trim();
  } catch (error) {
    logger.error(error, "Failed to strip frontmatter from markdown");
    // If parsing fails, return the original markdown
    return markdown;
  }
}

/**
 * Utility to inject content from frontmatter fields into the markdown body.
 * This is specifically for DI records where description and conditions_acces
 * are stored in the frontmatter but need to be displayed in the editor.
 *
 * @param markdown - The full markdown with frontmatter
 * @returns Markdown with content injected into the body
 */
export function injectFrontmatterContent(markdown: string): string {
  if (!markdown) return "";

  try {
    const { data, content } = matter(markdown);

    // Build the body from frontmatter fields
    // We prioritize frontmatter content over existing body for DI records
    // because the body often only contains the title while rich content is in frontmatter
    let body = "";

    // Add title (H1) from 'nom' field
    if (data.nom && typeof data.nom === "string") {
      body += `# ${data.nom}\n\n`;
    }

    // Add description
    if (data.description && typeof data.description === "string") {
      body += `${data.description.trim()}\n\n`;
    }

    // Add conditions_acces as a section
    if (data.conditions_acces && typeof data.conditions_acces === "string") {
      body += `## Conditions d'accès\n\n${data.conditions_acces.trim()}\n\n`;
    }

    // If we didn't extract anything from frontmatter, fall back to existing body
    if (!body && content && content.trim()) {
      return content.trim();
    }

    return body.trim();
  } catch (error) {
    logger.error(error, "Failed to inject frontmatter content");
    // If parsing fails, return the original markdown
    return markdown;
  }
}
