import { FrAlertWarningFill } from "@playground/ui/icons";
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
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-4 animate-in fade-in duration-200">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--background-contrast-warning)] text-[var(--text-default-warning)]">
        <FrAlertWarningFill size={24} />
      </div>
      <div className="text-sm font-medium text-gray-900 text-center max-w-sm">
        Cette fiche est en cours de modification
        {editorName ? ` par ${editorName}` : " par un autre utilisateur"}.
      </div>
      <p className="text-xs text-gray-600 text-center max-w-sm">
        Rafraîchissez la page pour vérifier si elle est de nouveau disponible.
      </p>
      <Button
        onClick={onBack}
        variant="secondaire"
        size="sm"
        className="h-8 text-xs"
      >
        Retour
      </Button>
    </div>
  );
}
