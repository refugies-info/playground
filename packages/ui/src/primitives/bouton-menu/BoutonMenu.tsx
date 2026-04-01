import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../../utils";
import type { IconRef } from "../icon";
import { Icon } from "../icon";

/**
 * BoutonMenu — Bouton de navigation du header
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1284-5174
 *
 * 3 états visuels (calqués sur le composant Figma "Bouton Menu") :
 *   - défaut  → texte mention-grey (#666666)
 *   - survol  → texte title-grey (#161616)
 *   - cliqué  → texte blue-france-sun-113-hover (#1212FF)
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
    },
    defaultVariants: {
      active: false,
    },
  },
);

export interface BoutonMenuProps
  extends VariantProps<typeof boutonMenuVariants> {
  icon: IconRef;
  label: string;
  href?: string;
  linkComponent?: React.ElementType;
  className?: string;
  [key: string]: unknown;
}

function BoutonMenu({
  icon,
  label,
  active = false,
  href,
  linkComponent,
  className,
  ...rest
}: BoutonMenuProps) {
  const Comp = href ? (linkComponent ?? "a") : "button";

  return (
    <Comp
      {...(href ? { href } : { type: "button" })}
      className={cn(boutonMenuVariants({ active }), className)}
      {...rest}
    >
      <span className="shrink-0">
        <Icon icon={icon} size="sm" />
      </span>
      {label}
    </Comp>
  );
}

export { BoutonMenu, boutonMenuVariants };
