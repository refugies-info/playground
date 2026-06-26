import { RiCheckLine, RiCloseLine } from "@playground/ui/icons";
import {
  Dialog,
  DialogAction,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@playground/ui/overlays";
import { Button } from "@playground/ui/primitives";

interface EditLockDialogProps {
  isOpen: boolean;
  editorName?: string | null;
  onBack: () => void;
  onTakeOver: () => void;
}

export function EditLockDialog({
  isOpen,
  editorName,
  onBack,
  onTakeOver,
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
        <DialogAction>
          <Button
            variant="quatrieme"
            size="sm"
            className="text-[var(--text-action-high-blue-france)] "
            onClick={onBack}
          >
            <span>Fermer</span>
            <RiCloseLine className="h-4 w-4" />
          </Button>
        </DialogAction>
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
        <DialogAction className="pt-8 pb-4 pr-4 pl-4">
          <Button
            onClick={onBack}
            variant="secondaire"
            size="md"
            rightIcon={RiCloseLine}
          >
            Quitter
          </Button>
          <Button
            onClick={onTakeOver}
            variant="primaire"
            size="md"
            rightIcon={RiCheckLine}
          >
            Reprendre
          </Button>
        </DialogAction>
      </DialogContent>
    </Dialog>
  );
}
