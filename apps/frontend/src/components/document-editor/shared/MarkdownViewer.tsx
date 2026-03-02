"use client";

import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { cn } from "@playground/ui/utils";

interface MarkdownViewerProps {
  /** Markdown content to render (can include YAML frontmatter) */
  content: string;
  /** Optional loading message */
  loadingMessage?: string;
  /** Optional empty state message */
  emptyMessage?: string;
  /** Optional className */
  className?: string;
}

/**
 * Reusable component for rendering markdown content with BlockNote.
 * Handles frontmatter stripping and markdown-to-HTML conversion.
 */
export function MarkdownViewer({
  content,
  loadingMessage = "Chargement...",
  emptyMessage = "Aucun contenu disponible",
  className,
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
        // Use the full markdown parser instead of HTML conversion
        // This ensures all content types (paragraphs, lists, etc.) are properly parsed
        const { markdownToBlocks } = await import("@/lib/markdown");
        const blocks = await markdownToBlocks(content);
        editor.replaceBlocks(editor.document, blocks);
      } catch (_error) {
        // Silently fail
      }
    }

    loadContent();
  }, [editor, content]);

  if (!editor) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-full text-gray-500",
          className,
        )}
      >
        {loadingMessage}
      </div>
    );
  }

  if (!content) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-full text-gray-500",
          className,
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <BlockNoteView
      editor={editor}
      className={className}
      theme="light"
      editable={false}
    />
  );
}
