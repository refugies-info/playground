import type { RemixiconComponentType } from "@remixicon/react";

import { cn } from "../../utils";

/**
 * Couleurs sémantiques d'une pastille (fond + texte), exprimées via les
 * tokens DSFR. Source unique pour colorer une pastille hors workflow
 * (journal d'activités, statuts système, …).
 */
export interface BadgeColors {
  /** Classe de fond — token DSFR `--background-*`. */
  bg: string;
  /** Classe de texte — token DSFR `--text-*`. */
  fg: string;
}

export const BADGE_GREY: BadgeColors = {
  bg: "bg-(--background-contrast-grey)",
  fg: "text-(--text-default-grey)",
};
export const BADGE_SUCCESS: BadgeColors = {
  bg: "bg-(--background-flat-success)",
  fg: "text-(--text-inverted-grey)",
};
export const BADGE_ERROR: BadgeColors = {
  bg: "bg-(--background-flat-error)",
  fg: "text-(--text-inverted-grey)",
};
export const BADGE_INFO: BadgeColors = {
  bg: "bg-(--background-flat-info)",
  fg: "text-(--text-inverted-grey)",
};

export interface IconBadgeProps {
  /** Icône Remix (= icône DSFR) affichée au centre. */
  icon: RemixiconComponentType;
  /** Couleurs de la pastille. Défaut : gris. */
  colors?: BadgeColors;
  /** Infobulle / libellé accessible. */
  title?: string;
  className?: string;
}

/**
 * Pastille ronde contenant une icône, colorée selon les tokens DSFR.
 */
export function IconBadge({
  icon: Icon,
  colors = BADGE_GREY,
  title,
  className,
}: IconBadgeProps) {
  return (
    <div
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full border-[0.6px] border-(--border-default-grey)",
        colors.bg,
        colors.fg,
        className,
      )}
      title={title}
    >
      <Icon size={12} color="currentColor" />
    </div>
  );
}
