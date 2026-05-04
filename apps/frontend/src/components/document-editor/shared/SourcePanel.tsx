"use client";

import {
  FrArrowRightSLineDouble,
  RiArrowGoBackLine,
  RiExternalLinkLine,
} from "@playground/ui/icons";
import { Button } from "@playground/ui/primitives";
import dynamic from "next/dynamic";
import { useCallback, useEffect } from "react";
import { useSidebar } from "@/contexts/SidebarContext";
import { useDocument } from "../DocumentContext";

// MarkdownViewer accède à `window` via BlockNote → SSR impossible
const MarkdownViewer = dynamic(
  () => import("./MarkdownViewer").then((m) => m.MarkdownViewer),
  { ssr: false },
);

/**
 * SourcePanel — panneau de comparaison avec le contenu source RCO.
 *
 * Figma : node 1419-5739
 * - Fond blanc, border-left + border-top #DDDDDD, shadow -1px 0 6px rgba(0,0,18,.06)
 * - border-radius: 16px 0 0 0 (coin supérieur gauche uniquement)
 * - Header : padding 8px, space-between
 *   - Gauche : bouton fermer (FrArrowRightSLineDouble, Taille=L icon-only, Noir=off)
 *   - Droite : Restaurer + RCO (Taille=S, Noir=on, border #DDDDDD, icône à droite)
 * - Contenu : padding 8px 40px 40px, scroll indépendant
 */
export function SourcePanel() {
  const { document, isSourceOpen, setIsSourceOpen, rollbackToOriginal } =
    useDocument();
  const { setIsCollapsed: setSidebarCollapsed } = useSidebar();

  // Auto-collapse de la sidebar globale quand le panneau source s'ouvre
  useEffect(() => {
    if (isSourceOpen) setSidebarCollapsed(true);
  }, [isSourceOpen, setSidebarCollapsed]);

  const lienSource = document?.metadata?.lien_source as string | undefined;

  const handleClose = useCallback(
    () => setIsSourceOpen(false),
    [setIsSourceOpen],
  );

  const handleRco = useCallback(() => {
    if (!lienSource) return;
    window.open(lienSource, "_blank", "noopener,noreferrer");
  }, [lienSource]);

  return (
    <div
      className={`relative z-10 flex-shrink-0 flex flex-col h-full bg-white rounded-tl-[16px] overflow-hidden transition-[width,border-width,box-shadow] duration-500 ease-expo-out ${
        isSourceOpen
          ? "w-1/3 border-l border-t border-border shadow-[-1px_0px_6px_0px_rgba(0,0,18,0.06)] delay-0"
          : "w-0 border-0 shadow-none delay-150"
      }`}
    >
      {/* Opacité décalée : apparaît après l'ouverture du panel, disparaît avant la fermeture */}
      <div
        className={`flex flex-col flex-1 min-h-0 transition-opacity duration-200 ease-expo-out ${isSourceOpen ? "opacity-100 delay-150" : "opacity-0 delay-0"}`}
      >
        <div className="flex items-center justify-between p-2 flex-shrink-0">
          <Button
            variant="quatrieme"
            size="md"
            onClick={handleClose}
            aria-label="Fermer le panneau source"
            className="text-[var(--text-disabled-grey)]"
          >
            <FrArrowRightSLineDouble size={24} aria-hidden />
          </Button>

          {/* Actions droite — Restaurer + RCO (Taille=S, Noir=on, border, icône droite) */}
          <div className="flex items-center gap-2">
            <Button
              variant="quatrieme"
              size="sm"
              onClick={rollbackToOriginal}
              disabled={!document?.ingestionContent}
              rightIcon={RiArrowGoBackLine}
              className="border border-border text-[var(--text-action-high-grey)]"
            >
              Restaurer
            </Button>

            <Button
              variant="quatrieme"
              size="sm"
              onClick={handleRco}
              disabled={!lienSource}
              rightIcon={RiExternalLinkLine}
              className="border border-border text-[var(--text-action-high-grey)]"
            >
              RCO
            </Button>
          </div>
        </div>

        {/* px-10 sur .bn-editor directement — évite l'empilement avec le padding interne de BlockNote */}
        <div className="flex-1 overflow-y-auto pt-2 pb-10">
          <MarkdownViewer
            content={document?.ingestionContent ?? ""}
            loadingMessage="Chargement du contenu source..."
            emptyMessage="Aucun contenu source disponible"
            className="[&_.bn-editor]:!px-10"
          />
        </div>
      </div>{" "}
      {/* fin wrapper opacity */}
    </div>
  );
}
