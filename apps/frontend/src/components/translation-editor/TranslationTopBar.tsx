"use client";

import { extractTitleFromMarkdown } from "@playground/shared-types";
import { IndicationSauvegarde } from "@playground/ui";
import { HeaderFiche } from "@playground/ui/composites";
import {
  RiArrowLeftSLine,
  RiEyeLine,
  RiSendPlaneLine,
} from "@playground/ui/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@playground/ui/overlays";
import { Button, Spinner } from "@playground/ui/primitives";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getUserFriendlyPublicationError } from "@/lib/publication-errors";
import { useTranslation } from "./TranslationContext";
import { TranslationStatus } from "./TranslationStatus";

export function TranslationTopBar() {
  const {
    translation,
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

  const [saveError, setSaveError] = useState(false);
  const [title, setTitle] = useState("Traduction");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const prevPublicationUrl = useRef(publicationUrl);

  useEffect(() => {
    if (translation?.sourceMarkdown) {
      extractTitleFromMarkdown(translation.sourceMarkdown).then((t) => {
        if (t) setTitle(t);
      });
    }
  }, [translation?.sourceMarkdown]);

  // Close popover on successful publication (new URL arrived via Realtime)
  useEffect(() => {
    if (
      publicationUrl &&
      publicationUrl !== prevPublicationUrl.current &&
      popoverOpen
    ) {
      setPopoverOpen(false);
    }
    prevPublicationUrl.current = publicationUrl;
  }, [publicationUrl, popoverOpen]);

  const handleSave = async () => {
    setSaveError(false);
    const result = await saveTranslation();
    if (!result.success) setSaveError(true);
  };

  const handleConfirmPublish = async () => {
    await publishTranslation();
  };

  const handleRetry = async () => {
    await handleConfirmPublish();
  };

  const handlePopoverChange = (open: boolean) => {
    // Prevent closing while publishing
    if (!open && isPublishing) return;
    setPopoverOpen(open);
  };

  const saveStatus = isSaving
    ? "saving"
    : saveError
      ? "error"
      : isDirty
        ? "unsaved"
        : "saved";

  // Determine popover phase from context state
  const showError = popoverOpen && !isPublishing && !!publicationUrlError;
  const showLoading = popoverOpen && isPublishing;

  return (
    <HeaderFiche
      left={
        <>
          <Link href="/translations">
            <Button
              variant="quatrieme"
              size="sm"
              className="px-2"
              aria-label="Retour"
            >
              <RiArrowLeftSLine className="w-4 h-4" />
            </Button>
          </Link>
          <IndicationSauvegarde status={saveStatus} onSave={handleSave} />
          <TranslationStatus />
        </>
      }
      center={<span>{title}</span>}
      right={
        <div className="flex items-center gap-4">
          <Button
            variant="tertiaire"
            size="sm"
            className="gap-2"
            onClick={previewTranslation}
            disabled={!canPreview}
          >
            Prévisualiser
            <RiEyeLine className="w-4 h-4" />
          </Button>

          <Popover open={popoverOpen} onOpenChange={handlePopoverChange}>
            <PopoverTrigger asChild>
              <Button
                variant="primaire"
                size="sm"
                className="gap-2"
                disabled={isPublishing}
                isLoading={isPublishing}
              >
                Publier
                {!isPublishing && <RiSendPlaneLine className="w-4 h-4" />}
              </Button>
            </PopoverTrigger>

            <PopoverContent align="end" sideOffset={8} className="w-[368px]">
              {showLoading ? (
                <div className="flex flex-col items-center gap-2 py-4">
                  <Spinner size="xl" />
                  <div className="text-xs text-gray-600 text-center">
                    En cours de publication...
                  </div>
                </div>
              ) : showError ? (
                <div className="flex flex-col items-center gap-3 w-full animate-in fade-in duration-200">
                  <div className="text-sm font-medium text-red-600 text-center">
                    Erreur lors de la publication
                  </div>
                  <div className="flex items-center gap-1.5 justify-center">
                    <div className="text-xs text-red-500 text-center max-w-[220px]">
                      {getUserFriendlyPublicationError(publicationUrlError!)}
                    </div>
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="tertiaire"
                      size="sm"
                      onClick={handleRetry}
                      disabled={isPublishing}
                      className="flex-1 h-8 text-xs"
                    >
                      Réessayer
                    </Button>
                    <Button
                      variant="tertiaire"
                      size="sm"
                      onClick={() => setPopoverOpen(false)}
                      className="flex-1 h-8 text-xs"
                    >
                      Fermer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-12 animate-in fade-in duration-200">
                  <p className="text-sm text-[var(--text-default-grey,#3a3a3a)] leading-relaxed">
                    Les modifications seront visibles par les usagers. Confirmer
                    la publication ?
                  </p>
                  <div className="flex justify-end gap-4">
                    <Button
                      variant="tertiaire"
                      size="sm"
                      onClick={() => setPopoverOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="primaire"
                      size="sm"
                      className="gap-2"
                      onClick={handleConfirmPublish}
                    >
                      <RiSendPlaneLine className="w-4 h-4" />
                      Publier
                    </Button>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      }
    />
  );
}
