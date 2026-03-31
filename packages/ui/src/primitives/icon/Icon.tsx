/**
 * Icon — Wrapper Remix Icons aligné sur les tailles DSFR
 *
 * Utilise remixicon-react (= les mêmes icônes que @gouvfr/dsfr, tree-shakeable).
 *
 * Tailles DSFR :
 *   xs → 12px  (--fr-icon--xs)
 *   sm → 16px  (--fr-icon--sm)
 *   md → 24px  (--fr-icon--md, défaut)
 *   lg → 32px  (--fr-icon--lg)
 *
 * Accessibilité :
 *   - Sans `aria-label` → aria-hidden="true" (icône décorative)
 *   - Avec `aria-label` → role="img" (icône porteuse de sens)
 *
 * Usage :
 *   import { RiArrowRightLine } from "@playground/ui/icons"
 *   <Icon icon={RiArrowRightLine} size="sm" />
 *   <Icon icon={RiArrowRightLine} size="sm" aria-label="Suivant" />
 */

import type { RemixiconComponentType } from "@remixicon/react";

/** Ref vers un composant Remix Icons — le type à utiliser pour les slots icône */
export type IconRef = RemixiconComponentType;

// Correspondance taille DSFR → pixels
export const SIZE_PX = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
} as const;

export type IconSize = keyof typeof SIZE_PX;

export interface IconProps {
  /** Composant icône Remix Icons (import individuel) */
  icon: IconRef;
  /** Taille alignée sur le DS DSFR (défaut : md = 24px) */
  size?: IconSize;
  /** Classe CSS additionnelle */
  className?: string;
  /**
   * Label accessible. Si fourni : role="img" + aria-label.
   * Si absent : aria-hidden="true" (icône décorative).
   */
  "aria-label"?: string;
}

export function Icon({
  icon: IconComponent,
  size = "md",
  className,
  "aria-label": ariaLabel,
}: IconProps) {
  const px = SIZE_PX[size];
  const isDecorative = !ariaLabel;

  return (
    <IconComponent
      size={px}
      color="currentColor"
      className={className}
      aria-hidden={isDecorative ? true : undefined}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
    />
  );
}
