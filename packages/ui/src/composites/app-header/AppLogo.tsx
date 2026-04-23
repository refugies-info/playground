import type * as React from "react";
import { cn } from "../../utils";

/**
 * AppLogo — Logo de l'application dans le header ou la sidebar
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1255-8332
 *
 * Layout Figma : row, align-items center, gap 16px
 * Image 48×48 + texte Marianne Bold 24px (H4) couleur title-grey (#161616)
 *
 * Mode replié (`collapsed`) : seule l'image est affichée, le titre est masqué.
 */

export interface AppLogoProps {
  /** Image du logo (img, svg, Next Image…) */
  image: React.ReactNode;
  /** Nom de l'application */
  title: string;
  /** Cache le titre — utilisé dans la sidebar repliée */
  collapsed?: boolean;
  /** Lien vers l'accueil (optionnel) */
  href?: string;
  /** Composant Link (ex: Next.js Link) */
  linkComponent?: React.ComponentType<
    React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
  >;
  className?: string;
}

function AppLogo({
  image,
  title,
  collapsed = false,
  href,
  linkComponent,
  className,
}: AppLogoProps) {
  const content = (
    <>
      <span className="shrink-0">{image}</span>
      {/* Toujours rendu — opacity contrôle la visibilité.
          Disparaît immédiatement (transition-none), réapparaît avec délai. */}
      <span
        className={cn(
          "whitespace-nowrap overflow-hidden text-2xl font-bold text-[var(--text-title-grey)]",
          collapsed
            ? "opacity-0 transition-none w-0"
            : "opacity-100 transition-opacity duration-150 delay-150",
        )}
        aria-hidden={collapsed || undefined}
      >
        {title}
      </span>
    </>
  );

  const classes = cn("flex items-center gap-4", className);

  if (href && linkComponent) {
    const LinkComp = linkComponent;
    return (
      <LinkComp href={href} className={classes}>
        {content}
      </LinkComp>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return <div className={classes}>{content}</div>;
}

export { AppLogo };
