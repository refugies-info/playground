/**
 *  ┌─────────────────────────────────────────────────────────────────────────┐
 *  │                           Pipeline Overview                             │
 *  └─────────────────────────────────────────────────────────────────────────┘
 *
 *    [BlockNote JSON Blocks]  <-- Input (BlockNote Editor Content)
 *          │
 *          ▼
 *    [Serializer]             <-- THIS FILE (Export Pipeline)
 *          │
 *          ├─ Step 1: Block Conversion (blocksToMdast)
 *          │    ├─ blockToMdast (Dispatcher)
 *          │    ├─ Aggregation (Lists)
 *          │    └─ Inline Serialization (Text, Bold, Links...)
 *          │
 *          ▼
 *    [MDAST Tree]             <-- Intermediate (Markdown Abstract Syntax Tree)
 *          │
 *          ▼
 *    [Remark Processor]       <-- Unified Ecosystem
 *          │
 *          ├─ remark-gfm (Tables, Strikethrough)
 *          ├─ remark-directive (Custom :::directives)
 *          └─ remark-stringify (Compiler)
 *               └─ Custom Stringify Handlers (e.g. ::: fences)
 *
 *          ▼
 *    [Markdown String]        <-- Output (Ready for storage/display)
 */

import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

// Placeholder types to avoid importing from @blocknote/core if they are not exported
// or if we want to avoid dependency issues during this refactor.
type AnyBlock = any;
type AnyInlineContent = any;
type AnyStyledText = any;

// MDAST Node Types (simplified for our needs)
interface MdastNode {
  type: string;
  children?: MdastNode[];
  value?: string;
  depth?: number;
  ordered?: boolean;
  checked?: boolean | null;
  name?: string; // For directives
  attributes?: Record<string, string>; // For directives
  lang?: string; // For code
  url?: string;
  title?: string;
  alt?: string;
  [key: string]: unknown;
}

/**
 * Converts BlockNote blocks to Markdown with Directive syntax.
 * Uses unified/remark ecosystem for reliable serialization.
 *
 * @param {AnyBlock[]} blocks - The array of BlockNote blocks to serialize
 * @returns {string} The generated Markdown string
 *
 * @description
 * Pipeline Entry Point:
 * 1. Blocks -> MDAST (blocksToMdast)
 * 2. MDAST -> Remark (remark-stringify)
 * 3. Remark -> String
 */
export function blocksToDirectiveMarkdown(blocks: AnyBlock[]): string {
  const processor = unified()
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkStringify, {
      bullet: "-",
      fences: true,
      rule: "-",
      handlers: {
        containerDirective: (node, _, state, info) => {
          // Force fixed fence length
          const fence = ":::";
          const prefix = fence + (node.name || "");

          // Serialize attributes (simplified for brevity, remark-stringify has helpers but we might need manual here if overriding)
          // Actually, let's try to reuse default logic but wrap it?
          // Default containerDirective handler in remark-directive implies usage of state.

          // PLAN B: Manual serialization for containerDirective only, leveraging state.indent()

          const exit = state.enter("containerDirective");
          const tracker = state.createTracker(info);

          // Serialize label/attributes (node.attributes)
          let attributes = "";
          const attrs = node.attributes || {};
          if (Object.keys(attrs).length > 0) {
            const attrString = Object.entries(attrs).map(([k, v]) => {
              const val = String(v);
              if (val.includes('"')) {
                return `${k}='${val.replace(/'/g, "\\'")}'`;
              }
              return `${k}="${val}"`;
            });
            attributes = `{${attrString}}`;
          } else if (
            node.name === "important" ||
            node.name === "good-to-know"
          ) {
            // Usually no attributes for these, but if they had:
          }

          const header = tracker.move(prefix + attributes);

          // Manual indentation strategy REMOVED per user request
          // We serialize children flatly
          const content = state.containerFlow(node, tracker.current());

          const footer = tracker.move(":::");
          exit();

          return `${header}\n${content}\n${footer}`;
        },
      },
    });

  const root: MdastNode = {
    type: "root",
    children: blocksToMdast(blocks),
  };

  // Stringify the AST to Markdown
  return processor.stringify(root as any);
}

/**
 * Converts an array of BlockNote blocks to MDAST nodes.
 * Flattens structure where necessary but preserves logical nesting (lists, directives).
 *
 * @param {AnyBlock[]} blocks - Array of BlockNote blocks
 * @returns {MdastNode[]} Array of MDAST nodes
 *
 * @description
 * Pipeline Step: 1. Blocks -> [This Function] -> MDAST Nodes
 * Handles list aggregation (merging adjacent list items into a single List node).
 */
function blocksToMdast(blocks: AnyBlock[]): MdastNode[] {
  const nodes: MdastNode[] = [];

  /**
   * Iterate over blocks to transform them into MDAST nodes.
   * We use a manual loop instead of map() because some blocks (like list items)
   * need to be aggregated into a single parent node (List) based on the previous sibling.
   */
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const node = blockToMdast(block);

    if (node) {
      // Handle Lists Aggregation
      // BlockNote treats list items as individual blocks, but Markdown needs a wrapper List node.
      if (node.type === "listItem") {
        const lastNode = nodes[nodes.length - 1];

        // Check if we can append to the previous list
        if (
          lastNode &&
          lastNode.type === "list" &&
          lastNode.ordered === node.ordered
        ) {
          lastNode.children?.push(node);
        } else {
          // Start a new list
          nodes.push({
            type: "list",
            ordered: node.ordered,
            spread: false,
            children: [node],
          });
        }
      } else {
        nodes.push(node);
      }
    }
  }

  return nodes;
}

/**
 * Convert a single block to its MDAST equivalent.
 *
 * @param {AnyBlock} block - A single BlockNote block
 * @returns {MdastNode | null} The corresponding MDAST node, or null if ignored
 *
 * @description
 * Pipeline Step: 1a. Single Block -> [This Function] -> MDAST Node
 * Dispatcher that handles specific block types (paragraph, heading, lists, directives).
 *
 * Note: For list items, this returns a `listItem` node. The parent `list` wrapper
 * is handled by the `blocksToMdast` aggregator function.
 */
function blockToMdast(block: AnyBlock): MdastNode | null {
  switch (block.type) {
    case "paragraph":
      return {
        type: "paragraph",
        children: inlineContentToMdast(block.content),
      };

    case "heading": {
      const props = block.props as { level: number };
      return {
        type: "heading",
        depth: props.level,
        children: inlineContentToMdast(block.content),
      };
    }

    case "bulletListItem":
    case "numberedListItem":
    case "checkListItem": {
      // We return a listItem node here.
      // The aggregator in blocksToMdast will wrap it in a 'list' node.

      // 1. Content: Wrap inline content in a paragraph (required by GFM for list items)
      const contentChildren = inlineContentToMdast(block.content);
      const children: MdastNode[] = [];

      if (contentChildren.length > 0) {
        children.push({
          type: "paragraph",
          children: contentChildren,
        });
      }

      // 2. Process nested children (sublists, toggles inside lists, etc.)
      if (block.children && block.children.length > 0) {
        const nestedNodes = blocksToMdast(block.children);
        children.push(...nestedNodes);
      }

      const isOrdered = block.type === "numberedListItem";
      const isChecked =
        block.type === "checkListItem"
          ? (block.props.checked as boolean)
          : null;

      return {
        type: "listItem",
        checked: isChecked,
        ordered: isOrdered, // Helper property for aggregator
        spread: false,
        children: children,
      };
    }

    case "toggleListItem": {
      const title = inlineContentString(block.content) || "Toggle";
      const childrenNodes = blocksToMdast(block.children || []);

      return {
        type: "containerDirective",
        name: "toggle",
        attributes: { title },
        children: childrenNodes,
      };
    }

    case "callout": {
      const variant = (block.props as { variant?: string }).variant;
      const directiveName =
        variant === "important" ? "important" : "good-to-know";

      // Inline content of the callout becomes the first paragraph
      const contentNodes = inlineContentToMdast(block.content);
      const childrenNodes: MdastNode[] = [];

      if (contentNodes.length > 0) {
        childrenNodes.push({
          type: "paragraph",
          children: contentNodes,
        });
      }

      // Append nested blocks
      if (block.children && block.children.length > 0) {
        childrenNodes.push(...blocksToMdast(block.children));
      }

      return {
        type: "containerDirective",
        name: directiveName,
        attributes: {},
        children: childrenNodes,
      };
    }

    case "codeBlock": {
      const lang = (block.props as { language?: string }).language || "";
      const text = inlineContentString(block.content);
      return {
        type: "code",
        lang,
        value: text,
      };
    }

    case "quote":
      return {
        type: "blockquote",
        children: [
          {
            type: "paragraph",
            children: inlineContentToMdast(block.content),
          },
        ],
      };

    case "image": {
      const props = block.props as { name?: string; url?: string };
      return {
        type: "image",
        url: props.url || "",
        alt: props.name || "Image",
      };
    }

    case "table":
      return serializeTableToMdast(block);

    default:
      // Fallback: try to just render content if available
      if (block.content) {
        return {
          type: "paragraph",
          children: inlineContentToMdast(block.content),
        };
      }
      return null;
  }
}

/**
 * Handle Table Serialization to GFM Table AST
 *
 * @param {AnyBlock} block - The table block
 * @returns {MdastNode | null} MDAST table node
 *
 * @description
 * Pipeline Step: 1b. Table Block -> [This Function] -> GFM Table Node
 * Maps BlockNote table structure (rows/cells) to Remark GFM table structure.
 */
function serializeTableToMdast(block: AnyBlock): MdastNode | null {
  // BlockNote table structure varies, assume standard structure for now
  const content = block.content as any;
  if (!content || !Array.isArray(content.rows)) return null;

  const rows = content.rows;
  if (rows.length === 0) return null;

  const tableRows = rows.map((row: any) => {
    const cells = Array.isArray(row.cells)
      ? row.cells.map((cell: any) => {
          const cellContent = Array.isArray(cell) ? cell : cell.content || [];
          return {
            type: "tableCell",
            children: inlineContentToMdast(cellContent),
          };
        })
      : [];

    return {
      type: "tableRow",
      children: cells,
    };
  });

  return {
    type: "table",
    children: tableRows,
  };
}

/**
 * Convert inline content to MDAST phrasing nodes.
 * Handles text, links, and styles (bold, italic, strike, code).
 *
 * @param {AnyInlineContent[]} content - Array of inline content objects
 * @returns {MdastNode[]} Array of MDAST phrasing nodes
 *
 * @description
 * Pipeline Step: 2. Inline Content -> [This Function] -> MDAST Phrasing Nodes
 * Maps Text/Links/Styles to MDAST equivalents.
 */
function inlineContentToMdast(
  content: AnyInlineContent[] | undefined,
): MdastNode[] {
  if (!content || !Array.isArray(content)) return [];

  return content.map((item) => {
    if (item.type === "link") {
      const linkContent = item.content as AnyInlineContent[];
      return {
        type: "link",
        url: item.href,
        children: inlineContentToMdast(linkContent),
      };
    }

    if (item.type === "text") {
      const styledItem = item as AnyStyledText;
      let node: MdastNode = { type: "text", value: styledItem.text };

      // Apply styles by wrapping (bold > italic > strike > code)
      // Note: AST nesting order matters less than HTML, but we wrap conventionally.

      if (styledItem.styles?.code) {
        // Code is usually a leaf node in AST (inlineCode), it doesn't wrap "text".
        // We recreate it as inlineCode.
        node = { type: "inlineCode", value: styledItem.text };
        // Code usually disables other styles in Markdown, but if needed we could wrap.
        // Standard commonmark: `*foo*` -> inlineCode containing *foo*, not emphasis.
        return node;
      }

      if (styledItem.styles?.strike) {
        node = { type: "delete", children: [node] };
      }
      if (styledItem.styles?.italic) {
        node = { type: "emphasis", children: [node] };
      }
      if (styledItem.styles?.bold) {
        node = { type: "strong", children: [node] };
      }

      return node;
    }

    return { type: "text", value: "" };
  });
}

/**
 * Helper to extract plain text string from inline content array.
 * Useful for attributes like title or alt text.
 *
 * @param {AnyInlineContent[]} content - Array of inline content objects
 * @returns {string} The concatenated plain text
 *
 * @description
 * Utility function to strip styles and get raw text for non-content fields (attributes).
 */
function inlineContentString(content: AnyInlineContent[] | undefined): string {
  if (!content) return "";
  return content
    .map((c) => {
      if (c.type === "text") return (c as AnyStyledText).text;
      if (c.type === "link") return (c as any).href; // or content
      return "";
    })
    .join("");
}
