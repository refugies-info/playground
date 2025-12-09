"use client";

import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { Button } from "@playground/ui/primitives";
import { Undo2 } from "lucide-react";
import { useDocument } from "./DocumentContext";

/**
 * Strip YAML frontmatter from markdown content
 */
function stripYamlFrontmatter(content: string): string {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  return content.replace(frontmatterRegex, "").trim();
}

export function OriginalContentView() {
  const { document, rollbackToOriginal } = useDocument();

  // Create read-only editor instance
  const editor = useCreateBlockNote({
    initialContent: undefined,
  });

  // Load original content
  useEffect(() => {
    if (!editor || !document?.originalContent) return;

    async function loadContent() {
      try {
        const contentWithoutFrontmatter = stripYamlFrontmatter(
          document?.originalContent ?? "",
        );

        const blocks = await editor.tryParseMarkdownToBlocks(
          contentWithoutFrontmatter,
        );
        editor.replaceBlocks(editor.document, blocks);
      } catch (_error) {}
    }

    loadContent();
  }, [editor, document?.originalContent]);

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
            Original Content
          </h3>
          <p className="text-xs text-gray-500">Read-only view</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={rollbackToOriginal}
          className="flex items-center gap-2"
        >
          <Undo2 className="w-4 h-4" />
          Restore Original
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
