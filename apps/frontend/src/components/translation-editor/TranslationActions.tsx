"use client";

import {
  cn,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@playground/ui";
import { Button, Spinner } from "@playground/ui/primitives";
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  HelpCircle,
  Save,
  Send,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getUserFriendlyPublicationError } from "@/lib/publication-errors";
import { useTranslation } from "./TranslationContext";

interface TranslationActionsProps {
  isCollapsed?: boolean;
}

export function TranslationActions({
  isCollapsed = false,
}: TranslationActionsProps) {
  const {
    saveTranslation,
    publishTranslation,
    previewTranslation,
    isSaving,
    isPublishing,
    isDirty,
    canPreview,
    publicationUrl,
    publicationUrlError,
  } = useTranslation();

  const [showPublishSuccessOverlay, setShowPublishSuccessOverlay] =
    useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handlePublish = async () => {
    setShowPublishSuccessOverlay(true);
    const result = await publishTranslation();

    if (!isMounted.current) return;

    if (!result.success) {
      // If publishTranslation itself fails (before workflow starts), close overlay
      setShowPublishSuccessOverlay(false);
    }
    // Otherwise Realtime will update publicationUrl or publicationUrlError
    // when the workflow creates publication_records (INSERT event)
  };

  const handleRetry = async () => {
    await handlePublish();
  };

  const handleCopy = () => {
    if (publicationUrl) {
      navigator.clipboard.writeText(publicationUrl);
      setHasCopied(true);
      setTimeout(() => {
        if (isMounted.current) {
          setHasCopied(false);
        }
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 border-t bg-white relative">
      {/* Status messages */}
      {(isSaving || isPublishing) && !showPublishSuccessOverlay && (
        <div className="text-xs text-center mb-1">
          {isSaving && <span className="text-blue-600">Enregistrement...</span>}
          {isPublishing && (
            <span className="text-blue-600">Publication...</span>
          )}
        </div>
      )}

      {/* Preview Button - disabled if source not published */}
      <Button
        variant="tertiaire"
        size="sm"
        className={cn("gap-2", isCollapsed && "justify-center px-0")}
        onClick={previewTranslation}
        disabled={!canPreview}
        title="Prévisualiser la traduction"
      >
        <Eye className="w-4 h-4" />
        {!isCollapsed && "Prévisualiser"}
      </Button>

      {/* Save Button - enabled when modified */}
      <Button
        variant="primaire"
        size="sm"
        className={cn("gap-2", isCollapsed && "justify-center px-0")}
        onClick={() => saveTranslation()}
        disabled={isSaving || !isDirty}
      >
        <Save className="w-4 h-4" />
        {!isCollapsed && (isSaving ? "Enregistrement..." : "Enregistrer")}
      </Button>

      {/* Publish Button - always available except when publishing (auto-saves before publishing) */}
      <Button
        variant="primaire"
        size="sm"
        onClick={handlePublish}
        disabled={isPublishing}
        className={cn(
          "bg-green-600 hover:bg-green-700 gap-2",
          isCollapsed && "justify-center px-0",
        )}
      >
        <Send className="w-4 h-4" />
        {!isCollapsed && (isPublishing ? "Publication..." : "Publier")}
      </Button>

      {/* Publication Success Overlay */}
      {showPublishSuccessOverlay && (
        <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => setShowPublishSuccessOverlay(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {isPublishing ? (
            // État 1: En cours de publication
            <div className="flex flex-col items-center gap-2">
              <Spinner size="xl" />
              <div className="text-xs text-gray-600 text-center">
                En cours de publication...
              </div>
            </div>
          ) : publicationUrlError ? (
            // État 2: Erreur
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="text-sm font-medium text-red-600 text-center">
                Erreur lors de la publication
              </div>
              <div className="flex items-center gap-1.5 justify-center">
                <div className="text-xs text-red-500 text-center max-w-[220px]">
                  {getUserFriendlyPublicationError(publicationUrlError)}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="h-3.5 w-3.5 text-gray-400 cursor-pointer shrink-0"
                        onClick={() =>
                          navigator.clipboard.writeText(publicationUrlError)
                        }
                      />
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align="center"
                      className="flex flex-col gap-1 max-w-[220px]"
                    >
                      <p className="font-bold text-xs">Détails techniques</p>
                      <code className="text-xs font-mono break-all">
                        {publicationUrlError}
                      </code>
                      <p className="text-xs text-gray-400">
                        Cliquez pour copier
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex gap-2 w-full">
                <Button
                  variant="tertiaire"
                  size="sm"
                  onClick={handleRetry}
                  className="flex-1 h-8 text-xs"
                  disabled={isPublishing}
                >
                  Réessayer
                </Button>
                <Button
                  variant="tertiaire"
                  size="sm"
                  onClick={() => setShowPublishSuccessOverlay(false)}
                  className="flex-1 h-8 text-xs"
                >
                  Fermer
                </Button>
              </div>
            </div>
          ) : publicationUrl ? (
            // État 3: Succès avec lien
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="text-sm font-medium text-green-600 text-center">
                Traduction publiée !
              </div>
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 bg-gray-50 rounded border px-2 py-1.5 text-xs text-gray-600 truncate">
                  {publicationUrl}
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
              <div className="flex gap-2 w-full">
                <Button
                  onClick={() => window.open(publicationUrl, "_blank")}
                  variant="tertiaire"
                  size="sm"
                  className="flex-1 gap-2 h-8 text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Voir la fiche
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
