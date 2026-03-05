import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@playground/ui";
import { Button } from "@playground/ui/primitives";
import { Info, Send, X } from "lucide-react";

interface PublishConfirmationDialogProps {
  isOpen: boolean;
  triggerTranslations: boolean;
  onToggleTranslations: (value: boolean) => void;
  /** Metadata keys with validation errors */
  errorFieldKeys: string[];
  onConfirm: () => void;
  onClose: () => void;
}

export function PublishConfirmationDialog({
  isOpen,
  triggerTranslations,
  onToggleTranslations,
  errorFieldKeys,
  onConfirm,
  onClose,
}: PublishConfirmationDialogProps) {
  if (!isOpen) return null;

  const hasErrors = errorFieldKeys.length > 0;

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

      {/* Metadata errors warning */}
      {hasErrors && (
        <div className="w-full rounded-md bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800">
          <div className="flex items-start gap-2">
            <span>
              Certaines métadonnées sont en erreur et seront ignorées lors de la
              publication.
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-amber-600 cursor-pointer shrink-0" />
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="center"
                  className="flex flex-col gap-1 max-w-[240px]"
                >
                  <p className="font-bold text-xs">Clés ignorées</p>
                  <ul className="list-disc list-inside text-xs space-y-0.5">
                    {errorFieldKeys.map((key) => (
                      <li key={key}>{key}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

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
