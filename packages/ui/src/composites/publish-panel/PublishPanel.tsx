"use client";

import * as React from "react";
import {
  RiCheckLine,
  RiClipboardLine,
  RiErrorWarningLine,
  RiSendPlaneLine,
} from "../../icons";

// ---------------------------------------------------------------------------
// Icônes statiques hoistées — évite la recréation à chaque render
// ---------------------------------------------------------------------------

const ICON_SEND = <RiSendPlaneLine className="w-4 h-4" />;
const ICON_ERROR = (
  <RiErrorWarningLine className="w-4 h-4 text-[var(--text-default-error,#ce0500)]" />
);
const ICON_CHECK = <RiCheckLine className="w-3.5 h-3.5" />;
const ICON_CLIPBOARD = <RiClipboardLine className="w-3.5 h-3.5" />;

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../overlays/popover";
import { Button } from "../../primitives/button/Button";
import { Switch } from "../../primitives/switch/Switch";
import { cn } from "../../utils";

/**
 * PublishPanel — Popover de confirmation + résultat de publication.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1824-25605
 *
 * 3 phases avec transition animée (fade + slide) :
 *   confirmation → description + checkbox + Annuler/Publier
 *   success      → "La fiche a bien été publiée" + URL copiable + Voir la fiche
 *   error        → message d'erreur + Fermer/Réessayer
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PublishPanelResult =
  | { type: "success"; publishedUrl: string }
  | { type: "error"; error: string };

export interface PublishPanelProps {
  trigger: React.ReactNode;
  disabled?: boolean;
  /** Ouvre la popover par défaut — utile pour Storybook */
  defaultOpen?: boolean;
  isPublishing?: boolean;
  result?: PublishPanelResult | null;
  onReset?: () => void;
  triggerTranslations: boolean;
  onToggleTranslations: (value: boolean) => void;
  /** Marquer les traductions comme urgentes (visible quand triggerTranslations=true) */
  isUrgent?: boolean;
  onToggleUrgent?: (value: boolean) => void;
  onConfirm: () => void;
  hasCopied?: boolean;
  onCopy?: () => void;
  onOpenLink?: () => void;
  onRetry?: () => void;
  align?: "start" | "center" | "end";
  className?: string;
}

// ---------------------------------------------------------------------------
// Phase : Confirmation
// ---------------------------------------------------------------------------

function ConfirmationContent({
  isPublishing,
  triggerTranslations,
  onToggleTranslations,
  isUrgent = false,
  onToggleUrgent = () => {},
  onConfirm,
  onClose,
}: Pick<
  PublishPanelProps,
  | "isPublishing"
  | "triggerTranslations"
  | "onToggleTranslations"
  | "isUrgent"
  | "onToggleUrgent"
  | "onConfirm"
> & { onClose?: () => void }) {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <p className="text-sm text-[var(--text-default-grey,#3a3a3a)] leading-relaxed">
          Les modifications seront visibles par les usagers. Souhaites-tu les
          faire traduire également ?
        </p>

        {/*
         * Row : checkbox "Lancer les traductions" (gauche)
         *        + interrupteur "Urgent" (droite, visible si triggerTranslations)
         * Figma : layout_JTWQMG — row, justify-between, padding: 8px 0
         */}
        <div className="flex items-center justify-between py-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={triggerTranslations}
              onChange={(e) => onToggleTranslations(e.target.checked)}
              className={cn(
                "w-4 h-4 rounded cursor-pointer",
                "border border-[var(--border-action-high-blue-france,#000091)]",
                "text-[var(--background-action-high-blue-france,#000091)]",
                "focus:ring-[var(--border-action-high-blue-france,#000091)]",
              )}
            />
            <span className="text-base text-[var(--text-label-grey,#161616)]">
              Lancer les traductions
            </span>
          </label>

          {/*
           * Interrupteur "Urgent" — slide-in depuis la droite quand triggerTranslations=true.
           *
           * Toujours dans le DOM (pas de unmount) pour que la transition CSS fonctionne.
           * max-width 0→160px + opacity 0→1 : effet slide horizontal depuis la droite.
           * overflow-hidden : clippe le contenu pendant l'animation.
           * whitespace-nowrap : empêche le texte de wrapper pendant le slide.
           * pointer-events-none quand caché : évite les clics accidentels.
           */}
          <div
            className={cn(
              "flex items-center gap-3",
              "transition-opacity duration-100",
              triggerTranslations
                ? "opacity-100"
                : "opacity-0 pointer-events-none",
            )}
          >
            <span className="text-base text-[var(--text-label-grey,#161616)]">
              Urgent
            </span>
            <Switch
              checked={isUrgent}
              onChange={onToggleUrgent}
              disabled={!triggerTranslations}
              aria-label="Marquer les traductions comme urgentes"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          variant="tertiaire"
          size="sm"
          disabled={isPublishing}
          onClick={onClose}
        >
          Annuler
        </Button>
        <Button
          variant="primaire"
          size="sm"
          onClick={onConfirm}
          disabled={isPublishing}
          isLoading={isPublishing}
          className="gap-2"
        >
          {!isPublishing ? ICON_SEND : null}
          {isPublishing ? "Publication..." : "Publier"}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phase : Succès
// ---------------------------------------------------------------------------

function SuccessContent({
  publishedUrl,
  hasCopied,
  onCopy,
  onOpenLink,
  onClose,
}: {
  publishedUrl: string;
  hasCopied?: boolean;
  onCopy?: () => void;
  onOpenLink?: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <span className="text-sm font-medium text-[var(--text-label-grey,#161616)]">
          La fiche a bien été publiée
        </span>

        <div className="flex w-full items-center gap-1 rounded border border-[var(--border-default-grey,#DDDDDD)] bg-[var(--background-alt-grey,#f6f6f6)] px-3 py-2 overflow-hidden">
          <span className="text-xs text-[var(--text-mention-grey,#666666)] truncate flex-1">
            {publishedUrl}
          </span>
          <button
            type="button"
            onClick={onCopy}
            className="shrink-0 p-1 text-[var(--text-action-high-blue-france,#000091)] hover:opacity-75 transition-opacity"
            title="Copier"
          >
            {hasCopied ? ICON_CHECK : ICON_CLIPBOARD}
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="tertiaire" size="sm" onClick={onClose}>
          Fermer
        </Button>
        <Button variant="primaire" size="sm" onClick={onOpenLink}>
          Voir la fiche
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phase : Erreur
// ---------------------------------------------------------------------------

function ErrorContent({
  error,
  onRetry,
  onClose,
}: {
  error: string;
  onRetry?: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--background-contrast-error,#ffe9e9)] flex items-center justify-center shrink-0">
            {ICON_ERROR}
          </div>
          <p className="text-sm font-medium text-[var(--text-label-grey,#161616)]">
            Échec de la publication
          </p>
        </div>
        <p className="text-sm text-[var(--text-default-error,#ce0500)] leading-relaxed">
          {error}
        </p>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="tertiaire" size="sm" onClick={onClose}>
          Fermer
        </Button>
        {onRetry ? (
          <Button
            variant="primaire"
            size="sm"
            className="gap-2"
            onClick={onRetry}
          >
            {ICON_SEND}
            Réessayer
          </Button>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PublishPanelContent — contenu seul, sans Popover (utile pour Storybook)
// ---------------------------------------------------------------------------

export type PublishPanelContentProps = Omit<
  PublishPanelProps,
  "trigger" | "disabled" | "align" | "className"
> & {
  onClose?: () => void;
};

export function PublishPanelContent({
  isPublishing = false,
  result,
  onReset,
  triggerTranslations,
  onToggleTranslations,
  isUrgent = false,
  onToggleUrgent = () => {},
  onConfirm,
  hasCopied,
  onCopy,
  onOpenLink,
  onRetry,
  onClose,
}: PublishPanelContentProps) {
  return (
    <div
      key={result?.type ?? "confirmation"}
      className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200"
    >
      {result?.type === "success" ? (
        <SuccessContent
          publishedUrl={result.publishedUrl}
          hasCopied={hasCopied}
          onCopy={onCopy}
          onOpenLink={onOpenLink}
          onClose={() => {
            onReset?.();
            onClose?.();
          }}
        />
      ) : result?.type === "error" ? (
        <ErrorContent
          error={result.error}
          onRetry={() => {
            onReset?.();
            onRetry?.();
          }}
          onClose={() => {
            onReset?.();
            onClose?.();
          }}
        />
      ) : (
        <ConfirmationContent
          isPublishing={isPublishing}
          triggerTranslations={triggerTranslations}
          onToggleTranslations={onToggleTranslations}
          isUrgent={isUrgent}
          onToggleUrgent={onToggleUrgent}
          onConfirm={onConfirm}
          onClose={onClose}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component principal
// ---------------------------------------------------------------------------

export function PublishPanel({
  trigger,
  disabled = false,
  defaultOpen,
  isPublishing = false,
  result,
  onReset,
  triggerTranslations,
  onToggleTranslations,
  isUrgent = false,
  onToggleUrgent = () => {},
  onConfirm,
  hasCopied,
  onCopy,
  onOpenLink,
  onRetry,
  align = "end",
  className,
}: PublishPanelProps) {
  const [open, setOpen] = React.useState(defaultOpen ?? false);

  const handleClose = () => {
    onReset?.();
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) onReset?.();
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild disabled={disabled}>
        {trigger}
      </PopoverTrigger>

      <PopoverContent
        align={align}
        sideOffset={8}
        className={cn("w-[368px]", className)}
      >
        <PublishPanelContent
          isPublishing={isPublishing}
          result={result}
          onReset={onReset}
          onClose={handleClose}
          triggerTranslations={triggerTranslations}
          onToggleTranslations={onToggleTranslations}
          isUrgent={isUrgent}
          onToggleUrgent={onToggleUrgent}
          onConfirm={onConfirm}
          hasCopied={hasCopied}
          onCopy={onCopy}
          onOpenLink={onOpenLink}
          onRetry={onRetry}
        />
      </PopoverContent>
    </Popover>
  );
}
