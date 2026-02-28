import { Button, Spinner } from "@playground/ui/primitives";
import { Check, Copy, ExternalLink, X } from "lucide-react";

interface PublishSuccessDialogProps {
  isOpen: boolean;
  isWaiting: boolean;
  publishedUrl: string | null;
  error: string | null;
  hasCopied: boolean;
  onClose: () => void;
  onCopy: () => void;
  onRetry: () => void;
  onOpenLink: () => void;
}

export function PublishSuccessDialog({
  isOpen,
  isWaiting,
  publishedUrl,
  error,
  hasCopied,
  onClose,
  onCopy,
  onRetry,
  onOpenLink,
}: PublishSuccessDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 animate-in fade-in duration-200">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {!isWaiting && (
        <div className="text-sm font-medium text-green-600 text-center">
          Document publié !
        </div>
      )}

      {error ? (
        <div className="flex flex-col items-center gap-2">
          <div className="text-xs text-red-600 text-center">{error}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-7 text-[10px] px-2"
          >
            Réessayer
          </Button>
        </div>
      ) : publishedUrl ? (
        <>
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 bg-gray-50 rounded border px-2 py-1.5 text-xs text-gray-600 truncate">
              {publishedUrl}
            </div>
            <button
              type="button"
              onClick={onCopy}
              className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors border"
              title="Copier le lien"
            >
              {hasCopied ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <Button
            onClick={onOpenLink}
            variant="outline"
            size="sm"
            className="w-full gap-2 h-8 text-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Voir la fiche
          </Button>
        </>
      ) : (
        <div className="text-xs text-gray-500 text-center flex items-center gap-2">
          {isWaiting && <Spinner size="xl" />}
          <span>En cours de publication.</span>
        </div>
      )}
    </div>
  );
}
