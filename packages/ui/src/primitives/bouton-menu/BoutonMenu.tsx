import * as React from "react";
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

export interface BoutonMenuProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icône Remix affichée à gauche du label */
  icon: IconRef;
  /** Texte du bouton */
  label: string;
  /** État actif (page courante) */
  active?: boolean;
  /** Si fourni, le bouton se comporte comme un lien */
  href?: string;
  /** Composant Link à utiliser (ex: Next.js Link) — requis si href est fourni */
  linkComponent?: React.ComponentType<
    React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
  >;
}

const BoutonMenu = React.forwardRef<HTMLButtonElement, BoutonMenuProps>(
  (
    { icon, label, active = false, href, linkComponent, className, ...props },
    ref,
  ) => {
    const classes = cn(
      "inline-flex items-center gap-2 px-3 py-1 font-medium text-sm leading-6 transition-colors cursor-pointer",
      "active:bg-transparent",
      active
        ? "text-[var(--blue-france-sun-113-625-hover)]"
        : "text-[var(--text-mention-grey)] hover:text-[var(--text-title-grey)]",
      className,
    );

    const content = (
      <>
        <span className="shrink-0">
          <Icon icon={icon} size="sm" />
        </span>
        {label}
      </>
    );

    // Rendu comme lien si href est fourni
    if (href && linkComponent) {
      const LinkComp = linkComponent;
      return (
        <LinkComp href={href} className={classes}>
          {content}
        </LinkComp>
      );
    }

    return (
      <button ref={ref} type="button" className={classes} {...props}>
        {content}
      </button>
    );
  },
);
BoutonMenu.displayName = "BoutonMenu";

export { BoutonMenu };
