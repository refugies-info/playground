"use client";

import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { isRtlLanguage } from "@playground/shared-types";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getLanguageFlag } from "@/lib/document-labels";
import { blocksToDirectiveMarkdown, markdownToBlocks } from "@/lib/markdown";
import {
  type CustomEditor,
  customSchema,
} from "../document-editor/editor/blocks/custom-schema";
import { useTranslation } from "./TranslationContext";

export function TranslationEditorPane() {
  const { translation, updateContent } = useTranslation();
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

  // External updates (e.g. if we had external ways to change content, mostly init here)
  useEffect(() => {
    if (!editor || isUpdating.current) return;

    const currentContent = translation?.translationMarkdown || "";
    if (currentContent === lastSyncedContent.current) return;

    // Logic to update editor content if context changes externally
    // For now mostly useful if we load data asynchronously later or revert changes
    const _updateEditor = async () => {
      isUpdating.current = true;
      try {
        // Basic implementation: replace blocks
        const blocks = await markdownToBlocks(currentContent);
        editor.replaceBlocks(editor.document, blocks);
        lastSyncedContent.current = currentContent;
      } finally {
        isUpdating.current = false;
      }
    };

    // If needed uncomment: updateEditor();
    // Commented out to avoid aggressive overwrites while typing if delays happen
  }, [translation?.translationMarkdown, editor]);

  if (!editor) {
    return (
      <div className="flex flex-1 items-center justify-center h-full bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
          <span className="flex items-center gap-2">
            {translation?.language ? (
              <span
                className={`${getLanguageFlag(translation.language)} shadow-sm`}
              />
            ) : (
              <span className="text-lg">🏳️</span>
            )}
            Traduction
          </span>
        </h3>
        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
          Éditable
        </span>
      </div>

      <div
        className="flex-1 overflow-y-auto p-4 tablet:p-8"
        dir={isRtlLanguage(translation?.language) ? "rtl" : "ltr"}
      >
        <div className="max-w-3xl mx-auto">
          <BlockNoteView
            editor={editor}
            theme="light"
            editable={true} // Always editable for translation
            slashMenu={false} // Disable slash menu for now, or use custom one if needed
          />
        </div>
      </div>
    </div>
  );
}
