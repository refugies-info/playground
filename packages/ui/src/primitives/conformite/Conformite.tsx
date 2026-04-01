import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../utils";

/**
 * Conformite — Indicateur de conformité IA
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1264-5919
 *
 * Variants (node 1264:5919) :
 *   conforme     → "CONFORME"     — fond info (#E8EDFF), texte info (#0063CB)
 *   non-conforme → "NON CONFORME" — fond warning (#FFE9E6), texte warning (#B34000)
 *
 * Spécificités visuelles :
 *   - Texte en MAJUSCULES (uppercase)
 *   - Marianne Bold 12px
 *   - Padding serré : 0px 6px
 *   - Border radius : 4px (pas pill)
 *   - Taille hug (pas de hauteur fixe)
 */
const conformiteVariants = cva(
  // padding: 0px 6px — border-radius: 4px — Marianne Bold 12px/20px uppercase
  "inline-flex items-center justify-center px-1.5 rounded-xs text-xs font-bold uppercase leading-5",
  {
    variants: {
      value: {
        // Figma : background-contrast-info + text-default-info
        conforme: [
          "bg-[var(--background-contrast-info)]",
          "text-[var(--text-default-info)]",
        ].join(" "),

        // Figma : background-contrast-warning + text-default-warning
        "non-conforme": [
          "bg-[var(--background-contrast-warning)]",
          "text-[var(--text-default-warning)]",
        ].join(" "),
      },
    },
    defaultVariants: {
      value: "conforme",
    },
  },
);

export type ConformiteValue = NonNullable<
  VariantProps<typeof conformiteVariants>["value"]
>;

export const CONFORMITE_LABELS: Record<ConformiteValue, string> = {
  conforme: "Conforme",
  "non-conforme": "Non conforme",
};

export interface ConformiteProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof conformiteVariants> {}

const Conformite = React.forwardRef<HTMLSpanElement, ConformiteProps>(
  ({ className, value, children, ...props }, ref) => {
    const label = children ?? (value ? CONFORMITE_LABELS[value] : "Conforme");

    return (
      <span
        ref={ref}
        className={cn(conformiteVariants({ value }), className)}
        {...props}
      >
        {label}
      </span>
    );
  },
);
Conformite.displayName = "Conformite";

export { Conformite, conformiteVariants };
