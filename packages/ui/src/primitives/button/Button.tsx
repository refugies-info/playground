import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { RiLoader4Line } from "../../icons";
import { cn } from "../../utils";
import type { IconRef, IconSize } from "../icon";
import { Icon } from "../icon";

// Taille bouton → taille icône recommandée (DSFR alignment)
// sm (32px) → sm (16px) | md (40px) → sm (16px) | lg (48px) → md (24px)
export const BUTTON_ICON_SIZE: Record<string, IconSize> = {
  sm: "sm",
  md: "sm",
  lg: "md",
};

/**
 * Button — CTA unifié
 *
 * @figma https://www.figma.com/design/BLVTgrfTTyMWKgi2MaTTAk/Design-System?node-id=2801-17488
 *
 * Noms des variants calqués sur le Figma (Design-System, node 2801-17488) :
 *
 *   primaire           → CTA Primaires / Mode clair   (Bleu France plein)
 *   secondaire         → CTA Secondaires / Mode clair  (contour Bleu France)
 *   primaire-colore    → CTA Primaires / Mode coloré   (fond bleu-france-950)
 *   secondaire-colore  → CTA Secondaires / Mode coloré (contour bleu-france-925)
 *   tertiaire          → CTA Tertiaires                (neutre, bordure via withBorder)
 *   quatrieme          → CTA Quatrième                 (transparent, sans bordure)
 *   violet             → CTA Violet                    (texte, soulignement au survol)
 *
 * Tailles (Figma : Taille=S/M/L) :  sm · md · lg
 * États (Figma : Défaut/Survol/Cliqué/Focus/Inactif) : CSS natif hover/active/focus/disabled
 *
 *
 * Toutes les couleurs référencent les variables DSFR directement.
 * Source : @gouvfr/dsfr/dist/core/core.css
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium",
    "cursor-pointer transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-action-high-blue-france)] focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:pointer-events-none",
  ].join(" "),
  {
    variants: {
      variant: {
        /* ── Mode clair ──────────────────────────────────────────────── */
        primaire: [
          "bg-[var(--background-action-high-blue-france)]",
          "text-[var(--text-inverted-grey)]",
          "hover:bg-[var(--background-action-high-blue-france-hover)]",
          "active:bg-[var(--background-action-high-blue-france-active)]",
          "disabled:bg-[var(--background-disabled-grey)]",
          "disabled:text-[var(--text-disabled-grey)]",
        ].join(" "),

        secondaire: [
          "bg-transparent",
          "border border-[var(--border-action-high-blue-france)]",
          "text-[var(--text-action-high-blue-france)]",
          "hover:bg-[var(--background-alt-grey)]",
          "active:bg-[var(--background-default-grey-active)]",
          "disabled:border-[var(--border-disabled-grey)]",
          "disabled:text-[var(--text-disabled-grey)]",
        ].join(" "),

        /* ── Mode coloré (sur fond bleu-france-950) ──────────────────── */
        "primaire-colore": [
          "bg-[var(--blue-france-950-100)]",
          "text-[var(--blue-france-sun-113-625)]",
          "hover:bg-[var(--blue-france-950-100-hover)]",
          "active:bg-[var(--blue-france-950-100-active)]",
          "disabled:bg-[var(--background-disabled-grey)]",
          "disabled:text-[var(--text-disabled-grey)]",
        ].join(" "),

        "secondaire-colore": [
          "bg-transparent",
          "border border-[var(--blue-france-925-125)]",
          "text-[var(--blue-france-sun-113-625)]",
          "hover:bg-white active:bg-white",
          "disabled:border-[var(--border-disabled-grey)]",
          "disabled:text-[var(--text-disabled-grey)]",
        ].join(" "),

        /* ── Tertiaire (bordure grise par défaut) ───────────────────── */
        // Figma : CTA Tertiaires — Bordure=on par défaut
        tertiaire: [
          "bg-transparent",
          "border border-[var(--border-default-grey)]",
          "text-[var(--text-default-grey)]",
          "hover:bg-[var(--background-alt-grey)]",
          "active:bg-[var(--background-default-grey-active)]",
          "disabled:border-[var(--border-disabled-grey)]",
          "disabled:text-[var(--text-disabled-grey)]",
        ].join(" "),

        /* ── Quatrième (sans bordure) ───────────────────────────────── */
        quatrieme: [
          "bg-transparent",
          "text-[var(--text-default-grey)]",
          "hover:bg-[var(--background-alt-grey)]",
          "active:bg-[var(--background-default-grey-active)]",
          "disabled:text-[var(--text-disabled-grey)]",
        ].join(" "),

        /* ── Violet ─────────────────────────────────────────────────── */
        // Figma : fond --blue-france-975-75 (#f5f5fe) par défaut
        // Survol : fond --blue-france-925-125 (#e3e3fd)
        // Texte  : --blue-france-sun-113-625-hover (#1212ff)
        violet: [
          "bg-[var(--blue-france-975-75)]",
          "text-[var(--blue-france-sun-113-625-hover)]",
          "hover:bg-[var(--blue-france-925-125)]",
          "disabled:bg-[var(--background-disabled-grey)]",
          "disabled:text-[var(--text-disabled-grey)]",
        ].join(" "),
      },

      size: {
        // Figma : Taille=S → 32px, 14px/24px
        sm: "h-8 px-3 py-1 text-sm leading-6",
        // Figma : Taille=M → 40px, 16px/24px  (défaut)
        md: "h-10 px-4 py-2 text-base leading-6",
        // Figma : Taille=L → 48px, 18px/28px
        lg: "h-12 px-6 py-2.5 text-lg leading-7",
      },

      // Figma : Icône seule=on/off
      iconOnly: {
        true: "",
        false: "",
      },
    },

    compoundVariants: [
      // icon-only → override du padding selon la taille
      { iconOnly: true, size: "sm", class: "h-8  w-8  p-2 px-2 py-2" }, // Figma : 32×32
      { iconOnly: true, size: "md", class: "h-10 w-10 p-2 px-2 py-2" }, // Figma : 40×40
      { iconOnly: true, size: "lg", class: "h-12 w-12 p-3 px-3 py-3" }, // Figma : 48×48
    ],

    defaultVariants: {
      variant: "primaire",
      size: "md",
      iconOnly: false,
    },
  },
);

export type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof buttonVariants>, "iconOnly"> {
  isLoading?: boolean;
  /** Composant icône Remix Icons affiché à gauche du label */
  leftIcon?: IconRef;
  /** Composant icône Remix Icons affiché à droite du label */
  rightIcon?: IconRef;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref,
  ) => {
    const hasIcon = !!(leftIcon || rightIcon);
    const hasChildren =
      children != null && children !== "" && children !== false;
    const isIconOnly = hasIcon && !hasChildren;
    const iconSize = BUTTON_ICON_SIZE[size ?? "md"] ?? "sm";

    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, iconOnly: isIconOnly, className }),
        )}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="animate-spin shrink-0">
              <Icon icon={RiLoader4Line} size={iconSize} />
            </span>
            {!isIconOnly && children}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="shrink-0">
                <Icon icon={leftIcon} size={iconSize} />
              </span>
            )}
            {!isIconOnly && children}
            {rightIcon && (
              <span className="shrink-0">
                <Icon icon={rightIcon} size={iconSize} />
              </span>
            )}
          </>
        )}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
