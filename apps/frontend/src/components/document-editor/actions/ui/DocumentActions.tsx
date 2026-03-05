"use client";

import { cn } from "@playground/ui";
import { Button } from "@playground/ui/primitives";
import { Archive, Eye, Save, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDocument } from "../../DocumentContext";
import { useMetadata } from "../../metadata/MetadataContext";
import { useDocumentActions } from "../DocumentActionsContext";
import { usePublicationRealtime } from "../hooks/usePublicationRealtime";
import { PublishConfirmationDialog } from "./PublishConfirmationDialog";
import { PublishSuccessDialog } from "./PublishSuccessDialog";

interface DocumentActionsProps {
  isCollapsed?: boolean;
}

/**
 * UI for document actions (preview/save/publish/archive).
 *
 * Responsibilities:
 * - Drive user interactions and feedback
 * - Show success/error banners
 * - Orchestrate publish confirmation + success overlays
 * - Listen for publication results via Supabase Realtime
 */

export function DocumentActions({ isCollapsed = false }: DocumentActionsProps) {
  const router = useRouter();
  const { document, setDocument, isDirty } = useDocument();
  const { errorFieldKeys } = useMetadata();
  const {
    previewDocument,
    saveDocument,
    isSaving,
    publishDocument,
    isPublishing,
    archiveDocument,
    isArchiving,
  } = useDocumentActions();

  // --- Status banners
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [archiveSuccess, setArchiveSuccess] = useState(false);

  // --- Overlays
  const [showPublishSuccessOverlay, setShowPublishSuccessOverlay] =
    useState(false);

  // Track mounted state to avoid updates on unmounted component
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const {
    isWaiting: isWaitingForLink,
    error: publishOverlayError,
    setError: setPublishOverlayError,
    setIsWaiting: setIsWaitingForLink,
    startListening,
  } = usePublicationRealtime({
    workflowId: document?.id,
    onSuccess: (url) => {
      setPublishedUrl(url);
      // Update global context so TopBar sees the new link immediately
      setDocument((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          onlineStatus: "published",
          workStatus: null, // Clear Draft on success
          publishedUrl: url,
        };
      });
      router.refresh();
    },
    onError: (message) => {
      if (!isMounted.current) return;
      setPublishOverlayError(message);
    },
  });

  // Publication confirmation overlay
  const [showPublishOverlay, setShowPublishOverlay] = useState(false);
  const [triggerTranslations, setTriggerTranslations] = useState(true);
  const hasOverlay = showPublishOverlay || showPublishSuccessOverlay;
  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);

    const result = await saveDocument();

    if (!isMounted.current) return;

    if (result.success) {
      setSaveSuccess(true);
      router.refresh();
      setTimeout(() => isMounted.current && setSaveSuccess(false), 3000);
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

    const result = await publishDocument(triggerTranslations, errorFieldKeys);

    if (!isMounted.current) return;

    if (result.success) {
      setPublishSuccess(true);
      if (result.publishedUrl) {
        setPublishedUrl(result.publishedUrl);
        setDocument((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            onlineStatus: "published",
            workStatus: null, // Clear Draft on success
            publishedUrl: result.publishedUrl,
          };
        });
        router.refresh();
      }
      setShowPublishSuccessOverlay(true);
      setIsWaitingForLink(!result.publishedUrl);

      // Start listening for Realtime publication result if URL not immediately available
      if (!result.publishedUrl) {
        startListening();
      }

      setTimeout(() => isMounted.current && setPublishSuccess(false), 3000);
    } else {
      const errorMessage = result.error || "Échec de la publication";
      setPublishError(errorMessage);
      setPublishOverlayError(errorMessage);
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

    // Only ask for confirmation if the document has been published before
    if (document?.publicationRemoteId) {
      if (
        !confirm(
          "Êtes-vous sûr de vouloir archiver ce document ? Il ne sera plus visible publiquement.",
        )
      ) {
        return;
      }
    }

    const result = await archiveDocument();

    if (!isMounted.current) return;

    if (result.success) {
      setArchiveSuccess(true);
      router.refresh();
      setTimeout(() => isMounted.current && setArchiveSuccess(false), 3000);
    } else {
      setArchiveError(result.error || "Échec de l'archivage");
    }
  };

  const isCompliant = document?.complianceStatus === "compliant";

  // Workflow:
  // - Save: enabled when document is modified (isDirty) AND compliant
  // - Publish: enabled when document is compliant. Unsaved changes are saved automatically.
  const canSave = isDirty && isCompliant;
  const canPublishNow = isCompliant;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-4 border-t bg-white relative",
        hasOverlay && "min-h-[220px]",
      )}
    >
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
          {publishSuccess && !isWaitingForLink && (
            <span className="text-green-600">Publié ✓</span>
          )}
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

      {/* Publish Button - always show if not archived (wait, user wants to republish if archived) */}
      <Button
        variant="success"
        size="sm"
        onClick={handlePublishClick}
        disabled={isPublishing || !canPublishNow}
        className={cn(
          "bg-green-600 hover:bg-green-700 gap-2",
          isCollapsed && "justify-center px-0",
        )}
      >
        <Send className="w-4 h-4" />
        {!isCollapsed && (isPublishing ? "Publication..." : "Publier")}
      </Button>

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

      <PublishSuccessDialog
        isOpen={showPublishSuccessOverlay}
        isWaiting={isWaitingForLink}
        publishedUrl={publishedUrl}
        error={publishOverlayError}
        hasCopied={hasCopied}
        onClose={() => setShowPublishSuccessOverlay(false)}
        onCopy={handleCopy}
        onRetry={() => {
          // Close the error dialog and re-trigger the full publish flow
          setShowPublishSuccessOverlay(false);
          handleConfirmPublish();
        }}
        onOpenLink={() => publishedUrl && window.open(publishedUrl, "_blank")}
      />

      <PublishConfirmationDialog
        isOpen={showPublishOverlay}
        triggerTranslations={triggerTranslations}
        onToggleTranslations={setTriggerTranslations}
        errorFieldKeys={errorFieldKeys}
        onConfirm={handleConfirmPublish}
        onClose={() => setShowPublishOverlay(false)}
      />
    </div>
  );
}
