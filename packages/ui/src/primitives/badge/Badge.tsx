import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../utils";

/**
 * Badge — Composant générique d'étiquette
 *
 * 5 variants sémantiques génériques.
 * Les variantes RCO (validated, refused, conform-ai, doublon, pending, draft,
 * archived, published, review) ont été supprimées — remplacées par Tag et Conformite.
 *
 * Suppression complète de Badge prévue lors de la refonte des écrans.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded font-bold text-xs uppercase tracking-wide px-2 py-1 transition-colors select-none whitespace-nowrap",
  {
    variants: {
      variant: {
        info: "bg-blue-100   text-blue-700",
        neutral: "bg-gray-100   text-gray-700",
        success: "bg-green-100  text-green-700",
        danger: "bg-red-100    text-red-700",
        warning: "bg-yellow-100 text-yellow-700",
      },
      size: {
        sm: "text-[10px] px-1.5 py-0.5",
        md: "text-xs px-2 py-1",
        lg: "text-sm px-3 py-1.5",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Icône optionnelle affichée avant le label */
  icon?: React.ReactNode;
}

/** Type utilitaire pour typer les variants à l'extérieur du composant */
export type BadgeVariant = NonNullable<BadgeProps["variant"]>;

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, icon, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    >
      {icon && <span className="shrink-0 size-4">{icon}</span>}
      {children}
    </span>
  ),
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
