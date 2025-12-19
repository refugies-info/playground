"use client";

import type { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useEffect, useRef, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import matter from "gray-matter";
import { Eye, FileText, Loader2 } from "lucide-react";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { AiSuggestionBanner } from "./AiSuggestionBanner";
import { useDocument } from "./DocumentContext";
import { OriginalContentView } from "./OriginalContentView";
import { RawMarkdownView } from "./RawMarkdownView";

/**
 * Custom sanitization schema that allows common HTML tags
 * while still blocking dangerous elements like <script> and event handlers
 */
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    // Allow common HTML tags that might be in your content
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
async function convertMixedContentToHtml(content: string): Promise<string> {
  if (!content) return "";

  // Strip YAML frontmatter
  const { content: contentWithoutFrontmatter } = matter(content);

  // Convert Markdown to HTML using unified pipeline
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm) // 👈 Add support for GitHub Flavored Markdown (tables, strikethrough, etc.)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw) // 👈 Parse raw HTML nodes into proper HTML AST
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(contentWithoutFrontmatter);

  return String(result);
}

export function MarkdownEditor() {
  const {
    document,
    setDocument,
    isComparisonMode,
    isProcessing,
    isRawMarkdownMode,
    setIsRawMarkdownMode,
  } = useDocument();
  const [rawMarkdown, setRawMarkdown] = useState("");
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
  // We use this to track updates that came from the editor itself,
  // so we don't reload them and cause an infinite loop due to serialization differences.
  const lastSyncedContent = useRef<string | null>(null);

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
              Contenu modifié
            </h3>
            <p className="text-xs text-gray-500">Editable</p>
          </div>
          <div className="p-8">
            <div className="max-w-3xl mx-auto">
              <BlockNoteView
                editor={editor}
                theme="light"
                editable={!isProcessing && !document?.aiSuggestion}
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

      {/* AI Suggestion Banner */}
      <AiSuggestionBanner />

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
                editable={!isProcessing && !document?.aiSuggestion}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
