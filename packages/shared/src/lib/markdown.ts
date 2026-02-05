import matter from "gray-matter";
import type { Heading, Root } from "mdast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
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
    logger.error(error, "Failed to parse markdown for title extraction");
  }

  return "Untitled";
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
      .use(remarkStringify);

    const tree = processor.parse(content) as Root;

    // Remove the first H1 heading
    const h1Index = tree.children.findIndex(
      (node) => node.type === "heading" && (node as Heading).depth === 1,
    );

    if (h1Index !== -1) {
      tree.children.splice(h1Index, 1);
    }

    // Stringify back to markdown
    const strippedContent = processor.stringify(tree);

    // If there was frontmatter, re-attach it (though usually it's stripped for delivery)
    // For our current use case (RCO payload), we usually don't want frontmatter in the body either
    // as it's passed separately in metadata.
    return strippedContent.trim();
  } catch (error) {
    logger.error(error, "Failed to strip H1 from markdown");
    // Fallback to regex if AST fails for some reason
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
 * Utility to ensure a markdown string has an H1 heading and optionally inject content after it.
 * Uses AST transformation for robustness.
 */
export async function ensureH1AndInjectAfter(
  content: string,
  options: { title?: string; injectContent?: string },
): Promise<string> {
  if (!content && !options.title && !options.injectContent) return "";

  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkStringify);

    const tree = processor.parse(content) as Root;

    // 1. Find H1 heading
    let h1Index = tree.children.findIndex(
      (node) => node.type === "heading" && (node as Heading).depth === 1,
    );

    // 2. Add H1 if missing and title provided
    if (h1Index === -1 && options.title) {
      const h1Node: Heading = {
        type: "heading",
        depth: 1,
        children: [{ type: "text", value: options.title }],
      };
      tree.children.unshift(h1Node);
      h1Index = 0;
    }

    // 3. Inject content after H1 (or at start if no H1 and no title to add)
    if (options.injectContent) {
      // Parse the content to inject to get nodes
      const injectTree = processor.parse(options.injectContent) as Root;
      const injectNodes = injectTree.children;

      if (h1Index !== -1) {
        tree.children.splice(h1Index + 1, 0, ...injectNodes);
      } else {
        tree.children.unshift(...injectNodes);
      }
    }

    return processor.stringify(tree).trim();
  } catch (error) {
    logger.error(error, "Failed to enrich markdown with AST");
    return content;
  }
}
