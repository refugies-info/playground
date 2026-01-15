"use client";

import { cn } from "@playground/ui";
import { Button } from "@playground/ui/primitives";
import {
  Archive,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Save,
  Send,
  X,
} from "lucide-react";
import { useState } from "react";
import { useDocument } from "./DocumentContext";

interface DocumentActionsProps {
  isCollapsed?: boolean;
}

export function DocumentActions({ isCollapsed = false }: DocumentActionsProps) {
  const {
    document,
    saveDocument,
    isSaving,
    isDirty,
    canPublish,
    previewDocument,
    publishDocument,
    isPublishing,
    archiveDocument,
    isArchiving,
  } = useDocument();

  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [archiveSuccess, setArchiveSuccess] = useState(false);

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);

    const result = await saveDocument();

    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError(result.error || "Échec de l'enregistrement");
    }
  };

  const handlePreview = () => {
    previewDocument();
  };

  const handlePublish = async () => {
    setPublishError(null);
    setPublishSuccess(false);
    setPublishedUrl(null);

    const result = await publishDocument();

    if (result.success) {
      setPublishSuccess(true);
      if (result.publishedUrl) {
        setPublishedUrl(result.publishedUrl);
      }
      setTimeout(() => setPublishSuccess(false), 3000);
    } else {
      setPublishError(result.error || "Échec de la publication");
    }
  };

  const handleCopy = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const handleArchive = async () => {
    setArchiveError(null);
    setArchiveSuccess(false);

    if (
      !confirm(
        "Êtes-vous sûr de vouloir archiver ce document ? Il ne sera plus visible publiquement.",
      )
    ) {
      return;
    }

    const result = await archiveDocument();

    if (result.success) {
      setArchiveSuccess(true);
      setTimeout(() => setArchiveSuccess(false), 3000);
    } else {
      setArchiveError(result.error || "Échec de l'archivage");
    }
  };

  const isCompliant = document?.status === "compliant";

  // Workflow:
  // - Save: enabled when document is modified (isDirty) AND compliant
  // - Publish: enabled when document is NOT modified (saved) AND compliant AND NOT already published/synced
  const canSave = isDirty && isCompliant;
  const canPublishNow =
    !isDirty && isCompliant && document?.state !== "published";

  return (
    <div className="flex flex-col gap-2 p-4 border-t bg-white relative">
      {/* Status messages */}
      {(saveSuccess ||
        saveError ||
        publishSuccess ||
        publishError ||
        archiveSuccess ||
        archiveError) && (
        <div className="text-xs text-center mb-1">
          {saveSuccess && <span className="text-green-600">Enregistré ✓</span>}
          {saveError && <span className="text-red-600">{saveError}</span>}
          {publishSuccess && <span className="text-green-600">Publié ✓</span>}
          {publishError && <span className="text-red-600">{publishError}</span>}
          {archiveSuccess && <span className="text-green-600">Archivé ✓</span>}
          {archiveError && <span className="text-red-600">{archiveError}</span>}
        </div>
      )}

      {/* Preview Button */}
      <Button
        variant="outline"
        size="sm"
        className={cn("gap-2", isCollapsed && "justify-center px-0")}
        onClick={handlePreview}
      >
        <Eye className="w-4 h-4" />
        {!isCollapsed && "Prévisualiser"}
      </Button>

      {/* Save Button - enabled when modified */}
      <Button
        variant="primary"
        size="sm"
        className={cn("gap-2", isCollapsed && "justify-center px-0")}
        onClick={handleSave}
        disabled={isSaving || !canSave}
      >
        <Save className="w-4 h-4" />
        {!isCollapsed && (isSaving ? "Enregistrement..." : "Enregistrer")}
      </Button>

      {/* Publish Button - enabled after save */}
      <Button
        variant="success"
        size="sm"
        className={cn("gap-2", isCollapsed && "justify-center px-0")}
        onClick={handlePublish}
        disabled={isPublishing || !canPublishNow}
      >
        <Send className="w-4 h-4" />
        {!isCollapsed && (isPublishing ? "Publication..." : "Publier")}
      </Button>

      {/* Archive Button - visible only for published/modified docs */}
      {(document?.state === "published" || document?.state === "modified") && (
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700",
            isCollapsed && "justify-center px-0",
          )}
          onClick={handleArchive}
          disabled={isArchiving}
        >
          <Archive className="w-4 h-4" />
          {!isCollapsed && (isArchiving ? "Archivage..." : "Archiver")}
        </Button>
      )}

      {/* Local Overlay */}
      {publishedUrl && (
        <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => setPublishedUrl(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="text-sm font-medium text-green-600 text-center">
            Document publié !
          </div>
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 bg-gray-50 rounded border px-2 py-1.5 text-xs text-gray-600 truncate">
              {publishedUrl}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors border"
              title="Copier le lien"
            >
              {hasCopied ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <Button
            onClick={() => window.open(publishedUrl, "_blank")}
            variant="outline"
            size="sm"
            className="w-full gap-2 h-8 text-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Voir la fiche
          </Button>
        </div>
      )}
    </div>
  );
}
