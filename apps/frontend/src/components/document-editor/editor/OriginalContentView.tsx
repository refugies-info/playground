import { Button } from "@playground/ui/primitives";
import { Undo2 } from "lucide-react";
import { useDocument } from "../DocumentContext";
import { MarkdownViewer } from "../shared/MarkdownViewer";

export function OriginalContentView() {
  const { document, rollbackToOriginal, isRawMarkdownMode } = useDocument();

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 border-r relative">
      {/* Header with rollback button */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b px-8 py-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-gray-700">
            Contenu original
          </h3>
          <p className="text-xs text-gray-500">Vue en lecture seule</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={rollbackToOriginal}
          className="flex items-center gap-2"
        >
          <Undo2 className="w-4 h-4" />
          Restaurer le contenu original
        </Button>
      </div>

      {/* Read-only content */}
      <div className="p-8 h-full flex flex-col">
        <div className="max-w-3xl mx-auto flex-1 flex flex-col w-full">
          {isRawMarkdownMode ? (
            <textarea
              value={document?.ingestionContent ?? ""}
              readOnly
              className="flex-1 w-full p-4 border border-gray-300 font-mono text-sm leading-relaxed resize-none focus:outline-none bg-gray-50 text-gray-600"
              spellCheck={false}
            />
          ) : (
            <MarkdownViewer
              content={document?.ingestionContent ?? ""}
              loadingMessage="Chargement du contenu original..."
              emptyMessage="Aucun contenu original disponible"
            />
          )}
        </div>
      </div>
    </div>
  );
}
