import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
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
 */
const sanitizeSchema = {
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
 * Same pipeline as EditionView for consistent rendering.
 */
async function convertMixedContentToHtml(content: string): Promise<string> {
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

interface MarkdownViewerProps {
  /** Markdown content to render (can include YAML frontmatter) */
  content: string;
  /** Optional loading message */
  loadingMessage?: string;
  /** Optional empty state message */
  emptyMessage?: string;
}

/**
 * Reusable component for rendering markdown content with BlockNote.
 * Handles frontmatter stripping and markdown-to-HTML conversion.
 */
export function MarkdownViewer({
  content,
  loadingMessage = "Chargement...",
  emptyMessage = "Aucun contenu disponible",
}: MarkdownViewerProps) {
  // Create read-only editor instance
  const editor = useCreateBlockNote({
    initialContent: undefined,
  });

  // Load and render markdown content
  useEffect(() => {
    if (!editor || !content) return;

    async function loadContent() {
      try {
        // Convert mixed Markdown/HTML to pure HTML
        const htmlContent = await convertMixedContentToHtml(content);

        // Parse HTML to BlockNote blocks
        const blocks = await editor.tryParseHTMLToBlocks(htmlContent);
        editor.replaceBlocks(editor.document, blocks);
      } catch (_error) {
        // Silently fail
      }
    }

    loadContent();
  }, [editor, content]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        {loadingMessage}
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return <BlockNoteView editor={editor} theme="light" editable={false} />;
}
