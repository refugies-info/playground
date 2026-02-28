"use client";

import { AlertCircle } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useDocument } from "../DocumentContext";

interface RawMarkdownViewProps {
  markdownContent: string;
  onContentChange: (content: string) => void;
  readOnly?: boolean;
}

export function RawMarkdownView({
  markdownContent,
  onContentChange,
  readOnly = false,
}: RawMarkdownViewProps) {
  const { isProcessing } = useDocument();
  const [localContent, setLocalContent] = useState(markdownContent);
  const [prevMarkdownContent, setPrevMarkdownContent] =
    useState(markdownContent);
  const [showWarning, setShowWarning] = useState(true);

  // If props change from outside (e.g. AI suggestion or rollback), update local state
  if (markdownContent !== prevMarkdownContent) {
    setLocalContent(markdownContent);
    setPrevMarkdownContent(markdownContent);
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    onContentChange(newContent);
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="max-w-3xl mx-auto flex-1 flex flex-col">
        {/* Warning banner */}
        {showWarning && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-amber-900 font-medium mb-1">
                Mode Markdown Brut
              </p>
              <p className="text-xs text-amber-800">
                Lorsque vous revenez à l'éditeur visuel, BlockNote analysera à
                nouveau le contenu. Certaines syntaxes markdown non prises en
                charge peuvent être modifiées ou perdues.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowWarning(false)}
              className="text-amber-600 hover:text-amber-800 text-xs font-medium"
            >
              Masquer
            </button>
          </div>
        )}

        {/* Textarea */}
        <textarea
          value={localContent}
          onChange={handleChange}
          disabled={isProcessing || readOnly}
          className="flex-1 w-full p-4 border border-gray-300 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
          placeholder="Entrez votre contenu markdown ici..."
          spellCheck={false}
        />
      </div>
    </div>
  );
}
