"use client";

import { logger } from "@playground/shared-types";
import { Avatar, IndicationSauvegarde } from "@playground/ui";
import {
  HeaderFiche,
  PublishPanel,
  type PublishPanelResult,
} from "@playground/ui/composites";
import {
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiEyeLine,
} from "@playground/ui/icons";
import { Button } from "@playground/ui/primitives";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDocumentActions } from "../actions/DocumentActionsContext";
import { usePublicationRealtime } from "../actions/hooks/usePublicationRealtime";
import { useDocument } from "../DocumentContext";
import { useMetadata } from "../metadata/MetadataContext";
import { DocumentStatus } from "./DocumentStatus";
import { useDocumentStatusRealtime } from "./hooks/useDocumentStatusRealtime";

interface HeaderFicheConnectedProps {
  from?: string;
  userEmail?: string | null;
}

/**
 * HeaderFicheConnected — Câblage métier du composite HeaderFiche.
 *
 * Slot left  : bouton retour + IndicationSauvegarde + DocumentStatus + Avatar
 * Slot center: titre du document
 * Slot right : Prévisualiser + PublishPanel
 *
 * Flow publication :
 *   1. Clic "Publier" → isPublishing=true → bouton en loading
 *   2. Réponse :
 *      - error   → result = { type: 'error' }   → affiche erreur dans la popover
 *      - success → result = { type: 'success' }  → affiche succès (URL immédiate ou via Realtime)
 */
export function HeaderFicheConnected({
  from,
  userEmail,
}: HeaderFicheConnectedProps) {
  const router = useRouter();
  const { document, setDocument, isDirty } = useDocument();
  const { errorFieldKeys } = useMetadata();
  const {
    saveDocument,
    isSaving,
    previewDocument,
    isPreviewing,
    publishDocument,
    isPublishing,
  } = useDocumentActions();

  useDocumentStatusRealtime();

  const [saveError, setSaveError] = useState(false);

  const handleSave = async () => {
    setSaveError(false);
    const result = await saveDocument();
    if (!result.success) setSaveError(true);
  };

  const [publishResult, setPublishResult] = useState<PublishPanelResult | null>(
    null,
  );
  const [hasCopied, setHasCopied] = useState(false);
  const [triggerTranslations, setTriggerTranslations] = useState(true);
  const [isUrgent, setIsUrgent] = useState(false);

  // Realtime — met à jour l'URL dans le result success si elle n'était pas dispo immédiatement
  const { isWaiting, setError, startListening } = usePublicationRealtime({
    workflowId: document?.id,
    onSuccess: (url) => {
      setPublishResult({ type: "success", publishedUrl: url });
      setDocument((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          onlineStatus: "published",
          workStatus: null,
          publishedUrl: url,
        };
      });
      router.refresh();
    },
    onError: (message) => {
      setPublishResult({ type: "error", error: message });
      setError(message);
    },
  });

  const backHref = from
    ? `/documents?${decodeURIComponent(from)}`
    : "/documents";
  const saveStatus = isSaving
    ? "saving"
    : saveError
      ? "error"
      : isDirty
        ? "unsaved"
        : "saved";
  const isCompliant = document?.complianceStatus === "compliant";
  const showSaveIndicator =
    document?.complianceStatus !== "non_compliant" &&
    document?.complianceStatus !== "pending";
  // Loading = workflow en cours d'appel OU en attente du résultat Realtime
  const isLoading = isPublishing || isWaiting;

  const handleConfirmPublish = async () => {
    setPublishResult(null);

    const result = await publishDocument(
      triggerTranslations,
      errorFieldKeys,
      isUrgent,
    );

    if (result.success) {
      // Le workflow a démarré — on attend le résultat via Realtime
      // Ne pas afficher "succès" avant que Realtime confirme
      startListening();
    } else {
      // Le workflow n'a pas pu démarrer (erreur réseau, config, etc.)
      setPublishResult({
        type: "error",
        error: result.error ?? "Échec de la publication",
      });
    }
  };

  const handleCopy = () => {
    const url =
      publishResult?.type === "success" ? publishResult.publishedUrl : null;
    if (!url) return;

    navigator.clipboard
      .writeText(url)
      .then(() => {
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
      })
      .catch((err) => {
        logger.warn({ err }, "Clipboard write failed");
      });
  };

  const handleReset = () => {
    setPublishResult(null);
    setHasCopied(false);
    setIsUrgent(false);
  };
  const handleRetry = () => {
    handleReset();
    handleConfirmPublish();
  };

  return (
    <HeaderFiche
      left={
        <>
          <Link href={backHref}>
            <Button
              variant="quatrieme"
              size="sm"
              className="px-2"
              aria-label="Retour"
            >
              <RiArrowLeftSLine className="w-4 h-4" />
            </Button>
          </Link>
          {showSaveIndicator ? (
            <IndicationSauvegarde status={saveStatus} onSave={handleSave} />
          ) : null}
          <DocumentStatus />
          <Avatar email={userEmail} className="size-6" />
        </>
      }
      center={document?.title ? <span>{document.title}</span> : undefined}
      right={
        <div className="flex items-center gap-4">
          <Button
            variant="tertiaire"
            size="sm"
            className="gap-2"
            onClick={previewDocument}
            isLoading={isPreviewing}
            disabled={!isCompliant || isPreviewing}
          >
            Prévisualiser
            {!isPreviewing && <RiEyeLine className="w-4 h-4" />}
          </Button>

          <PublishPanel
            trigger={
              <Button
                variant="primaire"
                size="sm"
                className="gap-2"
                disabled={!isCompliant || isLoading}
              >
                Publier
                <RiArrowDownSLine className="w-4 h-4" />
              </Button>
            }
            disabled={!isCompliant || isLoading}
            isPublishing={isLoading}
            result={publishResult}
            onReset={handleReset}
            triggerTranslations={triggerTranslations}
            onToggleTranslations={(v) => {
              setTriggerTranslations(v);
              if (!v) setIsUrgent(false);
            }}
            isUrgent={isUrgent}
            onToggleUrgent={setIsUrgent}
            onConfirm={handleConfirmPublish}
            hasCopied={hasCopied}
            onCopy={handleCopy}
            onOpenLink={() => {
              const url =
                publishResult?.type === "success"
                  ? publishResult.publishedUrl
                  : null;
              if (url) window.open(url, "_blank");
            }}
            onRetry={handleRetry}
          />
        </div>
      }
    />
  );
}
