"use client";

import { logger } from "@playground/shared-types";
import { cn } from "@playground/ui";
import { Button, Spinner } from "@playground/ui/primitives";
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

async function fetchPublishedUrl(workflowId: string): Promise<{
  success: boolean;
  publishedUrl?: string;
  error?: string;
}> {
  const response = await fetch(`/api/publication/${workflowId}`);
  if (!response.ok) {
    return { success: false, error: "Failed to fetch publication status" };
  }
  return response.json();
}

interface DocumentActionsProps {
  isCollapsed?: boolean;
}

export function DocumentActions({ isCollapsed = false }: DocumentActionsProps) {
  const {
    document,
    saveDocument,
    isSaving,
    isDirty,
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
  const [showPublishSuccessOverlay, setShowPublishSuccessOverlay] =
    useState(false);
  const [publishOverlayError, setPublishOverlayError] = useState<string | null>(
    null,
  );
  const [isWaitingForLink, setIsWaitingForLink] = useState(false);

  const startPollingForLink = async (workflowId: string) => {
    let attempts = 0;
    const maxAttempts = 15;

    setIsWaitingForLink(true);
    setPublishOverlayError(null);

    while (attempts < maxAttempts) {
      if (publishedUrl) break; // Already found (maybe returned immediately)

      attempts++;
      try {
        const result = await fetchPublishedUrl(workflowId);

        if (result.success && result.publishedUrl) {
          setPublishedUrl(result.publishedUrl);
          setIsWaitingForLink(false);
          return;
        }

        if (attempts >= maxAttempts) {
          setPublishOverlayError(
            "Le lien n’est pas encore disponible. Réessaie dans quelques instants.",
          );
          setIsWaitingForLink(false);
          return;
        }

        // Wait 2 seconds before next attempt
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        logger.error(error, "Error polling publication status");
        setPublishOverlayError(
          "Impossible de récupérer le lien de publication.",
        );
        setIsWaitingForLink(false);
        return;
      }
    }
  };

  // Publication Overlay State
  const [showPublishOverlay, setShowPublishOverlay] = useState(false);
  const [triggerTranslations, setTriggerTranslations] = useState(true);

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

  const handlePublishClick = () => {
    setShowPublishOverlay(true);
  };

  const handleConfirmPublish = async () => {
    setShowPublishOverlay(false);
    setPublishError(null);
    setPublishSuccess(false);
    setPublishedUrl(null);
    setPublishOverlayError(null);

    const result = await publishDocument(triggerTranslations);

    if (result.success) {
      setPublishSuccess(true);
      if (result.publishedUrl) {
        setPublishedUrl(result.publishedUrl);
      }
      setShowPublishSuccessOverlay(true);
      setIsWaitingForLink(!result.publishedUrl);

      // Start polling if we don't have the URL yet
      if (!result.publishedUrl && document?.id) {
        startPollingForLink(document.id);
      }

      setTimeout(() => setPublishSuccess(false), 3000);
    } else {
      setPublishError(result.error || "Échec de la publication");
      setPublishOverlayError(result.error || "Échec de la publication");
      setShowPublishSuccessOverlay(true);
      setIsWaitingForLink(false);
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

  const isCompliant = document?.complianceStatus === "compliant";

  // Workflow:
  // - Save: enabled when document is modified (isDirty) AND compliant
  // - Publish: enabled when document is saved (not dirty) AND compliant AND in draft
  const canSave = isDirty && isCompliant;
  const canPublishNow =
    !isDirty &&
    isCompliant &&
    (document?.workStatus === "draft" ||
      document?.workStatus === "to_process" ||
      document?.onlineStatus === "archived");

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

      {/* View Published - shows if onlineStatus is published */}
      {document?.onlineStatus === "published" && (
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 border-blue-200 hover:bg-blue-50 gap-2"
          onClick={() => window.open(document.publishedUrl, "_blank")}
        >
          <ExternalLink className="w-4 h-4" />
          Voir la fiche
        </Button>
      )}

      {/* Publish Button - shows if not published */}
      {document?.onlineStatus !== "published" && (
        <Button
          variant="success"
          size="sm"
          onClick={handlePublishClick} // Changed from handlePublish to handlePublishClick to match existing logic
          disabled={isPublishing || !canPublishNow} // Changed from !canPublish to !canPublishNow to match existing logic
          className="bg-green-600 hover:bg-green-700"
        >
          {isPublishing ? "Publication..." : "Publier"}
        </Button>
      )}

      {/* Archive - shows if not archived */}
      {document?.onlineStatus !== "archived" && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleArchive}
          disabled={isArchiving}
          className={cn(
            "gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700",
            isCollapsed && "justify-center px-0",
          )}
        >
          <Archive className="w-4 h-4" />
          {!isCollapsed && (isArchiving ? "Archivage..." : "Archiver")}
        </Button>
      )}

      {/* Local Overlay */}
      {showPublishSuccessOverlay && (
        <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => setShowPublishSuccessOverlay(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="text-sm font-medium text-green-600 text-center">
            Document publié !
          </div>
          {publishOverlayError ? (
            <div className="text-xs text-red-600 text-center">
              {publishOverlayError}
            </div>
          ) : publishedUrl ? (
            <>
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
            </>
          ) : (
            <div className="text-xs text-gray-500 text-center flex items-center gap-2">
              {isWaitingForLink && <Spinner size="xl" />}
              <span>En cours de publication.</span>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Overlay */}
      {showPublishOverlay && (
        <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-4 animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => setShowPublishOverlay(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="text-sm font-medium text-gray-900 text-center">
            Confirmer la publication
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="triggerTranslations"
              checked={triggerTranslations}
              onChange={(e) => setTriggerTranslations(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <label
              htmlFor="triggerTranslations"
              className="text-xs text-gray-600 select-none cursor-pointer"
            >
              Déclencher les traductions
            </label>
          </div>

          <Button
            onClick={handleConfirmPublish}
            variant="success"
            size="sm"
            className="w-full gap-2 h-8 text-xs"
          >
            <Send className="w-3.5 h-3.5" />
            Publier
          </Button>
        </div>
      )}
    </div>
  );
}
