"use client";

import { Button } from "@playground/ui/primitives";
import { ArrowLeft, GitCompare, Save } from "lucide-react";
import Link from "next/link";
import { useDocument } from "./DocumentContext";

export function EditorToolbar() {
  const { document, isComparisonMode, setIsComparisonMode } = useDocument();
  const hasRewrittenContent = !!document?.rewrittenContent;

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
      <Link
        href="/documents"
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-semibold text-xs">
          retour à la liste des documents
        </span>
      </Link>

      <div className="flex items-center gap-2">
        {/* Comparison Toggle */}
        {hasRewrittenContent && (
          <Button
            variant={isComparisonMode ? "primary" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setIsComparisonMode(!isComparisonMode)}
          >
            <GitCompare className="w-4 h-4" />
            {isComparisonMode ? "Hide Comparison" : "Compare Versions"}
          </Button>
        )}

        {/* Save Button */}
        <Button variant="primary" size="sm" className="gap-2">
          <Save className="w-4 h-4" />
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
