import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../../utils";
import type { IconRef } from "../icon";
import { Icon } from "../icon";

/**
 * BoutonMenu — Bouton de navigation du header et de la sidebar
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1284-5174
 *
 * 3 états visuels (calqués sur le composant Figma "Bouton Menu") :
 *   - défaut  → texte mention-grey (#666666)
 *   - survol  → texte title-grey (#161616)
 *   - cliqué  → texte blue-france-sun-113-hover (#1212FF)
 *
 * Variant iconOnly : cache le label, centré — utilisé dans la sidebar repliée.
 */

const boutonMenuVariants = cva(
  [
    "inline-flex items-center gap-2 px-3 py-1",
    "font-medium text-sm leading-6",
    "cursor-pointer transition-colors",
    "active:bg-transparent",
  ].join(" "),
  {
    variants: {
      active: {
        true: "text-[var(--blue-france-sun-113-625-hover)]",
        false: [
          "text-[var(--text-mention-grey)]",
          "hover:text-[var(--text-title-grey)]",
        ].join(" "),
      },
      iconOnly: {
        // Taille=L, Icône seule=on (Figma) → padding: 12px tout autour
        true: "py-3",
        false: "",
      },
    },
    defaultVariants: {
      active: false,
      iconOnly: false,
    },
  },
);

export interface BoutonMenuProps
  extends VariantProps<typeof boutonMenuVariants> {
  icon: IconRef;
  label: string;
  /** Mode icône seule — cache le label. Utilisé dans la sidebar repliée. */
  iconOnly?: boolean;
  href?: string;
  linkComponent?: React.ElementType;
  className?: string;
  [key: string]: unknown;
}

function BoutonMenu({
  icon,
  label,
  active = false,
  iconOnly = false,
  href,
  linkComponent,
  className,
  ...rest
}: BoutonMenuProps) {
  const Comp = href ? (linkComponent ?? "a") : "button";

  return (
    <Comp
      {...(href ? { href } : { type: "button" })}
      className={cn(boutonMenuVariants({ active, iconOnly }), className)}
      {...rest}
    >
      {/* Taille S (16px) avec label, taille L (24px) en icon-only — calqué sur Figma "Base des boutons".
          Le scale() permet une transition CSS fluide (les attributs SVG width/height ne sont pas animables). */}
      <span
        className={cn(
          "shrink-0 transition-transform duration-300 ease-in-out",
          iconOnly ? "scale-100" : "scale-[0.667]",
        )}
      >
        <Icon icon={icon} size="md" />
      </span>
      {/* Toujours rendu — opacity contrôle la visibilité pour éviter les décalages pendant l'animation.
          Disparaît immédiatement au clic (transition-none), réapparaît avec délai après l'expansion. */}
      <span
        className={cn(
          "whitespace-nowrap overflow-hidden",
          iconOnly
            ? "opacity-0 transition-none w-0"
            : "opacity-100 transition-opacity duration-150 delay-150",
        )}
        aria-hidden={iconOnly || undefined}
      >
        {label}
      </span>
    </Comp>
  );
}

export { BoutonMenu, boutonMenuVariants };
