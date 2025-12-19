"use client";

import { Check, Sparkles, X } from "lucide-react";
import { useDocument } from "./DocumentContext";

export function AiSuggestionBanner() {
  const { document, acceptAiSuggestion, rejectAiSuggestion } = useDocument();

  if (!document?.aiSuggestion) return null;

  return (
    <div className="border-b bg-blue-50 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <div>
          <p className="text-sm font-medium text-blue-900">
            Suggestion d'IA prête à être analysée
          </p>
          <p className="text-xs text-blue-700">
            Voulez-vous accepter ou annuler la suggestion d'IA ?
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={rejectAiSuggestion}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-white transition-colors"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>
        <button
          type="button"
          onClick={acceptAiSuggestion}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Check className="w-4 h-4" />
          Accepter
        </button>
      </div>
    </div>
  );
}
