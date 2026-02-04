"use client";

import { cn } from "@playground/ui";
import { Button } from "@playground/ui/primitives";
import { ArrowLeft, Eye, Save, Send } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "./TranslationContext";

export function TranslationTopBar() {
  const {
    saveTranslation,
    publishTranslation,
    previewTranslation,
    isSaving,
    isPublishing,
    isDirty,
    translation,
  } = useTranslation();

  const isPublished = translation?.status === "published";
  const _canPublish = !isDirty && !isPublished; // Can publish if saved and not already published (simplification)
  // Or maybe we allow republishing updates?
  // Let's allow republishing updates if saved.
  const canPublishUpdate = !isDirty;

  return (
    <div className="h-14 border-b bg-white flex items-center justify-between px-4 shrink-0 z-30 relative">
      <div className="flex items-center gap-4">
        <Link
          href="/translations"
          className="p-2 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
          title="Retour aux traductions"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-gray-900 truncate max-w-md">
            Traduction
          </h1>
          {translation?.status && (
            <span
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded-full",
                translation.status === "published"
                  ? "bg-green-100 text-green-700"
                  : translation.status === "to_process"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700",
              )}
            >
              {translation.status === "published"
                ? "Publié"
                : translation.status === "to_process"
                  ? "À traiter"
                  : "Brouillon"}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={previewTranslation}
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          Prévisualiser
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => saveTranslation()}
          disabled={isSaving || !isDirty}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </Button>

        <Button
          variant="success"
          size="sm"
          onClick={() => publishTranslation()}
          disabled={isPublishing || !canPublishUpdate}
          className="gap-2"
        >
          <Send className="w-4 h-4" />
          {isPublishing ? "Publication..." : "Publier"}
        </Button>
      </div>
    </div>
  );
}
