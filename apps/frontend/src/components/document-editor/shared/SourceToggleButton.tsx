"use client";

import { FrArrowLeftSLineDouble } from "@playground/ui/icons";
import { Button } from "@playground/ui/primitives";
import { useCallback } from "react";
import { useDocument } from "../DocumentContext";
import { useContentContext } from "./ContentContext";

/**
 * SourceToggleButton — bouton "Source" flottant dans la zone contenu.
 *
 * Figma : node 1385-11500
 * - position: absolute, top: 48px, right: 24px dans le content row
 * - Monté dans DocumentLayout (pas dans EditionView) → position figée, non affectée par la sidebar
 * - z-index inférieur à la sidebar (z-10 vs z-10 de la sidebar)
 * - Masqué (opacity-0) quand le panneau source est ouvert
 */
export function SourceToggleButton() {
  const { document, setIsSourceOpen } = useDocument();
  const { activatePaddingTransition } = useContentContext();

  const handleOpen = useCallback(() => {
    activatePaddingTransition();
    setIsSourceOpen(true);
  }, [activatePaddingTransition, setIsSourceOpen]);

  if (!document?.ingestionContent) return null;

  return (
    <div className="fixed top-24 right-6 z-0">
      <Button
        variant="quatrieme"
        size="sm"
        leftIcon={FrArrowLeftSLineDouble}
        onClick={handleOpen}
        aria-label="Afficher la source RCO"
        className="bg-[var(--background-contrast-grey)] text-[var(--text-default-grey)] hover:bg-[var(--background-contrast-grey-hover)]"
      >
        Source
      </Button>
    </div>
  );
}
