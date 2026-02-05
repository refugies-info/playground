/**
 *    ┌─────────────────────────────────────────────────────────────────────────┐
 *    │                           Pipeline Overview                             │
 *    └─────────────────────────────────────────────────────────────────────────┘
 *
 *    [Markdown String]        <-- Input (Raw MD + Directive + Front Matter)
 *          │
 *          ▼
 *    [Markdown Parser]        <-- THIS FILE (Import Pipeline)
 *          │
 *          ├─ Step 1: Front Matter Stripping (gray-matter)
 *          │
 *          ├─ Step 2: Fence Normalization (normalizeMarkdown)
 *          │    └─ Ensures unambiguous nesting lengths
 *          │
 *          ├─ Step 3: Unified Parsing (Remark + Directives)
 *          │
 *          ├─ Step 4: Node Conversion (astToBlocks)
 *          │    ├─ nodeToBlock (Dispatcher)
 *          │    └─ parseDirective (Custom Blocks)
 *          │
 *          ├─ Step 5: Inline Serialization (serializeInline)
 *          │    └─ Text, Links, Bold, Italic...
 *          │
 *          └─ Step 6: Validation & Cleanup (validateAndFixBlocks)
 *               └─ Stray fences removal & structure checks
 *          │
 *          ▼
 *    [BlockNote PartialBlocks] <-- Output (Ready for Editor)
 *          │
 *          ▼
 *    [BlockNote Editor]
 */

import type {
  InlineContent as BNInlineContentGeneric,
  PartialBlock,
} from "@blocknote/core";
import matter from "gray-matter";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { normalizeMarkdown } from "./normalizeMarkdown";

// biome-ignore lint/suspicious/noExplicitAny: Generic type alias requires any
type InlineContent = BNInlineContentGeneric<any, any>;

interface MarkdownNode {
  type: string;
  children?: MarkdownNode[];
  value?: string;
  depth?: number;
  checked?: boolean | null;
  ordered?: boolean;
  attributes?: Record<string, string>;
  name?: string;
  lang?: string;
  url?: string;
  title?: string;
  alt?: string;
  [key: string]: unknown;
}

/**
 * Main entry point of the "Import Pipeline".
 * Converts a raw Markdown string (potentially containing Directives like :::toggle)
 * into an array of BlockNote blocks ready for the editor.
 *
 * @param {string} markdown - The raw markdown string to parse
 * @returns {Promise<PartialBlock[]>} A promise that resolves to an array of PartialBlock objects
 */
export async function markdownToBlocks(
  markdown: string,
): Promise<PartialBlock[]> {
  // Step 1: Strip YAML frontmatter
  const { data: frontmatterData, content: contentWithoutFrontmatter } =
    matter(markdown);

  // Step 1.5: Inject frontmatter content into body for DI records
  // DI records store the main content in frontmatter.description, not in the body
  // TODO: find a cleaner way to handle this
  let enrichedContent = contentWithoutFrontmatter;

  if (
    frontmatterData.description &&
    typeof frontmatterData.description === "string"
  ) {
    // Insert description after the title (first heading)
    const lines = enrichedContent.split("\n");
    const firstHeadingIndex = lines.findIndex((line) => line.startsWith("#"));

    if (firstHeadingIndex !== -1) {
      // Insert after the heading
      lines.splice(
        firstHeadingIndex + 1,
        0,
        "",
        frontmatterData.description,
        "",
      );
      enrichedContent = lines.join("\n");
    }
  }

  // Step 2: Normalize markdown nesting (explicit fence lengths)
  const normalizedContent = normalizeMarkdown(enrichedContent);

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective);

  const ast = processor.parse(normalizedContent);

  // Apply hierarchy restoration (Remark plugins usually run in the 'run' phase)
  const transformedAst = await processor.run(ast);
  const blocks = astToBlocks(
    // biome-ignore lint/suspicious/noExplicitAny: AST transformation type casting
    (transformedAst as any).children as unknown as MarkdownNode[],
  );

  return validateAndFixBlocks(blocks);
}

/**
 * Checks if a line is a "stray fence" (only colons and whitespace).
 *
 * @param {string} line - The line to check
 * @returns {boolean} True if the line is a stray fence marker
 *
 * @example
 * isStrayFenceLine(":::") // true
 * isStrayFenceLine("  :::  ") // true
 * isStrayFenceLine("::::") // true
 * isStrayFenceLine("Content :::") // false
 */
function isStrayFenceLine(line: string): boolean {
  const trimmed = line.trim();
  // Check if line contains ONLY colons (3 or more)
  return trimmed.length >= 3 && /^:+$/.test(trimmed);
}

/**
 * Post-processing step to validate and clean block structures.
 *
 * @param {PartialBlock[]} blocks - The array of blocks to validate
 * @returns {PartialBlock[]} Cleaned and validated blocks
 *
 * @description
 * This function performs two key operations:
 * 1. Filters out stray `:::` paragraphs (leaked from remark-directive nesting)
 * 2. Removes empty `children` arrays from leaf blocks (prevents BlockNote crashes)
 */
function validateAndFixBlocks(blocks: PartialBlock[]): PartialBlock[] {
  return blocks
    .filter((block) => {
      // SAFETY: This filter only removes paragraphs that contain EXACTLY `:::` and nothing else.
      // Conditions:
      // - Block must be a "paragraph" type
      // - Content array must have exactly 1 element
      // - That element must be type "text"
      // - The text (trimmed) must equal exactly ":::"
      // This is VERY specific and won't affect paragraphs containing ":::" mixed with other text.
      if (block.type === "paragraph") {
        // biome-ignore lint/suspicious/noExplicitAny: Block content access
        const content = block.content as any[];
        if (content && content.length === 1 && content[0].type === "text") {
          const text = content[0].text;
          // Strategy: Split by newline, filter out strict fence lines, join back.
          if (text.includes(":::")) {
            const lines = text.split("\n");
            const cleanLines = lines.filter(
              (line: string) => !isStrayFenceLine(line),
            );

            if (cleanLines.length === 0) {
              return false; // Block was ONLY fences, remove it.
            }

            if (lines.length !== cleanLines.length) {
              content[0].text = cleanLines.join("\n");
            }
          }
        }
      }
      return true;
    })
    .map((block) => {
      const safeBlock = { ...block };

      // 1. Recursively validate children if they exist
      if (safeBlock.children && safeBlock.children.length > 0) {
        safeBlock.children = validateAndFixBlocks(safeBlock.children);
      }

      // 2. Remove empty children array for specific leaf/inline blocks
      if (
        ["paragraph", "heading", "important", "goodToKnow", "callout"].includes(
          safeBlock.type as string,
        )
      ) {
        if (safeBlock.children && safeBlock.children.length === 0) {
          delete safeBlock.children;
        }
      }

      return safeBlock;
    });
}

/**
 * Main loop for converting a list of AST nodes (from Remark) into BlockNote blocks.
 * Handles flattening of results (e.g. when a list node returns multiple block items)
 * and filtering out null results.
 *
 * @param {any[]} nodes - Array of Remark AST nodes
 * @returns {PartialBlock[]} Array of BlockNote blocks
 *
 * @description
 * Pipeline Step: 2. Remark AST Nodes -> [This Function] -> PartialBlock[]
 * Usage: Called strictly by markdownToBlocks or recursively by nodeToBlock (for nested children).
 */
function astToBlocks(nodes: MarkdownNode[]): PartialBlock[] {
  if (!nodes) return [];

  const blocks: PartialBlock[] = [];

  for (const node of nodes) {
    const block = nodeToBlock(node);
    if (block) {
      if (Array.isArray(block)) {
        blocks.push(...block);
      } else {
        blocks.push(block);
      }
    }
  }

  return blocks;
}

/**
 * Transform a single specific AST node type into one (or more) BlockNote blocks.
 * Contains the implementation for standard Markdown elements (paragraph, heading, list, etc.).
 *
 * @param {any} node - A single Remark AST node
 * @returns {PartialBlock | PartialBlock[] | null} One block, an array of blocks, or null if the node should be ignored
 *
 * @description
 * Pipeline Step: 3. Single AST Node -> [This Function] -> PartialBlock | PartialBlock[] | null
 * Usage: Called by astToBlocks for each node in the tree.
 *
 * NOTE: We manually map nodes here instead of using BlockNote's default importer because:
 * 1. We need to support custom Remark Directives (:::toggle, :::important) which standard import ignores.
 * 2. We need to preserve complex nesting (e.g. lists inside toggles) which standard HTML-based import often flattens.
 */
function nodeToBlock(node: MarkdownNode): PartialBlock | PartialBlock[] | null {
  switch (node.type) {
    case "paragraph":
      return {
        type: "paragraph",
        // biome-ignore lint/suspicious/noExplicitAny: BlockNote content type
        content: serializeInline(node.children || []) as any,
      };

    case "heading":
      return {
        type: "heading",
        props: {
          level: Math.min(Math.max(node.depth || 1, 1), 3) as 1 | 2 | 3,
        },
        // biome-ignore lint/suspicious/noExplicitAny: BlockNote content type
        content: serializeInline(node.children || []) as any,
      };

    case "list":
      return (node.children || []).flatMap((listItem: MarkdownNode) => {
        const firstChild = listItem.children?.[0];
        let content: InlineContent[] = [];
        let nestedBlocks: PartialBlock[] = [];

        if (firstChild && firstChild.type === "paragraph") {
          content = serializeInline(firstChild.children || []);
          const remaining = (listItem.children || []).slice(1);
          if (remaining.length > 0) {
            nestedBlocks = astToBlocks(remaining);
          }
        } else {
          content = serializeInline(listItem.children || []);
        }

        return {
          type:
            listItem.checked !== null && listItem.checked !== undefined
              ? "checkListItem"
              : node.ordered
                ? "numberedListItem"
                : "bulletListItem",
          props:
            listItem.checked !== null && listItem.checked !== undefined
              ? { checked: listItem.checked }
              : {},
          // biome-ignore lint/suspicious/noExplicitAny: BlockNote content type
          content: content as any,
          children: nestedBlocks,
        } as PartialBlock;
      });

    case "containerDirective":
    case "leafDirective":
      return parseDirective(node);

    case "blockquote":
      return {
        type: "quote",
        // biome-ignore lint/suspicious/noExplicitAny: BlockNote content type
        content: serializeInline(node.children || []) as any,
      };

    case "code":
      return {
        type: "codeBlock",
        props: { language: node.lang || "" },
        content: node.value || "",
      };

    case "thematicBreak":
      return {
        type: "paragraph",
        content: "---",
      };

    case "table": {
      // Pipeline Step: 3e. Table Node Conversion
      const rows = (node.children || []).map((row: MarkdownNode) => ({
        cells: (row.children || []).map((cell: MarkdownNode) =>
          serializeInline(cell.children || []),
        ),
      }));
      return {
        type: "table",
        content: {
          type: "tableContent",
          // biome-ignore lint/suspicious/noExplicitAny: custom table structure
          rows: rows as any,
        },
      };
    }

    case "image":
      return {
        type: "image",
        props: {
          url: node.url || "",
          caption: node.title || node.alt || "",
          name: node.alt || "Image",
        },
      };

    case "html": {
      const textContent = (node.value || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (textContent) {
        return {
          type: "paragraph",
          content: [{ type: "text", text: textContent, styles: {} }],
        };
      }
      return null;
    }

    case "root":
      return astToBlocks(node.children || []);

    default:
      // Unknown nodes are ignored
      return null;
  }
}

/**
 * Processes Remark Directives (:::name) and maps them to BlockNote blocks.
 * Handles attribute extraction (e.g. {title="foo"}) and recursive child parsing.
 *
 * @param {any} node - A Remark AST node of type 'containerDirective' or 'leafDirective'
 * @returns {PartialBlock} A constructed BlockNote block
 *
 * @description
 * Pipeline Step: 3a. Directive Node -> [This Function] -> Specific Block
 * Usage: Called by nodeToBlock when encountering 'containerDirective' or 'leafDirective'.
 */
function parseDirective(node: MarkdownNode): PartialBlock {
  const attrs = node.attributes || {};
  const name = node.name || "";

  let blockType = name;
  const props: Record<string, unknown> = { ...attrs };

  if (name === "good-to-know" || name === "important") {
    blockType = "callout";
    props.variant = name === "good-to-know" ? "goodToKnow" : "important";
  }

  let childrenBlocks = astToBlocks(node.children || []);
  // biome-ignore lint/suspicious/noExplicitAny: content array
  let content: any[] = [];

  // Logic to extract the first paragraph as the main inline content for these blocks
  if (blockType === "callout") {
    if (childrenBlocks.length > 0 && childrenBlocks[0].type === "paragraph") {
      content = childrenBlocks[0].content as InlineContent[];
      childrenBlocks = childrenBlocks.slice(1);
    }
  }

  if (name === "toggle") {
    const title = attrs.title || "Toggle";
    const toggleContent = [{ type: "text" as const, text: title, styles: {} }];

    return {
      type: "toggleListItem",
      props: props, // Pass remaining attributes (id, class)
      content: toggleContent,
      children: childrenBlocks,
    };
  }

  return {
    // biome-ignore lint/suspicious/noExplicitAny: Custom block types
    type: blockType as any,
    props: props,
    content: content,
    children: childrenBlocks,
  };
}

/**
 * Converts the inner content of a block (text, bold, links, etc.)
 * from Remark AST format to BlockNote's "InlineContent" format.
 * Includes "smart flattening" to handle paragraphs nested inside inline contexts.
 *
 * @param {any[]} nodes - Array of AST nodes representing inline content
 * @returns {any[]} Array of BlockNote InlineContent objects
 *
 * @description
 * Pipeline Step: 4. AST Children (Text/Phrasing) -> [This Function] -> BlockNote InlineContent[]
 * Usage: Called by nodeToBlock for any block that contains text.
 */
function serializeInline(nodes: MarkdownNode[]): InlineContent[] {
  return serializeInlineRecursive(nodes, {});
}

/**
 * Recursive helper to process inline nodes and preserve style inheritance.
 * Merges parent styles (e.g. bold) with child styles (e.g. italic).
 */
function serializeInlineRecursive(
  nodes: MarkdownNode[],
  parentStyles: Record<string, boolean | string>,
): InlineContent[] {
  if (!nodes) return [];

  return nodes.flatMap((node) => {
    // Smart flattening: If we find a paragraph in an inline context, extract its children
    // Paragraphs shouldn't technically be here but Remark can produce them in some contexts (e.g. inside blockquotes/list items processed as inline)
    if (node.type === "paragraph") {
      return serializeInlineRecursive(node.children || [], parentStyles);
    }

    // BASE CASE: Text Node
    if (node.type === "text") {
      return {
        type: "text",
        text: node.value || "",
        styles: { ...parentStyles },
      };
    }

    // FORMATTING: Recursive steps that add styles
    if (node.type === "strong") {
      return serializeInlineRecursive(node.children || [], {
        ...parentStyles,
        bold: true,
      });
    }

    if (node.type === "emphasis") {
      return serializeInlineRecursive(node.children || [], {
        ...parentStyles,
        italic: true,
      });
    }

    if (node.type === "delete") {
      return serializeInlineRecursive(node.children || [], {
        ...parentStyles,
        strike: true,
      });
    }

    if (node.type === "inlineCode") {
      // Inline code is usually a leaf node in Markdown, but we treat it as styled text
      return {
        type: "text",
        text: node.value || "",
        styles: { ...parentStyles, code: true },
      };
    }

    // LINKS: Special case, link is a node type, not just a style
    if (node.type === "link") {
      const childContent = serializeInlineRecursive(
        node.children || [],
        parentStyles,
      );

      // Filter out non-text nodes to satisfy BlockNote's strict Link content type (StyledText[])
      const filteredContent = childContent.filter((c) => c.type === "text");

      return {
        type: "link",
        href: node.url || "",
        // biome-ignore lint/suspicious/noExplicitAny: complex type definition mismatch workaround
        content: filteredContent as any[],
      };
    }

    // Fallback for unknown inline nodes: Try to stringify value or ignore
    return {
      type: "text",
      text: node.value || "",
      styles: { ...parentStyles },
    };
  });
}
