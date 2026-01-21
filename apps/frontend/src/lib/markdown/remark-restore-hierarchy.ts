import type { Node, Parent } from "unist";
import { visit } from "unist-util-visit";

/**
 * Remark Plugin to restore nested hierarchy from flat markdown directives.
 *
 * It scans for "stray" `:::` closing fences (parsed as paragraphs in flat markdown)
 * and uses them as signals to nest the preceding sibling into the ante-preceding sibling.
 *
 * Transformation: `[Parent, Child, :::]` -> `[Parent(Child)]`
 *
 * Example:
 *    [ AST (Flat) ]              [ AST (Nested) ]
 *
 *    +-----------+               +-----------+
 *    | Parent    |               | Parent    |
 *    +-----------+               +-----------+
 *    | Child     |  ======>      |  Children:|
 *    +-----------+               |  +-----+  |
 *    | ::: (End) |               |  |Child|  |
 *    +-----------+               |  +-----+  |
 *                                +-----------+
 */
export function remarkRestoreHierarchy() {
  return (tree: Node) => {
    visit(tree, checkContainer);
  };
}

function checkContainer(node: Node) {
  const container = node as Parent;
  if (!container.children || !Array.isArray(container.children)) return;

  // Restart scan after mutation to handle multi-level nesting
  let i = 0;
  while (i < container.children.length) {
    const child = container.children[i];

    if (isClosingFenceParagraph(child)) {
      const index = i;

      // Need at least 2 preceding elements: [Target, ElementToMove, Fence]
      if (index >= 2) {
        const target = container.children[index - 2];
        const elementToMove = container.children[index - 1];

        if (target.type === "containerDirective") {
          const targetContainer = target as Parent;
          targetContainer.children = targetContainer.children || [];
          targetContainer.children.push(elementToMove);

          // Remove moved element and the fence
          container.children.splice(index - 1, 2);

          // Step back to catch chained closures
          i = Math.max(0, index - 2);
          continue;
        }
      }

      // Remove invalid/unused fence
      container.children.splice(i, 1);
      continue;
    }

    i++;
  }
}

/**
 * Checks if a node is a paragraph containing only ":::"
 * This occurs when remark-directive parses a closing fence without matching indentation.
 */
// biome-ignore lint/suspicious/noExplicitAny: AST traversal involves loose types
function isClosingFenceParagraph(node: any): boolean {
  if (node.type !== "paragraph") return false;
  if (!node.children || node.children.length !== 1) return false;

  const text = node.children[0];
  if (text.type !== "text") return false;

  return text.value.trim() === ":::";
}
