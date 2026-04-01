import type * as React from "react";
import { cn } from "../../utils";

/**
 * AppHeader — Conteneur header de l'application
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1255-8294
 *
 * Layout Figma : row, align-items center, gap 40px, padding 12px 80px
 * Fond blanc, bordure basse #DDDDDD
 * Container max-width : 1568px centré
 *
 * Usage :
 * ```tsx
 * <AppHeader>
 *   <AppLogo image={<img … />} title="BOMO ?" />
 *   <BoutonMenu icon={RiFileTextLine} label="Fiches" active />
 *   <BoutonMenu icon={RiTranslate2} label="Espace de traduction" />
 * </AppHeader>
 * ```
 */

export interface AppHeaderProps {
  /** Contenu libre : AppLogo, BoutonMenu, etc. */
  children: React.ReactNode;
  className?: string;
}

function AppHeader({ children, className }: AppHeaderProps) {
  return (
    <header className="bg-[var(--background-default-grey)] border-b border-[var(--border-default-grey)]">
      <div
        className={cn(
          "container mx-auto flex items-center gap-10 py-3",
          className,
        )}
      >
        {children}
      </div>
    </header>
  );
}

export { AppHeader };
