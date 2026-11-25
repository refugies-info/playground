import type { RemixiconComponentType } from "@remixicon/react";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { RiCloseCircleFill } from "../../icons";
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
 *   attention   → Orange d'alerte    (background-flat-warning)
 *   na          → Tiret gris         (pas de fond)
 *   selected    → Bleu France plein  (valeur choisie, retirable avec `onDismiss`)
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

        // Orange d'alerte (widget inactif) : background/flat/warning + texte inversé
        attention: [
          "bg-[var(--background-flat-warning)]",
          "text-[var(--text-inverted-grey)]",
          "rounded-full px-3 h-6 text-xs",
        ].join(" "),

        // Figma : pas de fond, texte tiret, text/disabled-grey bold
        na: [
          "text-[var(--text-disabled-grey)]",
          "font-bold rounded px-2 h-6 text-xs",
        ].join(" "),

        // Figma (Interfaces-Front, node 38426:271491) : valeur choisie dans un champ de recherche
        selected: [
          "bg-(--background-action-high-blue-france)",
          "text-(--text-inverted-grey)",
          "max-w-full rounded-[20px] py-1 pr-2 pl-3 h-6 text-xs leading-5",
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
  attention: "Attention",
  na: "—",
  selected: "Sélectionné",
};

interface TagBaseProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tagVariants> {
  detail?: string;
  detailIcon?: RemixiconComponentType;
}
type TagDismissProps =
  | { onDismiss: () => void; dismissLabel: string }
  | { onDismiss?: undefined; dismissLabel?: undefined };

export type TagProps = TagBaseProps & TagDismissProps;

const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  (
    {
      className,
      status,
      children,
      detail,
      detailIcon: DetailIcon,
      onDismiss,
      dismissLabel,
      ...props
    },
    ref,
  ) => {
    const label = children ?? (status ? TAG_LABELS[status] : "—");

    return (
      <div
        ref={ref}
        className="inline-flex max-w-full min-w-0 items-center"
        {...props}
      >
        <span className={cn(tagVariants({ status }), className)}>
          <span
            className={cn(
              "min-w-0 truncate",
              status === "selected" && "font-bold",
            )}
          >
            {label}
          </span>
          {detail && (
            <span className="ml-1 flex min-w-0 shrink-[2] items-center gap-1 font-normal">
              {DetailIcon && (
                <DetailIcon className="size-3 shrink-0" aria-hidden={true} />
              )}
              <span className="truncate">{detail}</span>
            </span>
          )}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label={dismissLabel}
              className="ml-1 shrink-0 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            >
              <RiCloseCircleFill className="size-4" aria-hidden={true} />
            </button>
          )}
        </span>
      </div>
    );
  },
);
Tag.displayName = "Tag";

export { Tag, tagVariants };
