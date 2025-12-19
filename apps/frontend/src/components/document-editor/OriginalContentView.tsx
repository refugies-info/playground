import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { Button } from "@playground/ui/primitives";
import matter from "gray-matter";
import { Undo2 } from "lucide-react";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { useDocument } from "./DocumentContext";

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
 * Same pipeline as MarkdownEditor for consistent rendering.
 */
async function convertMixedContentToHtml(content: string): Promise<string> {
  if (!content) return "";

  // Strip YAML frontmatter
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

export function OriginalContentView() {
  const { document, rollbackToOriginal } = useDocument();

  // Create read-only editor instance
  const editor = useCreateBlockNote({
    initialContent: undefined,
  });

  // Load original content
  useEffect(() => {
    if (!editor || !document?.ingestionContent) return;

    async function loadContent() {
      try {
        // Convert mixed Markdown/HTML to pure HTML (same as MarkdownEditor)
        const htmlContent = await convertMixedContentToHtml(
          document?.ingestionContent ?? "",
        );

        // Parse HTML to BlockNote blocks
        const blocks = await editor.tryParseHTMLToBlocks(htmlContent);
        editor.replaceBlocks(editor.document, blocks);
      } catch (_error) {}
    }

    loadContent();
  }, [editor, document?.ingestionContent]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading original content...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 border-r relative">
      {/* Header with rollback button */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b px-8 py-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-gray-700">
            Contenu original
          </h3>
          <p className="text-xs text-gray-500">Vue en lecture seule</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={rollbackToOriginal}
          className="flex items-center gap-2"
        >
          <Undo2 className="w-4 h-4" />
          Restaurer le contenu original
        </Button>
      </div>

      {/* Read-only editor */}
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <BlockNoteView editor={editor} theme="light" editable={false} />
        </div>
      </div>
    </div>
  );
}
