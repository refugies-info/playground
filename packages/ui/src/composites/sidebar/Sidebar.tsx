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
  isCollapsed: boolean;
  onToggle: () => void;
  logo: React.ReactNode;
  children: React.ReactNode;
  userAvatar?: React.ReactNode;
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
      <div className="flex flex-col gap-14 px-4 py-6 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex items-center px-3">{logo}</div>

        <div className="flex flex-col gap-2">{children}</div>
      </div>

      <div
        className={cn(
          "px-4 py-6",
          isCollapsed
            ? "flex flex-col items-center gap-4"
            : "flex flex-row items-center justify-between",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center",
            isCollapsed ? "flex-col gap-4" : "flex-row gap-2",
          )}
        >
          {notifications}
          {userAvatar}
        </div>

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
