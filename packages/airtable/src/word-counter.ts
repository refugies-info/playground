import matter from "gray-matter";

/**
 * Counts words in a plain text string.
 * Strips HTML tags before counting.
 *
 * Ported from karfur: apps/server/src/libs/wordCounter.ts
 *
 * @param str - The text to count words in
 * @returns Number of words
 */
export function countWords(str?: string): number {
  if (!str || typeof str !== "string") return 0;

  return str
    .replace(/<\/?[^>]+(>|$)/g, "") // Strip HTML tags
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

/**
 * Counts words in a markdown string, stripping frontmatter and markdown syntax.
 *
 * This is the MO-NEW equivalent of karfur's `countDispositifWords`:
 * it counts ALL words in the FR content (the "à traduire" mode).
 *
 * @param markdown - Full markdown string (may include YAML frontmatter)
 * @returns Number of words in the content
 */
export function countMarkdownWords(markdown?: string): number {
  if (!markdown || typeof markdown !== "string") return 0;

  // 1. Strip YAML frontmatter
  let content: string;
  try {
    const parsed = matter(markdown);
    content = parsed.content;
  } catch {
    // If frontmatter parsing fails, use the raw markdown
    content = markdown;
  }

  // 2. Strip markdown syntax to get plain text
  // Order matters: code blocks before inline code, images before links
  const plainText = content
    // Remove code blocks (fenced) — must come before inline code
    .replace(/```[\s\S]*?```/g, "")
    // Remove inline code
    .replace(/`([^`]*)`/g, "$1")
    // Remove images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    // Remove links [text](url) → keep text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    // Remove heading markers
    .replace(/^#{1,6}\s+/gm, "")
    // Remove bold/italic markers
    .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, "$2")
    // Remove strikethrough
    .replace(/~~(.*?)~~/g, "$1")
    // Remove blockquotes marker
    .replace(/^>\s+/gm, "")
    // Remove horizontal rules
    .replace(/^(-{3,}|\*{3,}|_{3,})$/gm, "")
    // Remove list markers (unordered)
    .replace(/^[\s]*[-*+]\s+/gm, "")
    // Remove list markers (ordered)
    .replace(/^[\s]*\d+\.\s+/gm, "")
    // Remove directive syntax (remark-directive) e.g., :::note
    .replace(/^:{1,3}[\w-]*.*$/gm, "");

  return countWords(plainText);
}
