import { RiCheckLine, RiCloseLine } from "@playground/ui/icons";
import {
  Dialog,
  DialogAction,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@playground/ui/overlays";
import { Button } from "@playground/ui/primitives";

interface EditLockDialogProps {
  isOpen: boolean;
  editorName?: string | null;
  onBack: () => void;
}

export function EditLockDialog({
  isOpen,
  editorName,
  onBack,
}: EditLockDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onBack();
      }}
    >
      <DialogContent
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogClose asChild>
          <Button
            variant="quatrieme"
            size="sm"
            className="absolute right-4 top-4 text-[var(--text-action-high-blue-france)]"
          >
            <span>Fermer</span>
            <RiCloseLine className="h-4 w-4" />
          </Button>
        </DialogClose>
        <DialogTitle>Cette fiche est déjà en cours d'édition</DialogTitle>
        <DialogDescription>
          {editorName ? ` ${editorName}` : " Un autre utilisateur"} modifie
          cette fiche actuellement, vous n'en avez pas le contrôle. Cliquez sur
          Reprendre pour récupérer la main.
        </DialogDescription>
        <DialogDescription>
          Attention, cela annulera les modifications de{" "}
          {editorName ? ` ${editorName}` : " l'autre utilisateur"}.
        </DialogDescription>
        <DialogAction>
          <Button
            onClick={onBack}
            variant="secondaire"
            size="sm"
            className="h-8 text-xs"
            rightIcon={RiCloseLine}
          >
            Quitter
          </Button>
          <Button
            onClick={onBack}
            variant="primaire"
            size="sm"
            rightIcon={RiCheckLine}
            className="h-8 text-xs"
          >
            Reprendre
          </Button>
        </DialogAction>
      </DialogContent>
    </Dialog>
  );
}
