"use client";

import React, { useEffect } from "react";
import { BlockNoteEditor } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useDocument } from "./DocumentContext";

/**
 * Strip YAML frontmatter from markdown content
 */
function stripYamlFrontmatter(content: string): string {
  // Match YAML frontmatter pattern: --- at start, content, --- at end
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  return content.replace(frontmatterRegex, "").trim();
}

export function MarkdownEditor() {
  const { document } = useDocument();
  // We need to handle the case where document is null or loading,
  // but for now we assume it's passed or we handle it in the layout.

  // Create editor instance
  const editor = useCreateBlockNote({
    initialContent: undefined, // We'll load content after initialization
  });

  // Load markdown content when document changes
  useEffect(() => {
    if (!editor || !document?.content) return;

    async function loadContent() {
      try {
        // Strip YAML frontmatter before parsing
        const contentWithoutFrontmatter = stripYamlFrontmatter(
          document!.content
        );

        // Parse markdown to BlockNote blocks
        const blocks = await editor.tryParseMarkdownToBlocks(
          contentWithoutFrontmatter
        );
        editor.replaceBlocks(editor.document, blocks);
      } catch (error) {
        console.error("Error parsing markdown:", error);
      }
    }

    loadContent();
  }, [editor, document?.content]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white p-8">
      <div className="max-w-3xl mx-auto">
        <BlockNoteView editor={editor} theme="light" />
      </div>
    </div>
  );
}
