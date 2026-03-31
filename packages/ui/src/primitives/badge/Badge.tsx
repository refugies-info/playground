// @WIP — En attente de validation Margot
// Décision ouverte : fusionner badge + labels + arbitrage en un seul composant ?
// Dette technique : CVA référence des primitives DSFR "hover/dark" comme couleurs
// statiques (pending, draft, archived…). À remplacer par status-tokens.css
// après décision structure composants. Voir memory workflows.md.

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../utils";

/**
 * Badge — Composant de statut RCO
 *
 * Les couleurs référencent directement les variables DSFR (core.css).
 * Pas de fichier CSS intermédiaire — CVA = layer 3.
 *
 * Correspondances Figma → DSFR :
 *   validated   → --success-950-100 / --success-425-625
 *   refused     → --error-950-100   / --error-425-625
 *   conform-ai  → --info-950-100    / --info-425-625
 *   doublon     → --warning-975-75  / --warning-425-625
 *   pending     → --yellow-moutarde-925-125-hover
 *   draft       → --blue-france-sun-113-625       (valeur dark mode)
 *   archived    → --warning-425-625               (valeur dark mode)
 *   published   → --success-425-625-hover
 *   review      → --green-archipel-sun-391-moon-716-active
 *
 * Source Figma : Wireframes_RCO node 233:5460
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded font-bold text-xs uppercase tracking-wide px-2 py-1 transition-colors select-none whitespace-nowrap",
  {
    variants: {
      variant: {
        /* ── Validation — fond clair, texte coloré ── */
        validated: "bg-[var(--success-950-100)]  text-[var(--success-425-625)]",
        refused: "bg-[var(--error-950-100)]    text-[var(--error-425-625)]",
        "conform-ai": "bg-[var(--info-950-100)]     text-[var(--info-425-625)]",
        doublon: "bg-[var(--warning-975-75)]   text-[var(--warning-425-625)]",

        /* ── Status workflow — fond plein, texte blanc ── */
        pending: "bg-[var(--yellow-moutarde-925-125-hover)] text-white",
        draft: "bg-[var(--blue-france-sun-113-625)]       text-white",
        archived: "bg-[var(--warning-425-625)]               text-white",
        published: "bg-[var(--success-425-625-hover)]         text-white",
        review: "bg-[var(--green-archipel-sun-391-moon-716-active)] text-white",

        /* ── Génériques (rétrocompatibilité) ── */
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
      variant: "pending",
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
