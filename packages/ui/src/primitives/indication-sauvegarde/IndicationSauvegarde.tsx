import { cva, type VariantProps } from "class-variance-authority";
import { RiLoaderLine } from "../../icons";

/**
 * IndicationSauvegarde — Indicateur d'état de sauvegarde, cliquable pour sauvegarder.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1361-7769
 *
 * Specs Figma (COMPONENT_SET, node 1361:7769) :
 *   Layout    : HORIZONTAL, gap=4px, padding=6px H / 2px V, border-radius=4px
 *   Fond      : #ffffff (normal) — #f6f6f6 (hover sur unsaved)
 *   Bordure   : 1px solid --border-default-grey
 *   Dot       : ~6.7px — vert (--text-default-success) | orange (--orange-terre-battue-main-645)
 *   Spinner   : 12×12px RiLoaderLine — --text-mention-grey
 *   Texte     : 12px / weight 500 / --text-mention-grey
 *
 * 3 états :
 *   saved   → dot vert  + "Enregistré"    — non interactif
 *   saving  → spinner   + "En cours..."   — non interactif
 *   unsaved → dot orange+ "À enregistrer" — cliquable → onSave()
 */

export type IndicationSauvegardeStatus = "saved" | "saving" | "unsaved";

// ---------------------------------------------------------------------------
// cva variants
// ---------------------------------------------------------------------------

const indicationVariants = cva(
  [
    "inline-flex items-center",
    "gap-1",
    "px-1.5 py-0.5",
    "rounded-xs",
    "bg-white",
    "border border-[var(--border-default-grey,#DDDDDD)]",
    "transition-colors duration-200",
  ],
  {
    variants: {
      status: {
        saved:
          "cursor-default disabled:opacity-100 disabled:pointer-events-none",
        saving:
          "cursor-default disabled:opacity-100 disabled:pointer-events-none",
        unsaved: [
          "cursor-pointer",
          "hover:bg-[#f6f6f6]",
          "active:bg-[#ececec]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-action-high-blue-france)] focus-visible:ring-offset-1",
        ],
      },
    },
  },
);

// Zone icône : 8px (dot) ↔ 12px (spinner) selon état
const iconZoneVariants = cva(
  "relative flex items-center justify-center shrink-0 h-3 transition-all duration-200",
  {
    variants: {
      status: {
        saved: "w-2",
        saving: "w-3",
        unsaved: "w-2",
      },
    },
  },
);

// Dot : opacité + couleur de fond via token DSFR
const dotVariants = cva(
  [
    "absolute rounded-full -translate-y-px",
    "w-[6.5px] h-[6.5px]",
    "transition-[opacity,background-color] duration-200",
  ],
  {
    variants: {
      status: {
        saved: "opacity-100 bg-[var(--text-default-success,#18753c)]",
        saving: "opacity-0  bg-transparent",
        unsaved: "opacity-100 bg-[var(--orange-terre-battue-main-645,#fa794a)]",
      },
    },
  },
);

// Spinner : opacité + animation
const spinnerVariants = cva(
  "absolute w-3 h-3 transition-opacity duration-200 text-[var(--text-mention-grey,#666666)]",
  {
    variants: {
      status: {
        saved: "opacity-0",
        saving: "opacity-100 animate-spin",
        unsaved: "opacity-0",
      },
    },
  },
);

// Zone texte : largeur animée (mesurée Figma) + labels superposés
const textZoneVariants = cva(
  "relative overflow-hidden h-5 transition-all duration-200",
  {
    variants: {
      status: {
        saved: "w-[58px]",
        saving: "w-[59px]",
        unsaved: "w-[75px]",
      },
    },
  },
);

// Label individuel : fade in/out
const labelVariants = cva(
  [
    "absolute inset-y-0 left-0",
    "text-xs font-medium leading-5 whitespace-nowrap",
    "text-[var(--text-mention-grey,#666666)]",
    "transition-opacity duration-150",
  ],
  {
    variants: {
      active: {
        true: "opacity-100",
        false: "opacity-0 pointer-events-none",
      },
    },
  },
);

// ---------------------------------------------------------------------------
// Données par état
// ---------------------------------------------------------------------------

const LABEL: Record<IndicationSauvegardeStatus, string> = {
  saved: "Enregistré",
  saving: "En cours...",
  unsaved: "À enregistrer",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface IndicationSauvegardeProps
  extends VariantProps<typeof indicationVariants> {
  status: IndicationSauvegardeStatus;
  /** Appelé au clic quand status === 'unsaved' */
  onSave?: () => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const IconZone = ({ status }: { status: IndicationSauvegardeStatus }) => (
  <span className={iconZoneVariants({ status })}>
    <span className={dotVariants({ status })} aria-hidden="true" />
    <RiLoaderLine className={spinnerVariants({ status })} aria-hidden="true" />
  </span>
);

const TextZone = ({ status }: { status: IndicationSauvegardeStatus }) => (
  <span className={textZoneVariants({ status })}>
    {(["saved", "saving", "unsaved"] as const).map((s) => (
      <span key={s} className={labelVariants({ active: s === status })}>
        {LABEL[s]}
      </span>
    ))}
  </span>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function IndicationSauvegarde({
  status,
  onSave,
  className,
}: IndicationSauvegardeProps) {
  const isInteractive = status === "unsaved";

  return (
    <button
      type="button"
      onClick={isInteractive ? onSave : undefined}
      disabled={!isInteractive}
      className={indicationVariants({ status, className })}
      aria-live={!isInteractive ? "polite" : undefined}
      aria-label={isInteractive ? "Enregistrer le document" : LABEL[status]}
    >
      <IconZone status={status} />
      <TextZone status={status} />
    </button>
  );
}
