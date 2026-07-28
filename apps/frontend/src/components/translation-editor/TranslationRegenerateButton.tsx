"use client";

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@playground/ui/overlays";
import { Button, PapaIA } from "@playground/ui/primitives";
import { RiCheckLine, RiCloseLine } from "@remixicon/react";
import { useState } from "react";
import { useTranslation } from "./TranslationContext";

/**
 * TranslationRegenerateButton — Bouton flottant PapaIA de regénération IA
 * d'une traduction, avec pop-up de confirmation.
 *
 * ## Cycle
 * ```
 * repos (translator)  ──clic──▶  pop-up confirm
 *                                   ├─ Annuler → ferme, rien
 *                                   └─ Générer → regenerate() → loading
 * loading             ──clic──▶  cancelRegenerate()
 *                     (hover = croix rouge, cf. PapaIA)
 * fin (realtime)      ──────────▶ nouveau markdown, retour repos
 * ```
 *
 * L'état loading est piloté par `isRegenerating` (= work_status "pending"),
 * donc résilient au refresh : la reprise est automatique.
 */
export function TranslationRegenerateButton() {
  const {
    translation,
    isRegenerating,
    regenerate,
    cancelRegenerate,
    isArchived,
  } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!translation) return null;

  const handleButtonClick = () => {
    if (isRegenerating) {
      cancelRegenerate();
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    void regenerate();
  };

  return (
    <div className="fixed bottom-6 right-6 z-20">
      <Popover
        open={confirmOpen}
        onOpenChange={(open) => setConfirmOpen(open && !isRegenerating)}
      >
        <PopoverAnchor asChild>
          <PapaIA
            variant={isRegenerating ? "loading" : "translator"}
            onClick={handleButtonClick}
            disabled={isArchived}
          />
        </PopoverAnchor>

        <PopoverContent
          side="top"
          align="end"
          className="w-80 p-6"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <p className="text-sm text-[var(--text-default-grey)] mb-2 leading-6">
            Êtes-vous sûr de vouloir générer une nouvelle traduction pour cette
            fiche&nbsp;?
          </p>
          <p className="text-sm text-[var(--text-default-grey)] mb-7 leading-6">
            Cette action écrasera la traduction actuelle.
          </p>
          <div className="flex gap-4 justify-end">
            <Button
              variant="tertiaire"
              size="sm"
              rightIcon={RiCloseLine}
              onClick={() => setConfirmOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primaire"
              size="sm"
              rightIcon={RiCheckLine}
              onClick={handleConfirm}
            >
              Générer
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
