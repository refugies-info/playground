/**
 * Normalizes markdown directive fences to ensure unambiguous nesting.
 *
 * ---------------------------------------------------------------------------
 * PROBLEM: Ambiguous Parsing of Flat Fences
 * ---------------------------------------------------------------------------
 * The `remark-directive` plugin usually relies on indentation to detect nesting.
 * Without indentation (flat structure), it cannot distinguish which closing fence
 * belongs to which block if all fences have the same length (e.g., `::: `).
 *
 * Why Flat Structure?
 * We stick to a "Flat" output from our WYSIWYG editor (BlockNote) because managing
 * indentation state during live edits is complex and error-prone.
 * We prefer to save flat, standardized Markdown (::: everywhere) and let
 * this normalization step handle the complexity of reconstruction.
 *
 * Example (Broken):
 *   :::toggle (Root)
 *   :::important (Child)
 *   ::: (Closes Child? Or Root? Ambiguous!)
 *   ::: (Closes Root?)
 *
 * Result: `remark-directive` often closes the Root prematurely or fails to nest the Child.
 *
 * ---------------------------------------------------------------------------
 * SOLUTION: Fence Length Normalization (Pre-processing)
 * ---------------------------------------------------------------------------
 * We rewrite the input Markdown BEFORE it hits the parser.
 * We assign decreasing fence lengths based on nesting depth.
 * - Root Level  = 12 colons (::::::::::::)
 * - Level 1     = 11 colons (:::::::::::)
 * - ...
 * - Deepest     = 3 colons  (:::)
 *
 * Why this works:
 * CommonMark spec says a closing fence must be at least as long as the opening one.
 * By making Inner fences SHORTER than Outer fences, an Inner closing fence (:::)
 * CANNOT close an Outer block (::::::::::::), forcing the parser to keep the Outer block open.
 *
 * Example (Fixed):
 *   ::::::::::::toggle (Length 12)
 *   :::::::::::important (Length 11)
 *   ::::::::::tip (Length 10)
 *   :::::::::: (Matches 10. Closes Tip. Too short to close Important/Root!)
 *   ::::::::::: (Matches 11. Closes Important.)
 *   :::::::::::: (Matches 12. Closes Root.)
 *
 * ---------------------------------------------------------------------------
 * PIPELINE SCHEMA
 * ---------------------------------------------------------------------------
 *
 *    [Raw Markdown Input]
 *    (Ambiguous `::: ` fences)
 *            │
 *            ▼
 *    [normalizeMarkdown]  <-- THIS STEP
 *    (Rewrites fences to unique lengths)
 *            │
 *            ▼
 *    [Normalized Markdown]
 *    (Strict Nesting `::::` > `:::`)
 *            │
 *            ▼
 *    [Unified / Remark Parser]
 *    (Parses correctly without plugins)
 *            │
 *            ▼
 *    [AST / BlockNote Blocks]
 *
 * ---------------------------------------------------------------------------
 */
/**
 * Pre-processes markdown to normalize directive fences (:::).
 * Ensures that nesting depth is reflected in fence length (Outer > Inner).
 * This allows remark-directive to correctly reconstruct the hierarchy
 * even when the input is "flat" (non-indented).
 *
 * @param {string} markdown - The raw markdown input to normalize.
 * @returns {string} The normalized markdown with unique fence lengths per depth level.
 */
export function normalizeMarkdown(markdown: string): string {
  const lines = markdown.split("\n");
  // Why a Limit?
  // To ensure correct nesting, Inner blocks must have SHORTER fences than Outer blocks.
  // CommonMark Spec: A closing fence must be "at least as long" as the opening fence to close it.
  //
  // Scenario:
  // Outer: `:::::` (length 5)
  // Inner: `::::`  (length 4)
  //
  // Closing Inner `::::` (4):
  // - Matches Inner (4 >= 4) -> Closes Inner.
  // - Checks Outer (4 < 5)   -> Does NOT close Outer. Nested correctly!
  //
  // If we did the opposite (Inner = 6):
  // Closing Inner `::::::` (6):
  // - Matches Inner (6 >= 6) -> Closes Inner.
  // - Checks Outer (6 >= 5)  -> ALSO closes Outer! Hierarchy broken.
  //
  // Therefore, we must count DOWN from a maximum length.
  // 12 allows for 9 levels of nesting (12 down to 3), which is plenty for 99.9% of content.
  const MAX_LENGTH = 12;

  // Stack to track open directives and their assigned fence lengths.
  // Robustness Strategy: "Best Effort"
  // - If we encounter an unbalanced closing fence (stack empty), we print it as-is.
  // - If we reach EOF with open fences (stack not empty), they remain unclosed (parser handles this gracefully).
  // - Extra newlines: Are empty lines in the array, ignored by regex.
  // - Missing newlines: Merged lines are treated as text (Standard Markdown behavior).
  const stack: number[] = [];
  let inCodeBlock = false; // Track if we are inside a code block

  const rewrites: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for Code Block Fences (``` or ~~~)
    // We toggle state and DO NOT normalize fences inside.
    const codeBlockMatch = line.match(/^(\s*)(`{3,}|~{3,})(.*)$/);
    if (codeBlockMatch) {
      inCodeBlock = !inCodeBlock;
      rewrites.push(line);
      continue;
    }

    // Capture content inside code block as-is
    if (inCodeBlock) {
      rewrites.push(line);
      continue;
    }

    // Check for Directive Start: `:::name`
    // We strictly match lines that START with indentation + `:::`.
    // Embedded fences (in text) are not directive markers and shouldn't be touched?
    // Wait, if `remark-directive` sees them as text, we ignore them.
    // If `remark-directive` sees them as directives, we must normalize them.
    // Spec: "A block directive is a line starting with `:::`".

    // Check for Directive Start: `:::name`
    // Regex breakdown:
    // ^(\s*)      -> Capture leading indentation (Group 1)
    // (:{3,})     -> Capture valid fence (3+ colons) (Group 2)
    // ([a-zA-Z][\w-]*) -> Capture Directive Name (Group 3).
    //    - Must start with letter (usually)
    //    - Can contain letters, numbers, _, -
    // (.*)$       -> Capture Attributes / Rest of line (Group 4)
    const startMatch = line.match(/^(\s*)(:{3,})([a-zA-Z][\w-]*)(.*)$/);
    if (startMatch) {
      const [_, indent, _oldFence, name, rest] = startMatch;
      const currentDepth = stack.length;
      const newLen = Math.max(3, MAX_LENGTH - currentDepth);
      stack.push(newLen);

      const newFence = ":".repeat(newLen);
      rewrites.push(`${indent}${newFence}${name}${rest}`);
      continue;
    }

    // Check for Closing Fence: `:::` (no name)
    // Regex breakdown:
    // ^(\s*)      -> Indentation (Group 1)
    // (:{3,})     -> Fence (3+ colons) (Group 2)
    // \s*$        -> End of line (ignoring trailing whitespace)
    // Note: This strictly matches "fence only" lines.
    const endMatch = line.match(/^(\s*)(:{3,})\s*$/);
    if (endMatch) {
      const [_, indent] = endMatch;
      if (stack.length > 0) {
        const len = stack.pop()!;
        const newFence = ":".repeat(len);
        rewrites.push(`${indent}${newFence}`);
      } else {
        // Unbalanced fence.
        // We leave it as is. It acts as text or broken fence.
        rewrites.push(line);
      }
      continue;
    }

    rewrites.push(line);
  }

  return rewrites.join("\n");
}
