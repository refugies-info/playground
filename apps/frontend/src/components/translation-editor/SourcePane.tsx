"use client";

import { MarkdownViewer } from "../document-editor/shared/MarkdownViewer";
import { useTranslation } from "./TranslationContext";

export function SourcePane() {
  const { translation } = useTranslation();

  return (
    <div className="w-[35%] shrink-0 flex flex-col h-full border rounded-2xl">
      <div className="sticky top-4 z-10  p-10 pb-4 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
          <span className="flex items-center gap-2">
            <span className="fi fi-fr " />
            Version française
          </span>
        </h3>
      </div>

      <div className="[&_.bn-editor]:!bg-transparent flex-1 overflow-y-auto p-10 pt-0 tablet:p-8">
        <MarkdownViewer
          className="[&_.bn-editor]:!px-0"
          content={translation?.sourceMarkdown || ""}
          emptyMessage="Aucun contenu source disponible"
        />
      </div>
    </div>
  );
}
