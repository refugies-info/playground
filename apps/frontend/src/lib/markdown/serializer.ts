/**
 * Directive Serializer
 *
 * Converts BlockNote blocks back to Markdown with Directive syntax
 * for custom blocks (toggle, callout, box).
 *
 *  ┌─────────────────────────────────────────────────────────────────────────┐
 *  │                           Pipeline Overview                             │
 *  └─────────────────────────────────────────────────────────────────────────┘
 *
 *    [BlockNote Editor]
 *          │
 *          ▼
 *    [BlockNote JSON Blocks]  <-- Input (AnyBlock[])
 *          │
 *          │  Step 5: Serialization
 *          ▼
 *    [Directive Serializer]   <-- THIS FILE
 *          │
 *          ├─ blockToMarkdown (Dispatcher)
 *          │    ├─ serializeToggle (:::toggle)
 *          │    ├─ serializeContainerBlock (:::important, etc.)
 *          │    └─ serializeTable (Markdown Table)
 *          │
 *          ▼
 *    [Markdown String]        <-- Output (Start with :::directive)
 *          │
 *          ▼
 *       [Database]
 *
 * This ensures round-trip compatibility: Directive -> BlockNote -> Directive
 */

// biome-ignore lint/suspicious/noExplicitAny: BlockNote types are complex with generics, using simplified types for serialization
type AnyBlock = any;
type AnyInlineContent = any;
type AnyStyledText = any;

/**
 * Converts BlockNote blocks to Markdown with Directive syntax.
 *
 * @param {AnyBlock[]} blocks - The array of BlockNote blocks to serialize
 * @returns {string} The resulting Markdown string with Directives
 *
 * @description
 * Pipeline Step: 5. BlockNote Blocks -> [This Function] -> Markdown (Saved to DB)
 * Entry point for the serialization process.
 */
export function blocksToDirectiveMarkdown(blocks: AnyBlock[]): string {
  return blocks.map((block) => blockToMarkdown(block, 0)).join("\n\n");
}

/**
 * Convert a single block to Markdown.
 * Dispatches to specific serializer based on block type.
 *
 * @param {AnyBlock} block - The block to serialize
 * @param {number} depth - Current nesting depth (used for lists)
 * @returns {string} The markdown representation of the block
 *
 * @description
 * Pipeline Step: 5a. Single Block Dispatcher
 * Routes each block to its specific serialization logic.
 */
function blockToMarkdown(block: AnyBlock, depth: number): string {
  const indent = "";

  switch (block.type) {
    case "toggleListItem":
      return serializeToggle(block, indent, depth);

    case "callout": {
      const variant = (block.props as { variant?: string }).variant;
      const directiveName =
        variant === "important" ? "important" : "good-to-know";
      return serializeContainerBlock(block, indent, depth, directiveName);
    }

    case "paragraph":
      return indent + inlineContentToMarkdown(block.content);

    case "heading": {
      const level = (block.props as { level?: number }).level || 1;
      const prefix = "#".repeat(level);
      return `${indent}${prefix} ${inlineContentToMarkdown(block.content)}`;
    }

    case "bulletListItem": {
      const bulletContent = inlineContentToMarkdown(block.content);
      const bulletChildren = serializeChildren(block.children, depth);
      return `${indent}- ${bulletContent}${bulletChildren}`;
    }

    case "numberedListItem": {
      const numContent = inlineContentToMarkdown(block.content);
      const numChildren = serializeChildren(block.children, depth);
      return `${indent}1. ${numContent}${numChildren}`;
    }

    case "checkListItem": {
      const checked = (block.props as { checked?: boolean }).checked;
      const checkContent = inlineContentToMarkdown(block.content);
      return `${indent}- [${checked ? "x" : " "}] ${checkContent}`;
    }

    case "codeBlock": {
      const lang = (block.props as { language?: string }).language || "";
      const code = inlineContentToMarkdown(block.content);
      return `${indent}\`\`\`${lang}\n${code}\n\`\`\``;
    }

    case "quote":
      return `${indent}> ${inlineContentToMarkdown(block.content)}`;

    case "image": {
      const { name, url } = block.props as { name?: string; url?: string };
      return `${indent}![${name || "Image"}](${url || ""})`;
    }

    case "table":
      return serializeTable(block, indent);

    default:
      // For unknown blocks, try to serialize content if present
      if (block.content) {
        return indent + inlineContentToMarkdown(block.content);
      }
      return "";
  }
}

/**
 * Serializes a Toggle block (native toggleListItem) to Directive syntax (:::toggle).
 *
 * @param {AnyBlock} block - The BlockNote block (type: toggleListItem)
 * @param {string} indent - Current indentation string
 * @returns {string} The formatted directive string
 *
 * @description
 * Pipeline Step: 5b. Toggle Serialization
 * Transforms a native BlockNote toggle list item into our custom directive syntax:
 * `:::toggle{title="My Title"}`
 *
 * Mapping logic:
 * - Content of toggleListItem -> title attribute
 * - Children of toggleListItem -> inner content of the directive
 * - Expanded state -> isOpen attribute (defaulting to true)
 */
function serializeToggle(
  block: AnyBlock,
  indent: string,
  depth: number,
): string {
  // 1. Extract title from the block's inline content
  const title = inlineContentToMarkdown(block.content) || "Toggle";

  // 2. Serialize all nested children blocks
  const children = serializeChildren(block.children, depth);
  const inner = children || "";

  return `${indent}:::toggle{title="${escapeQuotes(title)}"}\n${inner}\n${indent}:::`;
}

/**
 * Helper to serialize a standard container block (like Important or GoodToKnow).
 * Consolidates common logic for blocks that just wrap content + children.
 *
 * @param {AnyBlock} block - The block to serialize
 * @param {string} indent - Indentation string
 * @param {string} directiveName - The name of the directive (e.g. "important")
 * @returns {string} The serialized markdown directive
 *
 * @description
 * Pipeline Step: 5c. Container Block Serialization
 * Generic logic for blocks that simply wrap content and children within a directive.
 */
function serializeContainerBlock(
  block: AnyBlock,
  indent: string,
  depth: number,
  directiveName: string,
): string {
  // 1. Serialize the main content of the block
  const content = inlineContentToMarkdown(block.content);

  // 2. Serialize any nested children blocks
  const children = serializeChildren(block.children, depth);

  // 3. Combine content and children into the inner body
  let inner = "";
  if (content) inner += content;
  // If we have both content and children, ensure they are separated by a newline
  if (children) inner += (content ? "\n" : "") + children;

  return `${indent}:::${directiveName}\n${inner}\n${indent}:::`;
}

/**
 * Serialize children blocks recursively.
 *
 * @param {AnyBlock[] | undefined} children - Array of children blocks
 * @param {number} depth - Recursion depth
 * @returns {string} Serialized children markdown
 *
 * @description
 * Pipeline Step: 5d. Recursive Children Serialization
 * Iterates through child blocks and processes them recursively.
 */
function serializeChildren(
  children: AnyBlock[] | undefined,
  depth: number,
): string {
  if (!children || children.length === 0) return "";
  return (
    "\n" + children.map((child) => blockToMarkdown(child, depth + 1)).join("\n")
  );
}

/**
 * Serialize table block.
 * Handles both array-based and object-based cell structures.
 *
 * @param {AnyBlock} block - The table block
 * @param {string} indent - Indentation string
 * @returns {string} Markdown table
 *
 * @description
 * Pipeline Step: 5e. Table Serialization
 * Converts BlockNote table structure (which can vary) into standard Markdown table syntax.
 */
function serializeTable(block: AnyBlock, indent: string): string {
  const content = block.content as any;
  if (!content || !Array.isArray(content.rows)) {
    return "";
  }

  const rows = content.rows;
  if (rows.length === 0) return "";

  const lines: string[] = [];

  // Header row - access cells property with robust fallback
  const headerRow = rows[0];
  const headerCells = Array.isArray(headerRow.cells)
    ? headerRow.cells.map((cell: any) => {
        // Robust handling: cell might be InlineContent[] or { content: InlineContent[] }
        const cellContent = Array.isArray(cell) ? cell : cell.content || [];
        return inlineContentToMarkdown(cellContent);
      })
    : [];

  if (headerCells.length === 0) return "";

  lines.push(`| ${headerCells.join(" | ")} |`);
  lines.push(`| ${headerCells.map(() => "---").join(" | ")} |`);

  // Data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const cells = Array.isArray(row.cells)
      ? row.cells.map((cell: any) => {
          const cellContent = Array.isArray(cell) ? cell : cell.content || [];
          return inlineContentToMarkdown(cellContent);
        })
      : [];
    lines.push(`| ${cells.join(" | ")} |`);
  }

  return indent + lines.join("\n" + indent);
}

/**
 * Convert inline content array to Markdown string.
 * Handles text, links, and styling.
 *
 * @param {AnyInlineContent[] | undefined} content - Inline content array
 * @returns {string} Markdown string
 *
 * @description
 * Pipeline Step: 5f. Inline Content Serialization
 * Processes rich text formatting (bold, italic, code) within blocks.
 */
function inlineContentToMarkdown(
  content: AnyInlineContent[] | undefined,
): string {
  if (!content || !Array.isArray(content)) return "";

  return content
    .map((item) => {
      if (item.type === "text") {
        return styledTextToMarkdown(item as AnyStyledText);
      }
      if (item.type === "link") {
        const linkItem = item as any;
        const linkText = linkItem.content
          ? inlineContentToMarkdown(linkItem.content)
          : linkItem.href;
        return `[${linkText}](${linkItem.href})`;
      }
      return "";
    })
    .join("");
}

/**
 * Convert styled text to Markdown with formatting (bold, italic, code, strike).
 *
 * @param {AnyStyledText} item - Styled text item
 * @returns {string} Formatted markdown string
 *
 * @description
 * Pipeline Step: 5g. Styled Text Serialization
 * Applies Markdown formatting syntax to plain text based on styles.
 */
function styledTextToMarkdown(item: AnyStyledText): string {
  let text = item.text;
  const styles = item.styles || {};

  // Apply styles in order: code, then bold, then italic
  if (styles.code) {
    text = `\`${text}\``;
  }
  if (styles.bold) {
    text = `**${text}**`;
  }
  if (styles.italic) {
    text = `*${text}*`;
  }
  if (styles.strike) {
    text = `~~${text}~~`;
  }

  return text;
}

/**
 * Escape quotes in attribute values.
 *
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 *
 * @description
 * Helper utility for safe attribute serialization.
 */
function escapeQuotes(str: string): string {
  return str.replace(/"/g, '\\"');
}
