"use client";

import { RiPencilAiLine, RiStopCircleFill } from "@remixicon/react";
import { cn } from "../../utils";

export type PapaIAVariant = "default" | "loading" | "emoji";

export interface PapaIAProps {
  /** Variante du bouton :
   * - `default`  → fond bleu, icône IA (état repos)
   * - `loading`  → fond gris, icône stop (génération en cours)
   * - `emoji`    → fond violet, emoji personnalisé
   */
  variant?: PapaIAVariant;
  /** Emoji affiché en variante `emoji` */
  emoji?: string;
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
}

const BASE =
  "inline-flex items-center justify-center size-12 rounded-full transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

const VARIANT_STYLES: Record<PapaIAVariant, string> = {
  default: "bg-[#1212FF] text-white hover:opacity-90",
  loading: "bg-[#EEEEEE] text-[#161616] hover:opacity-80",
  emoji: "bg-[#8B8BF6] text-white hover:opacity-90",
};

/**
 * PapaIA — Bouton flottant d'accès à l'assistant IA.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1365-14766
 *
 * 3 variantes :
 *   - `default` : fond bleu, icône IA → déclenche l'assistant
 *   - `loading` : fond gris, icône stop → annule la génération
 *   - `emoji`   : fond violet, emoji personnalisé → identité de l'agent
 */
export function PapaIA({
  variant = "default",
  emoji = "🥭",
  onClick,
  disabled,
  "aria-label": ariaLabel,
}: PapaIAProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? ARIA_LABELS[variant]}
      className={cn(BASE, VARIANT_STYLES[variant])}
    >
      {variant === "default" && <RiPencilAiLine size={24} />}
      {variant === "loading" && <RiStopCircleFill size={24} />}
      {variant === "emoji" && (
        <span className="text-2xl leading-none">{emoji}</span>
      )}
    </button>
  );
}

const ARIA_LABELS: Record<PapaIAVariant, string> = {
  default: "Améliorer avec l'IA",
  loading: "Arrêter la génération",
  emoji: "Assistant IA",
};
