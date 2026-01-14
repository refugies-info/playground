"use client";

import { cn } from "@playground/ui";
import { Button } from "@playground/ui/primitives";
import { Archive, Eye, Save, Send } from "lucide-react";
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

    const result = await publishDocument();

    if (result.success) {
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 3000);
    } else {
      setPublishError(result.error || "Échec de la publication");
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
    <div className="flex flex-col gap-2 p-4 border-t bg-white">
      {/* Status messages */}
      {(saveSuccess || saveError || publishSuccess || publishError) && (
        <div className="text-xs text-center mb-1">
          {saveSuccess && <span className="text-green-600">Enregistré ✓</span>}
          {saveError && <span className="text-red-600">{saveError}</span>}
          {publishSuccess && <span className="text-green-600">Publié ✓</span>}
          {publishError && <span className="text-red-600">{publishError}</span>}
          {archiveSuccess && <span className="text-red-600">Archivé ✓</span>}
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
    </div>
  );
}
