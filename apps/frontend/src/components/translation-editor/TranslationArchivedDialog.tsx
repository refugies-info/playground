"use client";

import { RiCloseLine, RiLogoutBoxLine } from "@playground/ui/icons";
import {
  Dialog,
  DialogAction,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@playground/ui/overlays";
import { Button } from "@playground/ui/primitives";
import { useRouter } from "next/navigation";
import { useTranslation } from "./TranslationContext";

/**
 * Pop-up affichée quand l'équipe éditoriale a archivé la fiche.
 * La fiche reste consultable mais n'est plus éditable.
 */
export function TranslationArchivedDialog() {
  const { archivedModalOpen, closeArchivedModal } = useTranslation();
  const router = useRouter();

  return (
    <Dialog
      open={archivedModalOpen}
      onOpenChange={(open) => {
        if (!open) closeArchivedModal();
      }}
    >
      <DialogContent
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogAction>
          <Button
            variant="quatrieme"
            size="sm"
            className="text-[var(--text-action-high-blue-france)] "
            onClick={closeArchivedModal}
          >
            <span>Fermer</span>
            <RiCloseLine className="h-4 w-4" />
          </Button>
        </DialogAction>
        <DialogTitle>Cette fiche a été archivée</DialogTitle>
        <DialogDescription>
          L'équipe éditoriale a archivé cette fiche. Vous ne pouvez plus
          l'éditer.
        </DialogDescription>
        <DialogAction className="pt-8 pb-4 pr-4 pl-4">
          <Button
            onClick={() => router.push("/translations")}
            variant="primaire"
            size="md"
            rightIcon={RiLogoutBoxLine}
          >
            Quitter et choisir une nouvelle fiche
          </Button>
        </DialogAction>
      </DialogContent>
    </Dialog>
  );
}
