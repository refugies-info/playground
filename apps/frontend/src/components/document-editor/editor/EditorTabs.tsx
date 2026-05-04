import { Eye, FileText } from "lucide-react";
import { useDocument } from "../DocumentContext";

/**
 * Reusable tab bar for the editor with Visual/Raw mode toggle.
 */
export function EditorTabs() {
  const { isRawMarkdownMode, setIsRawMarkdownMode, isProcessing } =
    useDocument();

  return (
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
            ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
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
            ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <FileText className="w-3.5 h-3.5" />
          Raw Markdown
        </button>
      </div>
    </div>
  );
}
