"use client";

import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { SuggestionMenuController } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { isRtlLanguage } from "@playground/shared-types";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getLanguageFlag, getLanguageName } from "@/lib/document-labels";
import { blocksToDirectiveMarkdown, markdownToBlocks } from "@/lib/markdown";
import {
  type CustomEditor,
  customSchema,
} from "../document-editor/editor/blocks/custom-schema";
import { getCustomSlashMenuItems } from "../document-editor/editor/slash-menu-config";
import { useTranslation } from "./TranslationContext";

export function TranslationEditorPane() {
  const { translation, updateContent, isRawMarkdownMode } = useTranslation();
  const [editor, setEditor] = useState<CustomEditor | null>(null);

  // To avoid circular updates
  const isUpdating = useRef(false);
  const lastSyncedContent = useRef<string | null>(null);

  // Initialize editor
  useEffect(() => {
    if (editor) return;

    const initEditor = async () => {
      const initialContent = translation?.translationMarkdown || "";
      const initialBlocks = await markdownToBlocks(initialContent);

      const newEditor = BlockNoteEditor.create({
        schema: customSchema,
        initialContent:
          initialBlocks.length > 0
            ? initialBlocks
            : [{ type: "paragraph", content: [] }],
      }) as unknown as CustomEditor;

      lastSyncedContent.current = blocksToDirectiveMarkdown(
        // biome-ignore lint/suspicious/noExplicitAny: library type mismatch
        initialBlocks as any,
      );
      setEditor(newEditor);
    };

    initEditor();
  }, [editor, translation?.translationMarkdown]);

  // Sync changes from editor to context
  useEffect(() => {
    if (!editor) return;

    const handleEditorChange = () => {
      if (isUpdating.current) return;

      // biome-ignore lint/suspicious/noExplicitAny: library type mismatch
      const markdown = blocksToDirectiveMarkdown(editor.document as any);
      // Only update if actually changed
      if (markdown !== lastSyncedContent.current) {
        lastSyncedContent.current = markdown;
        updateContent(markdown);
      }
    };

    const unsubscribe = editor.onChange(handleEditorChange);
    return unsubscribe;
  }, [editor, updateContent]);

  // Sync raw markdown edits back into the BlockNote editor when switching to visual mode
  useEffect(() => {
    if (!editor || isUpdating.current) return;
    if (isRawMarkdownMode) return;

    const currentContent = translation?.translationMarkdown || "";
    if (currentContent === lastSyncedContent.current) return;

    const updateEditor = async () => {
      isUpdating.current = true;
      try {
        const blocks = await markdownToBlocks(currentContent);
        editor.replaceBlocks(editor.document, blocks);
        lastSyncedContent.current = currentContent;
      } finally {
        isUpdating.current = false;
      }
    };

    updateEditor();
  }, [translation?.translationMarkdown, editor, isRawMarkdownMode]);

  if (!editor) {
    return (
      <div className="flex flex-1 items-center justify-center h-full bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full bg-white relative">
      <div className="p-10 pb-4 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
          <span className="flex items-center gap-2">
            {translation?.language ? (
              <span
                className={`${getLanguageFlag(translation.language)} shadow-sm`}
              />
            ) : (
              <span className="text-lg">🏳️</span>
            )}
            Traduction en{" "}
            {translation?.language
              ? getLanguageName(translation.language)
              : "langue inconnue"}
          </span>
        </h3>
      </div>

      <div
        className="flex-1 overflow-y-auto p-10 tablet:p-8"
        dir={isRtlLanguage(translation?.language) ? "rtl" : "ltr"}
      >
        <div className="max-w-3xl mx-auto">
          {isRawMarkdownMode ? (
            <textarea
              value={translation?.translationMarkdown || ""}
              onChange={(e) => updateContent(e.target.value)}
              className="w-full min-h-[60vh] p-4 font-mono text-sm leading-relaxed resize-none focus:outline-none"
              spellCheck={false}
            />
          ) : (
            <BlockNoteView
              className="[&_.bn-editor]:!px-0"
              editor={editor}
              theme="light"
              editable={true}
              slashMenu={false}
            >
              <SuggestionMenuController
                triggerCharacter={"/"}
                getItems={async (query) =>
                  getCustomSlashMenuItems(editor, query)
                }
              />
            </BlockNoteView>
          )}
        </div>
      </div>
    </div>
  );
}
