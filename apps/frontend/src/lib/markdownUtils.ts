import matter from "gray-matter";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

/**
 * Custom sanitization schema that allows common HTML tags
 * while still blocking dangerous elements like <script> and event handlers
 */
export const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    "p",
    "br",
    "div",
    "span",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "ul",
    "ol",
    "li",
    "a",
    "blockquote",
    "pre",
    "code",
    "hr",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
};

/**
 * Convert mixed content (Markdown + HTML) to pure HTML.
 *
 * This uses the remark ecosystem to properly parse Markdown and convert it to HTML,
 * which BlockNote can then parse via tryParseHTMLToBlocks.
 *
 * Pipeline:
 * 1. Strip YAML frontmatter with gray-matter
 * 2. Parse Markdown with remark-parse
 * 3. Convert to HTML AST with remark-rehype (allowing dangerous HTML to pass through)
 * 4. Parse raw HTML nodes with rehype-raw (critical for embedded HTML in markdown)
 * 5. Sanitize HTML to remove dangerous tags/attributes with rehype-sanitize
 * 6. Serialize to HTML string with rehype-stringify
 */
export async function convertMixedContentToHtml(
  content: string,
): Promise<string> {
  if (!content) return "";

  // Strip YAML frontmatter if present
  const { content: contentWithoutFrontmatter } = matter(content);

  // Convert Markdown to HTML using unified pipeline
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(contentWithoutFrontmatter);

  return String(result);
}
