"use client";

import { cva } from "class-variance-authority";
import { RiCloseCircleFill, RiLoader2Line, RiPencilAiLine } from "../../icons";
import { cn } from "../../utils";

// ---------------------------------------------------------------------------
// CVA
// ---------------------------------------------------------------------------

const defaultClass = [
  "bg-[var(--background-action-high-blue-france-hover,#1212FF)]",
  "text-white",
  "hover:opacity-90",
].join(" ");

const papaIAVariants = cva(
  [
    "group",
    "inline-flex items-center justify-center",
    "size-12 rounded-full",
    "transition-colors cursor-pointer",
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
        default: defaultClass,
        translator: defaultClass,

        /**
         * Génération en cours : fond gris clair (#EEEEEE), icône loader qui
         * tourne. Au hover : fond rouge clair (#FFE9E9) + croix rouge
         * (annuler la génération). Cf. Figma en-cours-IA / en-cours-hover.
         */
        loading: [
          "bg-[var(--background-contrast-grey,#EEEEEE)]",
          "text-[var(--text-default-grey,#3A3A3A)]",
          "hover:bg-[var(--background-contrast-error,#FFE9E9)]",
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
  translator: "Regénérer la traduction",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PapaIAVariant = "default" | "loading" | "translator";

export interface PapaIAProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Variante du bouton :
   * - `default`  → fond bleu, icône IA (état repos)
   * - `translator`  → fond bleu, icône IA (état repos)
   * - `loading`  → fond gris, icône loader ; hover = fond rouge + croix (click = annuler)
   */
  variant?: PapaIAVariant;
  className?: string;
}

// ---------------------------------------------------------------------------
// Icônes statiques hoistées — évite la recréation à chaque render
// ---------------------------------------------------------------------------

const ICON_PENCIL = <RiPencilAiLine size={24} aria-hidden />;
const ICON_LOADER = (
  <RiLoader2Line
    size={24}
    aria-hidden
    className="animate-spin group-hover:hidden"
  />
);
const ICON_CROSS = (
  <RiCloseCircleFill
    size={20}
    aria-hidden
    className="hidden group-hover:block text-[var(--text-default-error,#CE0500)]"
  />
);

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

/**
 * PapaIA — Bouton flottant d'accès à l'assistant IA.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1415-7133&m=dev
 *
 * 3 variantes :
 *   - `default` : fond bleu, icône IA → déclenche la génération
 *   - `translator` : fond bleu, icône IA → déclenche la traduction
 *   - `loading` : fond gris, icône loader (hover rouge + croix) → annule la génération en cours
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
      {variant === "loading" ? (
        <>
          {ICON_LOADER}
          {ICON_CROSS}
        </>
      ) : (
        ICON_PENCIL
      )}
    </button>
  );
}
