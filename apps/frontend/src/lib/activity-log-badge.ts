import type { ActivityLogType } from "@playground/shared-types";
import {
  TYPE_ARCHIVE,
  TYPE_ASSIGNMENT,
  TYPE_CLEAR_LANGUAGE,
  TYPE_COMPLIANCE_HUMAN,
  TYPE_COMPLIANCE_IA,
  TYPE_NOTE,
  TYPE_PUBLICATION,
  TYPE_PUBLICATION_LANGUE,
  TYPE_TRANSLATION,
  TYPE_TRANSLATION_ERROR,
  TYPE_TRANSLATION_PRIORITY,
  TYPE_UPDATE,
  TYPE_UPDATE_COMPLIANCE,
} from "@playground/shared-types";
import {
  BADGE_ERROR,
  BADGE_INFO,
  BADGE_SUCCESS,
  type BadgeColors,
} from "@playground/ui/primitives";
import type { RemixiconComponentType } from "@remixicon/react";
import {
  RiAuctionLine,
  RiFileTextLine,
  RiGlobalLine,
  RiPencilLine,
  RiTranslate2,
  RiUserLine,
} from "@remixicon/react";

/**
 * Type d'événement → icône et couleurs de sa pastille (tokens DSFR).
 *
 * Source unique partagée par le journal d'activités et le panneau de
 * notifications : les deux affichent le même événement, ils doivent le
 * représenter pareil.
 *
 * Indexé sur `activity_log_action` (13 valeurs) et non sur le type de
 * notification (5) : c'est la granularité qui distingue une mise à jour simple
 * d'une mise à jour avec verdict de conformité.
 */
export interface TypeBadge {
  icon: RemixiconComponentType;
  colors?: BadgeColors;
}

export const TYPE_BADGE: Record<ActivityLogType, TypeBadge> = {
  [TYPE_COMPLIANCE_IA]: { icon: RiAuctionLine },
  [TYPE_COMPLIANCE_HUMAN]: { icon: RiAuctionLine },
  [TYPE_UPDATE_COMPLIANCE]: { icon: RiAuctionLine },
  [TYPE_ASSIGNMENT]: { icon: RiUserLine },
  [TYPE_CLEAR_LANGUAGE]: { icon: RiFileTextLine },
  [TYPE_NOTE]: { icon: RiPencilLine },
  [TYPE_TRANSLATION]: { icon: RiTranslate2 },
  [TYPE_TRANSLATION_PRIORITY]: { icon: RiTranslate2 },
  [TYPE_TRANSLATION_ERROR]: { icon: RiTranslate2 },
  [TYPE_UPDATE]: { icon: RiGlobalLine, colors: BADGE_INFO },
  [TYPE_PUBLICATION]: { icon: RiGlobalLine, colors: BADGE_SUCCESS },
  [TYPE_PUBLICATION_LANGUE]: { icon: RiGlobalLine, colors: BADGE_SUCCESS },
  [TYPE_ARCHIVE]: { icon: RiGlobalLine, colors: BADGE_ERROR },
};

export const DEFAULT_BADGE: TypeBadge = { icon: RiFileTextLine };

/** Pastille d'un événement, avec repli pour une action inconnue. */
export function getTypeBadge(action: ActivityLogType): TypeBadge {
  return TYPE_BADGE[action] ?? DEFAULT_BADGE;
}
