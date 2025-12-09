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
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
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
  const isLoadingContent = useRef(false);

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

  // Sync editor changes back to document context
  useEffect(() => {
    if (!editor || !document) return;

    const handleEditorChange = async () => {
      // Don't sync changes while we're loading content from props
      if (isLoadingContent.current) return;

      try {
        // Convert editor content to markdown
        const markdown = await editor.blocksToMarkdownLossy(editor.document);

        // Update the document content in context
        setDocument({
          ...document,
          content: markdown,
        });
      } catch {
        // Silently fail - don't disrupt editing experience
      }
    };

    // Subscribe to editor changes
    const unsubscribe = editor.onChange(handleEditorChange);

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [editor, document, setDocument]);

  // Load markdown content when document changes
  useEffect(() => {
    if (!editor || !document?.content) return;

    async function loadContent() {
      if (!editor) return;

      // Set flag to prevent onChange from firing during load
      isLoadingContent.current = true;

      try {
        // Convert mixed Markdown/HTML to pure HTML
        const htmlContent = await convertMixedContentToHtml(
          document?.content ?? "",
        );

        // Parse HTML to BlockNote blocks
        const blocks = await editor.tryParseHTMLToBlocks(htmlContent);
        editor.replaceBlocks(editor.document, blocks);

        // Also update raw markdown state
        const markdown = await editor.blocksToMarkdownLossy(editor.document);
        setRawMarkdown(markdown);
      } catch {
        // Silently fail
      } finally {
        // Re-enable onChange after a short delay to ensure load is complete
        setTimeout(() => {
          isLoadingContent.current = false;
        }, 100);
      }
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

    // Update the document context with the new markdown
    if (document) {
      setDocument({
        ...document,
        content: newMarkdown,
      });
    }

    // Update the editor blocks when content changes
    if (editor) {
      isLoadingContent.current = true;
      try {
        const blocks = await editor.tryParseMarkdownToBlocks(newMarkdown);
        editor.replaceBlocks(editor.document, blocks);
      } catch {
        // Silently fail
      } finally {
        setTimeout(() => {
          isLoadingContent.current = false;
        }, 100);
      }
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
