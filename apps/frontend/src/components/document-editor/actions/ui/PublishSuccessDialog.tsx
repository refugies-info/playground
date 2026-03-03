import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@playground/ui";
import { Button, Spinner } from "@playground/ui/primitives";
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  HelpCircle,
  X,
} from "lucide-react";

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

/**
 * Translates a raw system error into a user-friendly French message.
 */
function getUserFriendlyError(error: string): string {
  const lower = error.toLowerCase();
  const errorMappings = [
    {
      keys: ["fetch failed", "network"],
      message:
        "Le serveur de publication est injoignable. Vérifiez votre connexion ou réessayez dans quelques instants.",
    },
    {
      keys: ["webhook secret", "missing webhook"],
      message:
        "La configuration du serveur est incomplète. Contactez l'équipe technique.",
    },
    {
      keys: ["timeout", "timed out"],
      message:
        "Le serveur a mis trop de temps à répondre. Réessayez dans quelques instants.",
    },
    {
      keys: ["401", "unauthorized"],
      message:
        "Authentification refusée par le serveur distant. Contactez l'équipe technique.",
    },
    {
      keys: ["403", "forbidden"],
      message:
        "Accès refusé par le serveur de publication. Contactez l'équipe technique.",
    },
    {
      keys: ["404", "not found"],
      message:
        "Le point d'accès de publication est introuvable. Contactez l'équipe technique.",
    },
    {
      keys: ["invalid payload"],
      message:
        "Les données envoyées au serveur sont invalides. Vérifiez les métadonnées du document.",
    },
    {
      keys: ["500", "internal server"],
      message:
        "Erreur interne du serveur de publication. Réessayez ou contactez l'équipe technique.",
    },
    {
      keys: ["workflow not found"],
      message:
        "Le document n'a pas été trouvé. Rechargez la page et réessayez.",
    },
    {
      keys: ["publication id not received"],
      message:
        "La publication a été envoyée mais aucun identifiant n'a été retourné. Contactez l'équipe technique.",
    },
  ];

  const mapping = errorMappings.find((entry) =>
    entry.keys.some((key) => lower.includes(key)),
  );
  return (
    mapping?.message ||
    "Une erreur inattendue est survenue. Réessayez ou contactez l'équipe technique."
  );
}

export function PublishSuccessDialog({
  isOpen,
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

      {error ? (
        /* ── Error state ── */
        <div className="flex flex-col items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div className="text-sm font-medium text-red-600 text-center">
            Échec de la publication
          </div>
          <div className="flex items-center gap-1.5 justify-center">
            <div className="text-xs text-red-500 text-center max-w-[200px]">
              {getUserFriendlyError(error)}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle
                    className="h-3.5 w-3.5 text-gray-400 cursor-pointer shrink-0"
                    onClick={() => navigator.clipboard.writeText(error)}
                  />
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="center"
                  className="flex flex-col gap-1 max-w-[220px]"
                >
                  <p className="font-bold text-xs">Détails techniques</p>
                  <code className="text-xs font-mono break-all">{error}</code>
                  <p className="text-xs text-gray-400">Cliquez pour copier</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-7 text-[10px] px-3"
            >
              Fermer
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onRetry}
              className="h-7 text-[10px] px-3"
            >
              Réessayer
            </Button>
          </div>
        </div>
      ) : publishedUrl ? (
        /* ── Success state ── */
        <>
          <div className="text-sm font-medium text-green-600 text-center">
            Document publié !
          </div>
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
        /* ── Waiting state ── */
        <div className="flex flex-col items-center gap-2">
          <Spinner size="xl" />
          <div className="text-xs text-gray-500 text-center">
            Publication en cours…
          </div>
        </div>
      )}
    </div>
  );
}
