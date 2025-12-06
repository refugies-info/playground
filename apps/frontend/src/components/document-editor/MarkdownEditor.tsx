"use client";

import type { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useEffect, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { Eye, FileText, Loader2 } from "lucide-react";
import { useDocument } from "./DocumentContext";
import { OriginalContentView } from "./OriginalContentView";
import { RawMarkdownView } from "./RawMarkdownView";

/**
 * Strip YAML frontmatter from markdown content
 */
function stripYamlFrontmatter(content: string): string {
  // Match YAML frontmatter pattern: --- at start, content, --- at end
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  return content.replace(frontmatterRegex, "").trim();
}

export function MarkdownEditor() {
  const {
    document,
    isComparisonMode,
    isProcessing,
    isRawMarkdownMode,
    setIsRawMarkdownMode,
  } = useDocument();
  const [rawMarkdown, setRawMarkdown] = useState("");
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);

  // Initialize editor only on client side
  useEffect(() => {
    const initEditor = async () => {
      const { BlockNoteEditor } = await import("@blocknote/core");
      const newEditor = BlockNoteEditor.create({
        initialContent: undefined,
      });
      setEditor(newEditor);
    };

    initEditor();
  }, []);

  // Load markdown content when document changes
  useEffect(() => {
    if (!editor || !document?.content) return;

    async function loadContent() {
      if (!editor) return;
      try {
        // Strip YAML frontmatter before parsing
        const contentWithoutFrontmatter = stripYamlFrontmatter(
          document?.content ?? "",
        );

        // Parse markdown to BlockNote blocks
        const blocks = await editor.tryParseMarkdownToBlocks(
          contentWithoutFrontmatter,
        );
        editor.replaceBlocks(editor.document, blocks);

        // Also update raw markdown state
        const markdown = await editor.blocksToMarkdownLossy(editor.document);
        setRawMarkdown(markdown);
      } catch (_error) {}
    }

    loadContent();
  }, [editor, document?.content]);

  // Update raw markdown when switching to raw mode
  useEffect(() => {
    if (!editor || !isRawMarkdownMode) return;

    async function updateRawMarkdown() {
      if (!editor) return;
      try {
        const markdown = await editor.blocksToMarkdownLossy(editor.document);
        setRawMarkdown(markdown);
      } catch (_error) {}
    }

    updateRawMarkdown();
  }, [editor, isRawMarkdownMode]);

  // Handle raw markdown content changes
  const handleRawMarkdownChange = async (newMarkdown: string) => {
    setRawMarkdown(newMarkdown);

    // Update the editor blocks when content changes
    if (editor) {
      try {
        const blocks = await editor.tryParseMarkdownToBlocks(newMarkdown);
        editor.replaceBlocks(editor.document, blocks);
      } catch (_error) {}
    }
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading editor...
      </div>
    );
  }

  // Render side-by-side view in comparison mode
  if (isComparisonMode && document?.originalContent) {
    return (
      <div className="flex flex-1 overflow-hidden relative">
        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium text-gray-700">
                L'IA travaille sur votre document...
              </p>
            </div>
          </div>
        )}

        {/* Original content on the left */}
        <OriginalContentView />

        {/* Rewritten content on the right */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="sticky top-0 z-10 bg-white border-b px-8 py-4">
            <h3 className="font-semibold text-sm text-gray-700">
              AI-Rewritten Content
            </h3>
            <p className="text-xs text-gray-500">Editable</p>
          </div>
          <div className="p-8">
            <div className="max-w-3xl mx-auto">
              <BlockNoteView
                editor={editor}
                theme="light"
                editable={!isProcessing}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal single-editor view with tabs
  return (
    <div className="flex-1 overflow-hidden bg-white relative flex flex-col">
      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-gray-700">
              L'IA travaille sur votre document...
            </p>
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <div className="border-b bg-gray-50">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setIsRawMarkdownMode(false)}
            disabled={isProcessing}
            className={`
              flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors
              ${
                !isRawMarkdownMode
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }
              ${
                isProcessing
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }
            `}
          >
            <Eye className="w-3.5 h-3.5" />
            Visual Editor
          </button>
          <button
            type="button"
            onClick={() => setIsRawMarkdownMode(true)}
            disabled={isProcessing}
            className={`
              flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors
              ${
                isRawMarkdownMode
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }
              ${
                isProcessing
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }
            `}
          >
            <FileText className="w-3.5 h-3.5" />
            Raw Markdown
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {isRawMarkdownMode ? (
          <RawMarkdownView
            markdownContent={rawMarkdown}
            onContentChange={handleRawMarkdownChange}
          />
        ) : (
          <div className="p-8">
            <div className="max-w-3xl mx-auto">
              <BlockNoteView
                editor={editor}
                theme="light"
                editable={!isProcessing}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
