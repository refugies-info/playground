"use client";

import * as React from "react";
import {
  FrRefreshLine2,
  RiAlertFill,
  RiCheckboxCircleFill,
  RiCheckLine,
  RiCloseLine,
  RiExternalLinkLine,
  RiLinksLine,
  RiLoader2Line,
  RiSendPlaneLine,
} from "../../icons";

/**
 * Contenu du bouton primaire pendant la publication : loader (RiLoader2Line)
 * qui tourne + label "Publication". Figma node 3493-23916.
 *
 * On ne passe pas par `isLoading` du Button — celui-ci impose RiLoader4Line.
 */
function PublishingLabel() {
  return (
    <>
      <span className="animate-spin shrink-0">
        <RiLoader2Line className="h-4 w-4" />
      </span>
      Publication
    </>
  );
}

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
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=3493-23848
 *
 * 3 phases avec transition animée (fade + slide) :
 *   confirmation → description + checkbox + Fermer/Publier
 *   success      → badge Succès + copie du lien + Fermer/Consulter
 *   error        → badge Erreur + message + Fermer/Réessayer
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
    <div className="flex flex-col gap-6">
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
        {/* Fermer masqué pendant la publication (Figma node 3493-23916) */}
        {!isPublishing ? (
          <Button
            variant="tertiaire"
            size="sm"
            rightIcon={RiCloseLine}
            onClick={onClose}
          >
            Fermer
          </Button>
        ) : null}
        <Button
          variant="primaire"
          size="sm"
          leftIcon={isPublishing ? undefined : RiSendPlaneLine}
          disabled={isPublishing}
          aria-busy={isPublishing}
          onClick={onConfirm}
        >
          {isPublishing ? <PublishingLabel /> : "Publier"}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phase : Succès
// ---------------------------------------------------------------------------

function SuccessContent({
  hasCopied,
  onCopy,
  onOpenLink,
  onClose,
}: {
  hasCopied?: boolean;
  onCopy?: () => void;
  onOpenLink?: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Badge Succès — Figma tokens : background-contrast-success / text-default-success */}
      <span className="inline-flex w-fit items-center gap-1 rounded-[4px] bg-[var(--background-contrast-success,#b8fec9)] px-2 py-0.5 text-sm font-bold uppercase text-[var(--text-default-success,#18753c)]">
        <RiCheckboxCircleFill className="h-4 w-4" />
        Succès
      </span>

      {/* Message + bouton copier le lien (icône seule, tooltip via title) */}
      <div className="flex w-full items-center justify-between gap-4">
        <p className="text-base leading-6 text-[var(--text-default-grey,#3a3a3a)]">
          Bravo&nbsp;! La fiche a bien été publiée.
        </p>
        <button
          type="button"
          onClick={onCopy}
          title="Copier le lien"
          aria-label="Copier le lien"
          className="flex size-8 shrink-0 items-center justify-center rounded-[4px] border border-[var(--border-default-grey,#DDDDDD)] text-[var(--text-action-high-blue-france,#000091)] transition-colors hover:bg-[var(--background-alt-grey,#f6f6f6)]"
        >
          {hasCopied ? (
            <RiCheckLine className="h-4 w-4" />
          ) : (
            <RiLinksLine className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          variant="tertiaire"
          size="sm"
          rightIcon={RiCloseLine}
          onClick={onClose}
        >
          Fermer
        </Button>
        <Button
          variant="primaire"
          size="sm"
          rightIcon={RiExternalLinkLine}
          onClick={onOpenLink}
        >
          Consulter
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phase : Erreur
// ---------------------------------------------------------------------------

function ErrorContent({
  isPublishing,
  onRetry,
  onClose,
}: {
  isPublishing?: boolean;
  onRetry?: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Badge Erreur — Figma tokens : background-contrast-warning / text-default-warning */}
      <span className="inline-flex w-fit items-center gap-1 rounded-[4px] bg-[var(--background-contrast-warning,#ffe9e6)] px-2 py-0.5 text-sm font-bold uppercase text-[var(--text-default-warning,#b34000)]">
        <RiAlertFill className="h-4 w-4" />
        Erreur
      </span>

      <p className="text-base leading-6 text-[var(--text-default-grey,#3a3a3a)]">
        Attention&nbsp;! La publication de la fiche n’a pas pu aboutir.
      </p>

      <div className="flex justify-end gap-4">
        <Button
          variant="tertiaire"
          size="sm"
          rightIcon={RiCloseLine}
          onClick={onClose}
        >
          Fermer
        </Button>
        {onRetry ? (
          <Button
            variant="primaire"
            size="sm"
            rightIcon={isPublishing ? undefined : FrRefreshLine2}
            disabled={isPublishing}
            aria-busy={isPublishing}
            onClick={onRetry}
          >
            {isPublishing ? <PublishingLabel /> : "Réessayer"}
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
  /*
   * Latch du résultat affiché.
   *
   * Au clic "Réessayer" le parent remet souvent `result` à null (nouvelle
   * tentative) tout en passant `isPublishing=true`. Sans latch on retomberait
   * sur la phase confirmation ("Lancer les traductions"). On conserve donc la
   * dernière vue tant qu'une publication est en cours ; on ne revient à la
   * confirmation que sur un vrai reset (result null ET pas de publication).
   */
  const [displayResult, setDisplayResult] =
    React.useState<PublishPanelResult | null>(result ?? null);

  React.useEffect(() => {
    if (result) setDisplayResult(result);
    else if (!isPublishing) setDisplayResult(null);
  }, [result, isPublishing]);

  return (
    <div
      key={displayResult?.type ?? "confirmation"}
      className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200"
    >
      {displayResult?.type === "success" ? (
        <SuccessContent
          hasCopied={hasCopied}
          onCopy={onCopy}
          onOpenLink={onOpenLink}
          onClose={() => {
            onReset?.();
            onClose?.();
          }}
        />
      ) : displayResult?.type === "error" ? (
        <ErrorContent
          isPublishing={isPublishing}
          onRetry={onRetry}
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
