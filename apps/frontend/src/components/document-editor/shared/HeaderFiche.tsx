"use client";

import { cn } from "@playground/ui";
import {
  RiArrowLeftSLine,
  RiEyeLine,
  RiSaveLine,
  RiSendPlaneLine,
} from "@playground/ui/icons";
import {
  Button,
  Conformite,
  SaveIndicator,
  type SaveStatus,
  Tag,
} from "@playground/ui/primitives";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDocumentActions } from "../actions/DocumentActionsContext";
import { usePublicationRealtime } from "../actions/hooks/usePublicationRealtime";
import { useDocument } from "../DocumentContext";
import { useDocumentStatusRealtime } from "./hooks/useDocumentStatusRealtime";

/**
 * HeaderFiche — Barre d'outils principale de l'écran d'édition de document.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1443-5858
 *
 * Layout :
 *   Non conforme : LEFT = retour + tag non-conforme (pas de save/preview/publier)
 *   Conforme :
 *     LEFT  → retour · save indicator · bouton save · tags work/online
 *     CENTER → titre du document (centré absolu, truncate)
 *     RIGHT → prévisualiser · publier
 */
export function HeaderFiche() {
  const { document, setDocument, isDirty } = useDocument();
  const {
    previewDocument,
    saveDocument,
    publishDocument,
    isSaving,
    isPublishing,
  } = useDocumentActions();
  const router = useRouter();

  const { startListening } = usePublicationRealtime({
    workflowId: document?.id,
    onSuccess: (url) => {
      setDocument((prev) =>
        prev ? { ...prev, onlineStatus: "published", publishedUrl: url } : prev,
      );
      router.refresh();
    },
  });

  // Read `from` once on mount to preserve list filters on back navigation
  const [backHref, setBackHref] = useState("/documents");
  useEffect(() => {
    const from = new URLSearchParams(window.location.search).get("from");
    if (from) setBackHref(`/documents?${decodeURIComponent(from)}`);
  }, []);

  // Keep status badges in sync via Supabase Realtime
  useDocumentStatusRealtime();

  const isCompliant = document?.complianceStatus === "compliant";
  const canSave = isDirty && isCompliant;

  const saveStatus: SaveStatus = isSaving
    ? "saving"
    : isDirty
      ? "unsaved"
      : "saved";

  const handleSave = async () => {
    await saveDocument();
  };

  // Raccourci Ctrl/Cmd+S
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (canSave) handleSave();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // biome-ignore lint/correctness/useExhaustiveDependencies: handleSave est stable (pas de deps externes)
  }, [canSave, handleSave]);

  return (
    <div className="relative flex items-center justify-between px-6 py-4 border-b bg-white">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <Link href={backHref}>
          <Button
            variant="quatrieme"
            size="sm"
            leftIcon={RiArrowLeftSLine}
            aria-label="Retour à la liste des documents"
          />
        </Link>

        {isCompliant ? (
          <>
            <div className="flex items-center gap-2">
              <SaveIndicator status={saveStatus} />
              <Button
                variant="quatrieme"
                size="sm"
                leftIcon={RiSaveLine}
                aria-label="Enregistrer"
                onClick={handleSave}
                disabled={isSaving || !canSave}
              />
            </div>

            {/* Tags online — crossfade dans un wrapper de taille fixe */}
            {(document?.onlineStatus === "published" ||
              document?.onlineStatus === "archived") && (
              <span className="relative inline-flex">
                <span
                  className={cn(
                    "transition-all duration-300 ease-in-out",
                    document.onlineStatus === "published"
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none absolute inset-0",
                  )}
                >
                  <Tag
                    status="publie"
                    href={document.publishedUrl ?? undefined}
                  />
                </span>
                <span
                  className={cn(
                    "transition-all duration-300 ease-in-out",
                    document.onlineStatus === "archived"
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none absolute inset-0",
                  )}
                >
                  <Tag status="archive" />
                </span>
              </span>
            )}
          </>
        ) : (
          <Conformite value="non-conforme" />
        )}
      </div>

      {/* CENTER — titre */}
      {document && (
        <span className="absolute left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-700 truncate max-w-md">
          {document.title}
        </span>
      )}

      {/* RIGHT — uniquement si conforme */}
      {isCompliant && (
        <div className="flex items-center gap-4">
          <Button
            variant="tertiaire"
            size="sm"
            rightIcon={RiEyeLine}
            onClick={() => previewDocument()}
          >
            Prévisualiser
          </Button>

          <Button
            variant="primaire"
            size="sm"
            rightIcon={RiSendPlaneLine}
            disabled={isPublishing}
            onClick={async () => {
              const saved = await saveDocument();
              if (!saved.success) return;
              startListening();
              await publishDocument();
            }}
          >
            {isPublishing ? "Publication..." : "Publier"}
          </Button>
        </div>
      )}
    </div>
  );
}
