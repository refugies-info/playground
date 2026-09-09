import type * as React from "react";
import { cn } from "../../utils";

/**
 * IndicationConformite — Badge compact d'arbitrage (icône seule, sans texte).
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1728-9296
 *
 * Deux variants (Figma "Indication conformité") :
 *   - `conforme`     → fond contrast-info (#e8edff)  + point bleu  (#0063cb)
 *   - `non-conforme` → fond contrast-warning (#ffe9e6) + point orange (#b34000)
 *
 * Dimensions : padding 2px 6px, height 20px, borderRadius 4px.
 * Le "Signal" Figma est un cercle plein 8×8px — pas de texte.
 */

const VARIANTS: Record<
  "conforme" | "non-conforme",
  { container: string; dot: string; ariaLabel: string }
> = {
  conforme: {
    // Figma : background-contrast-info (#e8edff) + text-default-info (#0063cb)
    container: "bg-[var(--background-contrast-info,#e8edff)]",
    dot: "bg-[var(--text-default-info,#0063cb)]",
    ariaLabel: "Conforme",
  },
  "non-conforme": {
    // Figma : background-contrast-warning (#ffe9e6) + text-default-warning (#b34000)
    container: "bg-[var(--background-contrast-warning,#ffe9e6)]",
    dot: "bg-[var(--text-default-warning,#b34000)]",
    ariaLabel: "Non conforme",
  },
};

interface IndicationConformiteProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** État de conformité. */
  value: "conforme" | "non-conforme";
}

function IndicationConformite({
  value,
  className,
  ...props
}: IndicationConformiteProps) {
  const { container, dot, ariaLabel } = VARIANTS[value];

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center justify-center h-5 px-1.5 rounded-xs",
        container,
        className,
      )}
      {...props}
    >
      {/* Signal — cercle plein 8×8px (Figma "Signal" SVG) */}
      <span className={cn("w-2 h-2 rounded-full shrink-0", dot)} />
    </span>
  );
}

export type { IndicationConformiteProps };
export { IndicationConformite };
