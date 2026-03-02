"use client";

// import { MarkdownViewer } from "../document-editor/MarkdownViewer";
import dynamic from "next/dynamic";
import { useTranslation } from "./TranslationContext";

const MarkdownViewer = dynamic(
  () =>
    import("../document-editor/shared/MarkdownViewer").then(
      (mod) => mod.MarkdownViewer,
    ),
  { ssr: false },
);

export function SourcePane() {
  const { translation } = useTranslation();

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 border-r">
      <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
          <span className="flex items-center gap-2">
            <span className="fi fi-fr " />
            Contenu Source
          </span>
        </h3>
        <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
          Lecture seule
        </span>
      </div>

      <div className="[&_.bn-editor]:!bg-transparent flex-1 overflow-y-auto p-4 tablet:p-8">
        <MarkdownViewer
          className=""
          content={translation?.sourceMarkdown || ""}
          emptyMessage="Aucun contenu source disponible"
        />
      </div>
    </div>
  );
}
