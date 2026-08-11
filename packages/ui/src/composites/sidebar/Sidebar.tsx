import type * as React from "react";
import { FrArrowLeftSLineDouble, FrArrowRightSLineDouble } from "../../icons";
import { Button } from "../../primitives/button/Button";
import { cn } from "../../utils";

/**
 * Sidebar — Barre de navigation latérale gauche repliable
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1365-13876
 *
 * 2 variantes Figma :
 *   - Plié?=off (déplié) : Logo + texte · nav items avec label · bas en row
 *   - Plié?=on  (replié)  : Logo icône seule · nav items icon-only · bas en column
 *
 * Usage :
 * ```tsx
 * <Sidebar
 *   isCollapsed={isCollapsed}
 *   onToggle={() => setIsCollapsed(c => !c)}
 *   logo={<AppLogo image={...} title="BOMO" collapsed={isCollapsed} href="/" linkComponent={Link} />}
 *   userAvatar={<img src={...} className="w-12 h-12 rounded-full" />}
 * >
 *   <BoutonMenu icon={RiFileTextLine} label="Fiches" active iconOnly={isCollapsed} href="/documents" linkComponent={Link} />
 *   <BoutonMenu icon={RiTranslate2} label="Espace de traduction" iconOnly={isCollapsed} href="/translations" linkComponent={Link} />
 * </Sidebar>
 * ```
 */

export interface SidebarProps {
  /** État replié/déplié de la sidebar */
  isCollapsed: boolean;
  /** Callback déclenché au clic sur le bouton toggle (bas de la sidebar) */
  onToggle: () => void;
  /** Logo de l'application — passer <AppLogo collapsed={isCollapsed} ... /> */
  logo: React.ReactNode;
  /** Items de navigation — passer des <BoutonMenu iconOnly={isCollapsed} ... /> */
  children: React.ReactNode;
  /** Avatar de l'utilisateur connecté (image ou initiales) */
  userAvatar?: React.ReactNode;
  /** Bouton de notifications */
  notifications?: React.ReactNode;
  className?: string;
}

export function Sidebar({
  isCollapsed,
  onToggle,
  logo,
  children,
  userAvatar,
  notifications,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[var(--background-alt-blue-france)]",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-[240px]",
        className,
      )}
      aria-label="Navigation principale"
    >
      {/* Top — Logo + nav items */}
      <div className="flex flex-col gap-14 px-4 py-6 flex-1 overflow-y-auto overflow-x-hidden">
        {/* Logo — px-3 pour aligner l'icône avec le px-3 base des BoutonMenu */}
        <div className="flex items-center px-3">{logo}</div>

        {/* Nav items */}
        <div className="flex flex-col gap-2">{children}</div>
      </div>

      {/* Bottom — Notifications + avatar + bouton toggle */}
      <div
        className={cn(
          "px-4 py-6",
          isCollapsed
            ? "flex flex-col items-center gap-4"
            : "flex flex-row items-center justify-between",
        )}
      >
        {/* Notifications + avatar */}
        <div
          className={cn(
            "flex shrink-0 items-center",
            isCollapsed ? "flex-col gap-4" : "flex-row gap-2",
          )}
        >
          {notifications}
          {userAvatar}
        </div>

        {/* Bouton toggle */}
        <Button
          variant="quatrieme"
          size="sm"
          onClick={onToggle}
          aria-label={isCollapsed ? "Déplier la sidebar" : "Replier la sidebar"}
          className="h-10 w-10 px-0 justify-center shrink-0 text-[var(--text-disabled-grey)]"
        >
          {isCollapsed ? (
            <FrArrowRightSLineDouble size={20} aria-hidden />
          ) : (
            <FrArrowLeftSLineDouble size={20} aria-hidden />
          )}
        </Button>
      </div>
    </aside>
  );
}
