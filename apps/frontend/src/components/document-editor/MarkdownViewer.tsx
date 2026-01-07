import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { convertMixedContentToHtml } from "@/lib/markdownUtils";

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
