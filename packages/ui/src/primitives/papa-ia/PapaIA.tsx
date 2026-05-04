"use client";

import { cva } from "class-variance-authority";
import { RiPencilAiLine, RiStopCircleFill } from "../../icons";
import { cn } from "../../utils";

// ---------------------------------------------------------------------------
// CVA
// ---------------------------------------------------------------------------

const papaIAVariants = cva(
  [
    "inline-flex items-center justify-center",
    "size-12 rounded-full",
    "transition-opacity cursor-pointer",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-[var(--border-action-high-blue-france)]",
    "focus-visible:ring-offset-2",
  ].join(" "),
  {
    variants: {
      variant: {
        /**
         * État repos : fond bleu France, icône IA crayon blanc.
         * Déclenche la génération IA.
         */
        default: [
          "bg-[var(--background-action-high-blue-france-hover,#1212FF)]",
          "text-white",
          "hover:opacity-90",
        ].join(" "),

        /**
         * Génération en cours : fond gris clair, icône stop.
         * Cliquer ici annule la génération.
         */
        loading: [
          "bg-[var(--background-contrast-grey,#EEEEEE)]",
          "text-[var(--text-default-grey,#3A3A3A)]",
          "hover:opacity-80",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// ---------------------------------------------------------------------------
// Aria labels par défaut
// ---------------------------------------------------------------------------

const ARIA_LABELS: Record<PapaIAVariant, string> = {
  default: "Améliorer avec l'IA",
  loading: "Arrêter la génération",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PapaIAVariant = "default" | "loading";

export interface PapaIAProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Variante du bouton :
   * - `default`  → fond bleu, icône IA (état repos)
   * - `loading`  → fond gris, icône stop (génération en cours — click = annuler)
   */
  variant?: PapaIAVariant;
  className?: string;
}

// ---------------------------------------------------------------------------
// Icônes statiques hoistées — évite la recréation à chaque render
// ---------------------------------------------------------------------------

const ICON_PENCIL = <RiPencilAiLine size={24} aria-hidden />;
const ICON_STOP = <RiStopCircleFill size={24} aria-hidden />;

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

/**
 * PapaIA — Bouton flottant d'accès à l'assistant IA.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1415-7133&m=dev
 *
 * 2 variantes :
 *   - `default` : fond bleu, icône IA → déclenche la génération
 *   - `loading` : fond gris, icône stop → annule la génération en cours
 */
export function PapaIA({
  variant = "default",
  className,
  "aria-label": ariaLabel,
  ...props
}: PapaIAProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? ARIA_LABELS[variant]}
      className={cn(papaIAVariants({ variant }), className)}
      {...props}
    >
      {variant === "default" ? ICON_PENCIL : ICON_STOP}
    </button>
  );
}
