import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../utils";

/**
 * Tag — Statut workflow document (publication & traitement)
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1256-5829
 *
 * Variants calqués sur le Figma (composant TAGS, node 1256:5829) :
 *
 *   a-traiter   → Bleu France clair  (background-action-low-blue-france)
 *   en-cours    → Jaune tournesol    (yellow-tournesol-950-100)
 *   archive     → Gris désactivé     (background-disabled-grey)
 *   a-relire    → Violet glycine     (purple-glycine-925-125)
 *   publie      → Vert succès plein  (background-flat-success)
 *   na          → Tiret gris         (pas de fond)
 *
 * Toutes les couleurs référencent les variables DSFR directement.
 * Source : @gouvfr/dsfr/dist/core/core.css
 */
const tagVariants = cva(
  "inline-flex items-center justify-center gap-1 font-medium select-none whitespace-nowrap",
  {
    variants: {
      status: {
        // Figma : tokens-light/background/action-low-blue-france + text/title-blue-france
        "a-traiter": [
          "bg-[var(--background-action-low-blue-france)]",
          "text-[var(--text-title-blue-france)]",
          "rounded-full px-3 h-6 text-xs",
        ].join(" "),

        // Figma : yellow-tournesol-950-100 + yellow-tournesol-sun-407-moon-922
        "en-cours": [
          "bg-[var(--yellow-tournesol-950-100)]",
          "text-[var(--yellow-tournesol-sun-407-moon-922)]",
          "rounded-full px-3 h-6 text-xs",
        ].join(" "),

        // Figma : tokens-light/background/disabled-grey + text/mention-grey
        archive: [
          "bg-[var(--background-disabled-grey)]",
          "text-[var(--text-mention-grey)]",
          "rounded-full px-3 h-6 text-xs",
        ].join(" "),

        // Figma : purple-glycine-925-125 + purple-glycine-sun-319-moon-630
        // borderRadius: 12px (pas pill — différent des autres)
        "a-relire": [
          "bg-[var(--purple-glycine-925-125)]",
          "text-[var(--purple-glycine-sun-319-moon-630)]",
          "rounded-xl px-3 h-6 text-xs",
        ].join(" "),

        // Figma : tokens-dark/background/flat-success (#27A658)
        // Margot utilise intentionnellement la valeur dark mode de --success-425-625
        // pour avoir un vert vif sur fond clair. Valeur fixe.
        publie: [
          "bg-[#27A658]",
          "text-[var(--text-inverted-grey)]",
          "rounded-full px-3 h-6 text-xs",
        ].join(" "),

        // Figma : pas de fond, texte tiret, text/disabled-grey bold
        na: [
          "text-[var(--text-disabled-grey)]",
          "font-bold rounded px-2 h-6 text-xs",
        ].join(" "),
      },
    },
    defaultVariants: {
      status: "na",
    },
  },
);

export type TagStatus = NonNullable<VariantProps<typeof tagVariants>["status"]>;

export const TAG_LABELS: Record<TagStatus, string> = {
  "a-traiter": "À traiter",
  "en-cours": "En cours",
  archive: "Archivé",
  "a-relire": "À relire",
  publie: "Publié",
  na: "—",
};

export interface TagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tagVariants> {}

const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  ({ className, status, children, ...props }, ref) => {
    const label = children ?? (status ? TAG_LABELS[status] : "—");

    return (
      <div ref={ref} className="inline-flex items-center" {...props}>
        <span className={cn(tagVariants({ status }), className)}>{label}</span>
      </div>
    );
  },
);
Tag.displayName = "Tag";

export { Tag, tagVariants };
