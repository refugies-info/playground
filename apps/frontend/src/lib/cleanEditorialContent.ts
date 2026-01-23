import type { Root } from "mdast";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

/**
 * Cleans the editorial content by:
 * 1. Removing the "Journal des Avertissements" section (from heading to next H1).
 * 2. Removing the first H1 (the title), as it is passed separately in metadata.
 */
export function cleanEditorialContent(markdown: string): {
  content: string;
  title?: string;
} {
  if (!markdown) return { content: "" };

  const processor = unified().use(remarkParse).use(remarkStringify);
  const tree = processor.parse(markdown) as Root;

  let warningSectionStartIndex = -1;
  let warningSectionEndIndex = -1;
  let extractedTitle: string | undefined;

  // Pass 1: Identify "Journal des Avertissements" section
  // We look for an H1 that contains the warning text
  // The section ends at the next H1 or end of file
  for (let i = 0; i < tree.children.length; i++) {
    const node = tree.children[i];

    if (node.type === "heading" && node.depth === 1) {
      const textContent = processor
        .stringify({ type: "root", children: [node] })
        .toLowerCase();
      if (textContent.includes("journal des avertissements")) {
        warningSectionStartIndex = i;

        // Find the end of the section (next H1)
        for (let j = i + 1; j < tree.children.length; j++) {
          const nextNode = tree.children[j];
          if (nextNode.type === "heading" && nextNode.depth === 1) {
            warningSectionEndIndex = j;
            break;
          }
        }
        // If no next H1 found, the section goes to the end
        if (warningSectionEndIndex === -1) {
          warningSectionEndIndex = tree.children.length;
        }
        break; // Stop after finding the first warning section
      }
    }
  }

  // Remove the warning section if found
  if (warningSectionStartIndex !== -1) {
    tree.children.splice(
      warningSectionStartIndex,
      warningSectionEndIndex - warningSectionStartIndex,
    );
  }

  // Pass 2: Extract and remove the Main Title (First H1)
  // We search the modified tree for the first H1
  for (let i = 0; i < tree.children.length; i++) {
    const node = tree.children[i];
    if (node.type === "heading" && node.depth === 1) {
      // Extract title text (remove "# " markup by stringifying content only)
      // Actually, processor.stringify(node) returns "# Title\n"
      // We want just the text. We can traverse the node's children or just strip the "# "
      extractedTitle = processor
        .stringify({ type: "root", children: [node] })
        .replace(/^#\s+/, "")
        .trim();

      // Remove this node
      tree.children.splice(i, 1);
      break;
    }
  }

  return {
    content: processor.stringify(tree).trim(),
    title: extractedTitle,
  };
}
