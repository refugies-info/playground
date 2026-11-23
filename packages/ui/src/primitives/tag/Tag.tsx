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
 *   choice      → Bleu France clair  (choix d'un filtre : `onToggle` + `pressed`, plein avec une coche une fois choisi)
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

        // Figma (Interfaces-Front, node 38795:188928) : choix d'un filtre, activable
        choice: "rounded-full px-2 h-6 text-xs",

        // Figma (Interfaces-Front, node 38426:271491) : valeur choisie dans un champ de recherche
        selected: [
          "bg-[var(--background-action-high-blue-france)]",
          "text-[var(--text-inverted-grey)]",
          "max-w-full rounded-[20px] py-1 pr-2 pl-3 h-6 text-xs leading-5",
        ].join(" "),
      },
      pressed: { true: "", false: "" },
    },
    compoundVariants: [
      {
        status: "choice",
        pressed: false,
        className: [
          "bg-[var(--background-action-low-blue-france)]",
          "text-[var(--text-action-high-blue-france)]",
        ],
      },
      {
        // The dark body and its check badge are drawn by `ChoiceCheckDecoration`
        status: "choice",
        pressed: true,
        className: "relative text-[var(--text-inverted-grey)]",
      },
    ],
    defaultVariants: {
      status: "na",
      pressed: false,
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
  choice: "Choix",
};

interface TagBaseProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tagVariants> {
  detail?: string;
  detailIcon?: RemixiconComponentType;
  onToggle?: () => void;
  pressed?: boolean;
}
type TagDismissProps =
  | { onDismiss: () => void; dismissLabel: string }
  | { onDismiss?: undefined; dismissLabel?: undefined };

export type TagProps = TagBaseProps & TagDismissProps;

/**
 * Selected look of a `choice` tag (Figma Interfaces-Front, node 38795:188928): a dark body with a
 * ring-check badge on its top-right corner, cut out of the body.
 */
function ChoiceCheckDecoration() {
  return (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 right-3 rounded-l-xl bg-[var(--background-action-high-blue-france)]"
      />
      <svg
        aria-hidden="true"
        width="18"
        height="27"
        viewBox="0 0 18 27"
        fill="currentColor"
        className="absolute -top-[3px] right-[-6px] text-[var(--background-action-high-blue-france)]"
      >
        <path d="M0 3C2.1841 3 4.22999 3.58683 5.99414 4.60645C5.89064 5.05432 5.83496 5.52067 5.83496 6C5.83496 9.28979 8.41186 11.9764 11.6572 12.1543C11.8792 13.0667 12 14.0192 12 15C12 21.6274 6.62742 27 0 27V3Z" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 11C9.2385 11 7 8.7615 7 6C7 3.2385 9.2385 1 12 1C14.7615 1 17 3.2385 17 6C17 8.7615 14.7615 11 12 11ZM12 10C14.2091 10 16 8.20914 16 6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6C8 8.20914 9.79086 10 12 10ZM11.5015 8L9.38 5.8785L10.087 5.1715L11.5015 6.586L14.3295 3.7575L15.037 4.4645L11.5015 8Z"
        />
      </svg>
    </>
  );
}

const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  (
    {
      className,
      status,
      children,
      detail,
      detailIcon: DetailIcon,
      onToggle,
      pressed = false,
      onDismiss,
      dismissLabel,
      ...props
    },
    ref,
  ) => {
    const label = children ?? (status ? TAG_LABELS[status] : "—");
    const tagClassName = cn(
      tagVariants({ status, pressed }),
      onToggle && "cursor-pointer",
      className,
    );

    const isChoicePressed = status === "choice" && pressed;
    const content = (
      <>
        {isChoicePressed && <ChoiceCheckDecoration />}
        <span
          className={cn(
            "min-w-0 truncate",
            isChoicePressed && "relative",
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
      </>
    );

    return (
      <div
        ref={ref}
        className="inline-flex max-w-full min-w-0 items-center"
        {...props}
      >
        {onToggle ? (
          <button
            type="button"
            aria-pressed={pressed}
            onClick={onToggle}
            className={tagClassName}
          >
            {content}
          </button>
        ) : (
          <span className={tagClassName}>{content}</span>
        )}
      </div>
    );
  },
);
Tag.displayName = "Tag";

export { Tag, tagVariants };
