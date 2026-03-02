import { Button } from "@playground/ui/primitives";
import { Send, X } from "lucide-react";

interface PublishConfirmationDialogProps {
  isOpen: boolean;
  triggerTranslations: boolean;
  onToggleTranslations: (value: boolean) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function PublishConfirmationDialog({
  isOpen,
  triggerTranslations,
  onToggleTranslations,
  onConfirm,
  onClose,
}: PublishConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-4 animate-in fade-in duration-200">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="text-sm font-medium text-gray-900 text-center">
        Confirmer la publication
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="triggerTranslations"
          checked={triggerTranslations}
          onChange={(e) => onToggleTranslations(e.target.checked)}
          className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
        />
        <label
          htmlFor="triggerTranslations"
          className="text-xs text-gray-600 select-none cursor-pointer"
        >
          Déclencher les traductions
        </label>
      </div>

      <Button
        onClick={onConfirm}
        variant="success"
        size="sm"
        className="w-full gap-2 h-8 text-xs"
      >
        <Send className="w-3.5 h-3.5" />
        Publier
      </Button>
    </div>
  );
}
