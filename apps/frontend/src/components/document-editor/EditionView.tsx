"use client";

import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { SuggestionMenuController } from "@blocknote/react";
import { useEffect, useRef, useState } from "react";
import { getCustomSlashMenuItems } from "./slash-menu-config";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { logger } from "@playground/shared-types";
import { Loader2 } from "lucide-react";
import { blocksToDirectiveMarkdown, markdownToBlocks } from "@/lib/markdown";
import { AiSuggestionBanner } from "./AiSuggestionBanner"; // Keeping existing import
import { type CustomEditor, customSchema } from "./blocks/custom-schema";
import { useDocument } from "./DocumentContext";
import { EditorTabs } from "./EditorTabs";
import { OriginalContentView } from "./OriginalContentView";
import { RawMarkdownView } from "./RawMarkdownView";

export function EditionView() {
  const {
    document,
    updateContent,
    isComparisonMode,
    isProcessing,
    isRawMarkdownMode,
    setDebugBlocks,
    showDebug,
  } = useDocument();
  const [rawMarkdown, setRawMarkdown] = useState("");
  const [editor, setEditor] = useState<CustomEditor | null>(null);

  // We use this to track updates that came from the editor itself,
  // so we don't reload them and cause an infinite loop due to serialization differences.
  const lastSyncedContent = useRef<string | null>(null);

  // We use this to prevent sync loops and errors during programmatic updates
  const isUpdating = useRef(false);
  const editorJustInitialized = useRef(false);

  // Check if document is compliant (editable)
  const isCompliant = document?.status === "compliant";

  // Initialize (or re-initialize) editor when needed
  // We destroy the editor when in Raw Mode to ensure a fresh state when switching back.
  // Delayed content hydration state
  const [isEditorReady, setIsEditorReady] = useState(false);
  // biome-ignore lint/suspicious/noExplicitAny: BlockNote content type
  const pendingInitialContent = useRef<any[] | null>(null);

  // Initialize (or re-initialize) editor when needed
  // We destroy the editor when in Raw Mode to ensure a fresh state when switching back.
  // 1. Lifecycle Effect: Editor Initialization & Destruction
  useEffect(() => {
    // SWITCHING TO RAW MODE:
    // We must capture the current state and destroy the visual editor.
    if (isRawMarkdownMode) {
      if (editor) {
        // Snapshot current state to ensure Raw View has the latest data
        // Now that imports are static, we can do this synchronously and safely.
        try {
          const currentBlocks = editor.document;
          // biome-ignore lint/suspicious/noExplicitAny: BlockNote content type
          const markdown = blocksToDirectiveMarkdown(currentBlocks as any);
          setRawMarkdown(markdown);
          lastSyncedContent.current = markdown;
        } catch (e) {
          logger.error(e, "Error snapshotting editor state:");
        }

        setEditor(null);
        setIsEditorReady(false);
      }
      return;
    }

    // NORMAL MODE:
    // If editor already exists, we don't need to re-init
    if (editor) {
      return;
    }

    let isMounted = true;

    const initEditor = async () => {
      try {
        if (!isMounted) return;

        // 1. Prepare initial content
        // We use the current editorialContent from context (which might have been updated by Raw Mode)
        const initialMarkdown = document?.editorialContent || "";
        const initialBlocks = await markdownToBlocks(initialMarkdown);

        if (!isMounted) return;

        // 2. Store content for later hydration
        pendingInitialContent.current = initialBlocks;

        // 3. Create Editor with INITIAL EMPTY content
        // initializing with complex custom NodeViews directly can cause "Cannot find node position" errors.
        const newEditor = BlockNoteEditor.create({
          schema: customSchema,
          initialContent: [{ type: "paragraph", content: [] }],
        });

        // 4. Prime the sync ref
        const standardizedMarkdown = blocksToDirectiveMarkdown(
          // biome-ignore lint/suspicious/noExplicitAny: BlockNote types compatibility
          initialBlocks as any,
        );
        lastSyncedContent.current = standardizedMarkdown;
        editorJustInitialized.current = true;

        // 5. Set editor (triggers mount)
        setEditor(newEditor as unknown as CustomEditor);
        // Do NOT set isEditorReady yet - wait for hydration (Effect 2)

        // Also ensure raw markdown state is sync
        setRawMarkdown(standardizedMarkdown);
      } catch (error) {
        logger.error(error, "Error initializing editor:");
      }
    };

    initEditor();

    return () => {
      isMounted = false;
    };
  }, [isRawMarkdownMode, document?.editorialContent, editor]); // Dependencies allow re-run when leaving raw mode

  // 2. Hydration Effect: Fills editor after mount
  useEffect(() => {
    if (!editor || isEditorReady || !pendingInitialContent.current) return;

    if (editorJustInitialized.current) {
      isUpdating.current = true;
      // Delay hydration by one animation frame to ensure React components are stable
      requestAnimationFrame(() => {
        try {
          if (!editor || !pendingInitialContent.current) return;
          editor.replaceBlocks(editor.document, pendingInitialContent.current);
          setIsEditorReady(true);
          pendingInitialContent.current = null;
        } catch (e) {
          logger.error(e, "Error hydrating content:");
        } finally {
          setTimeout(() => {
            isUpdating.current = false;
            editorJustInitialized.current = false;
          }, 0);
        }
      });
    }
  }, [editor, isEditorReady]);

  // Handle Comparison Mode Switch: Force Re-initialization
  // biome-ignore lint/correctness/useExhaustiveDependencies: Trigger reset on mode change
  useEffect(() => {
    if (editor) {
      // Force reset to safety pattern (Init Empty -> Hydrate)
      // This prevents "Cannot find node position" when moving Editor to new part of DOM
      setEditor(null);
      setIsEditorReady(false);
    }
  }, [isComparisonMode]);

  // 3. Sync Effect: Pushes changes to global context
  useEffect(() => {
    if (!editor || document?.aiSuggestion) return;

    const handleEditorChange = () => {
      if (isUpdating.current) return;

      try {
        // biome-ignore lint/suspicious/noExplicitAny: BlockNote types compatibility
        const markdown = blocksToDirectiveMarkdown(editor.document as any);
        lastSyncedContent.current = markdown;
        updateContent(markdown);

        // Push to debug context for real-time sync ONLY in development and when panel is open
        if (process.env.NODE_ENV === "development" && showDebug) {
          setDebugBlocks([...editor.document]);
        }
      } catch (error) {
        logger.error(
          error,
          "Error syncing editor changes to document context:",
        );
      }
    };

    const unsubscribe = editor.onChange(handleEditorChange);
    return unsubscribe;
  }, [
    editor,
    updateContent,
    document?.aiSuggestion,
    showDebug,
    setDebugBlocks,
  ]);

  // 3.5 Initial Debug Sync: Population of debug state when panel opens (DEV ONLY)
  useEffect(() => {
    if (editor && showDebug && process.env.NODE_ENV === "development") {
      setDebugBlocks([...editor.document]);
    }
  }, [editor, showDebug, setDebugBlocks]);

  // 4. External Update Effect: Handles AI suggestions or Raw Mode changes
  useEffect(() => {
    if (!editor || isRawMarkdownMode) return;

    if (!isEditorReady || editorJustInitialized.current) {
      return;
    }

    const contentToShow = document?.aiSuggestion || document?.editorialContent;
    if (!contentToShow) return;

    if (
      lastSyncedContent.current &&
      contentToShow === lastSyncedContent.current
    ) {
      return;
    }

    async function updateEditorContent() {
      if (!editor) return;

      isUpdating.current = true;
      try {
        const blocks = await markdownToBlocks(contentToShow ?? "");
        // biome-ignore lint/suspicious/noExplicitAny: BlockNote types compatibility
        const futureMarkdown = blocksToDirectiveMarkdown(blocks as any);
        lastSyncedContent.current = futureMarkdown;

        editor.replaceBlocks(editor.document, blocks);
        setRawMarkdown(futureMarkdown);
      } catch (error) {
        logger.error(
          error,
          "Error updating editor content from external source:",
        );
      } finally {
        // We wait for the next animation frame to ensure BlockNote has finished
        // internal processing and state updates. This prevents the immediately-following
        // state change from triggering a sync loop (the lock is released after this wait).
        await new Promise((resolve) =>
          requestAnimationFrame(() => resolve(undefined)),
        );
        isUpdating.current = false;
      }
    }

    updateEditorContent();
  }, [
    editor,
    isEditorReady,
    document?.editorialContent,
    document?.aiSuggestion,
    isRawMarkdownMode,
  ]);

  // Handle raw markdown content changes
  const handleRawMarkdownChange = async (newMarkdown: string) => {
    setRawMarkdown(newMarkdown);

    // Update the document context with the new markdown (marks as dirty)
    updateContent(newMarkdown);
  };

  if ((!editor || !isEditorReady) && !isRawMarkdownMode) {
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
            {isRawMarkdownMode ? (
              <RawMarkdownView
                markdownContent={rawMarkdown}
                onContentChange={handleRawMarkdownChange}
                readOnly={!isCompliant}
              />
            ) : (
              <div className="p-8">
                <div className="max-w-3xl mx-auto">
                  {editor ? (
                    <BlockNoteView
                      editor={editor}
                      theme="light"
                      editable={
                        isCompliant && !isProcessing && !document?.aiSuggestion
                      }
                      slashMenu={false}
                    >
                      <SuggestionMenuController
                        triggerCharacter={"/"}
                        getItems={async (query) =>
                          getCustomSlashMenuItems(editor, query)
                        }
                      />
                    </BlockNoteView>
                  ) : (
                    <div />
                  )}
                </div>
              </div>
            )}
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
            markdownContent={rawMarkdown || document?.editorialContent || ""}
            onContentChange={handleRawMarkdownChange}
            readOnly={!isCompliant}
          />
        ) : (
          <div className="p-8">
            <div className="max-w-3xl mx-auto">
              {editor ? (
                <BlockNoteView
                  editor={editor}
                  theme="light"
                  editable={
                    isCompliant && !isProcessing && !document?.aiSuggestion
                  }
                  slashMenu={false}
                >
                  <SuggestionMenuController
                    triggerCharacter={"/"}
                    getItems={async (query) =>
                      getCustomSlashMenuItems(editor, query)
                    }
                  />
                </BlockNoteView>
              ) : (
                <div />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
