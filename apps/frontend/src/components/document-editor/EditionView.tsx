"use client";

import type { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useEffect, useRef, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { Loader2 } from "lucide-react";
import { convertMixedContentToHtml } from "@/lib/markdownUtils";
import { AiSuggestionBanner } from "./AiSuggestionBanner";
import { useDocument } from "./DocumentContext";
import { EditorTabs } from "./EditorTabs";
import { OriginalContentView } from "./OriginalContentView";
import { RawMarkdownView } from "./RawMarkdownView";

export function EditionView() {
  const {
    document,
    setDocument,
    isComparisonMode,
    setIsComparisonMode,
    isProcessing,
    isRawMarkdownMode,
    setIsRawMarkdownMode,
  } = useDocument();
  const [rawMarkdown, setRawMarkdown] = useState("");
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
  // We use this to track updates that came from the editor itself,
  // so we don't reload them and cause an infinite loop due to serialization differences.
  const lastSyncedContent = useRef<string | null>(null);

  // Check if document is compliant (editable)
  const isCompliant = document?.status === "compliant";

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

  // Sync editor changes back to document context (only when not showing AI suggestion)
  useEffect(() => {
    if (!editor || document?.aiSuggestion) return; // Don't sync when showing AI suggestion

    const handleEditorChange = async () => {
      try {
        // Convert editor content to markdown
        const markdown = await editor.blocksToMarkdownLossy(editor.document);

        // Update our ref so we know this content came from the editor
        lastSyncedContent.current = markdown;

        // Update the document content in context
        setDocument((prev) => {
          if (!prev) return null;
          // Prevent loop if content is identical
          if (prev.editorialContent === markdown) return prev;

          return {
            ...prev,
            editorialContent: markdown,
          };
        });
      } catch (error) {
        // Silently fail - don't disrupt editing experience, but log for debugging
        // biome-ignore lint/suspicious/noConsole: debugging
        console.error(
          "Error syncing editor changes to document context:",
          error,
        );
      }
    };

    // Subscribe to editor changes
    const unsubscribe = editor.onChange(handleEditorChange);

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [editor, setDocument, document?.aiSuggestion]);

  // Load markdown content when document changes or AI suggestion arrives
  useEffect(() => {
    if (!editor) return;

    // Show AI suggestion if it exists, otherwise show current content
    const contentToShow = document?.aiSuggestion || document?.editorialContent;
    if (!contentToShow) return;

    async function loadContent() {
      if (!editor) return;

      // Set flag FIRST to prevent onChange from firing during load

      // If the content is exactly what we just synced from the editor, don't re-load it.
      // This breaks the loop where (Markdown -> Blocks -> Markdown) conversion causes differences.
      if (
        lastSyncedContent.current &&
        contentToShow === lastSyncedContent.current
      ) {
        return;
      }

      try {
        // Convert mixed Markdown/HTML to pure HTML
        const htmlContent = await convertMixedContentToHtml(
          contentToShow ?? "",
        );

        // Parse HTML to BlockNote blocks
        const blocks = await editor.tryParseHTMLToBlocks(htmlContent);

        // Get the markdown representation BEFORE we update the editor
        // This way we can set lastSyncedContent to prevent the onChange loop
        const futureMarkdown = await editor.blocksToMarkdownLossy(blocks);

        // Update lastSyncedContent BEFORE replaceBlocks to prevent onChange from triggering
        lastSyncedContent.current = futureMarkdown;

        // Now replace the blocks - onChange will fire but will see content matches lastSyncedContent
        editor.replaceBlocks(editor.document, blocks);

        // Also update raw markdown state
        setRawMarkdown(futureMarkdown);
      } catch (error) {
        // Silently fail - don't disrupt editing experience, but log for debugging
        // biome-ignore lint/suspicious/noConsole: debugging
        console.error("Error loading content into editor:", error);
      } finally {
        // Wait for browser to process the update before releasing lock
        await new Promise((resolve) =>
          requestAnimationFrame(() => resolve(undefined)),
        );
      }
    }

    loadContent();
  }, [editor, document?.editorialContent, document?.aiSuggestion]);

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

    // Update the document context with the new markdown
    if (document) {
      setDocument({
        ...document,
        editorialContent: newMarkdown,
      });
    }

    // Update the editor blocks when content changes
    if (editor) {
      try {
        const blocks = await editor.tryParseMarkdownToBlocks(newMarkdown);
        editor.replaceBlocks(editor.document, blocks);
      } catch (error) {
        // Silently fail - don't disrupt editing experience, but log for debugging
        // biome-ignore lint/suspicious/noConsole: debugging
        console.error("Error updating editor blocks from markdown:", error);
      } finally {
      }
    }
  };

  if (!editor) {
    return (
      <div className="flex flex-1 w-full items-center justify-center h-full bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-gray-700">
            Chargement de l'éditeur...
          </p>
        </div>
      </div>
    );
  }

  // Render side-by-side view in comparison mode
  if (isComparisonMode && document?.ingestionContent) {
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

        {/* AI Suggestion Banner */}
        <AiSuggestionBanner />

        {/* Tab Bar - same as normal mode */}
        <EditorTabs />

        {/* Comparison content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Original content on the left */}
          <OriginalContentView />

          {/* Rewritten content on the right */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="sticky top-0 z-10 bg-white border-b px-8 py-4">
              <h3 className="font-semibold text-sm text-gray-700">
                Contenu modifié
              </h3>
              <p className="text-xs text-gray-500">Editable</p>
            </div>
            <div className="p-8">
              <div className="max-w-3xl mx-auto">
                <BlockNoteView
                  editor={editor}
                  theme="light"
                  editable={
                    isCompliant && !isProcessing && !document?.aiSuggestion
                  }
                />
              </div>
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

      {/* AI Suggestion Banner */}
      <AiSuggestionBanner />

      {/* Tab Bar */}
      <EditorTabs />

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
                editable={
                  isCompliant && !isProcessing && !document?.aiSuggestion
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
