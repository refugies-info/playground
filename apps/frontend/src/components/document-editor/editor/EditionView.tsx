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
import { useDocument } from "../DocumentContext";
import { type CustomEditor, customSchema } from "./blocks/custom-schema";
import { RawMarkdownView } from "./RawMarkdownView";

export function EditionView() {
  const {
    document,
    updateContent,
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

  const isCompliant = document?.complianceStatus === "compliant";
  const [isEditorReady, setIsEditorReady] = useState(false);
  // biome-ignore lint/suspicious/noExplicitAny: BlockNote content type
  const pendingInitialContent = useRef<any[] | null>(null);

  // 1. Lifecycle Effect: Editor Initialization & Destruction
  useEffect(() => {
    // SWITCHING TO RAW MODE: capture state et destruction de l'éditeur visuel
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

    if (editor) {
      return;
    }

    let isMounted = true;

    const initEditor = async () => {
      try {
        if (!isMounted) return;

        const initialMarkdown = document?.editorialContent || "";
        const initialBlocks = await markdownToBlocks(initialMarkdown);

        if (!isMounted) return;

        pendingInitialContent.current = initialBlocks;

        // Initialisation avec contenu vide — évite les erreurs "Cannot find node position"
        // avec les custom NodeViews complexes lors d'une init directe
        const newEditor = BlockNoteEditor.create({
          schema: customSchema,
          initialContent: [{ type: "paragraph", content: [] }],
        });

        const standardizedMarkdown = blocksToDirectiveMarkdown(
          // biome-ignore lint/suspicious/noExplicitAny: BlockNote types compatibility
          initialBlocks as any,
        );
        lastSyncedContent.current = standardizedMarkdown;
        editorJustInitialized.current = true;

        setEditor(newEditor as unknown as CustomEditor);
        // Ne pas mettre isEditorReady ici — attend la hydratation (Effect 2)
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

  // Sync initial debug state quand le panel s'ouvre (DEV uniquement)
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

  const handleRawMarkdownChange = async (newMarkdown: string) => {
    setRawMarkdown(newMarkdown);
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

  return (
    <div className="w-full bg-white">
      <div className="p-10">
        <div className="max-w-[800px] mx-auto w-full">
          {isRawMarkdownMode ? (
            <RawMarkdownView
              markdownContent={rawMarkdown || document?.editorialContent || ""}
              onContentChange={handleRawMarkdownChange}
              readOnly={!isCompliant}
            />
          ) : editor ? (
            <BlockNoteView
              editor={editor}
              theme="light"
              editable={isCompliant && !isProcessing && !document?.aiSuggestion}
              slashMenu={false}
              className="[&_.bn-editor]:!px-0"
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
    </div>
  );
}
