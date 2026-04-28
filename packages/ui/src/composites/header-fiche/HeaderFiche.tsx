import type * as React from "react";
import { cn } from "../../utils";

/**
 * HeaderFiche — Barre de navigation de l'éditeur de fiche
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1739-8632
 *
 * Layout Figma : row, justify-between, items-center
 * - LEFT  : retour + indication sauvegarde + statut + avatar (gap 24px)
 * - CENTER: titre de la fiche (centré absolument)
 * - RIGHT : prévisualiser + publier (gap 16px)
 *
 * Le composant est un shell de mise en page — le contenu est injecté via slots.
 * Aucune logique métier : tout est géré par le parent (apps/frontend).
 *
 * Usage :
 * ```tsx
 * <HeaderFiche
 *   left={<><BoutonRetour /><IndicationSauvegarde /></>}
 *   center={<span className="text-sm font-medium">Titre de la fiche</span>}
 *   right={<><BoutonPreview /><BoutonPublier /></>}
 * />
 * ```
 */
export interface HeaderFicheProps {
  /** Slot gauche : retour + sauvegarde + statut + avatar */
  left?: React.ReactNode;
  /** Slot centre : titre de la fiche (centré absolument) */
  center?: React.ReactNode;
  /** Slot droite : actions (preview + publish) */
  right?: React.ReactNode;
  className?: string;
}

export function HeaderFiche({
  left,
  center,
  right,
  className,
}: HeaderFicheProps) {
  return (
    <header
      className={cn(
        "grid grid-cols-[1fr_auto_1fr] items-center gap-6",
        "px-6 py-6",
        "bg-[var(--background-default-grey,#fff)]",
        className,
      )}
    >
      {/* LEFT — retour, sauvegarde, statut, avatar */}
      <div className="flex items-center gap-6">{left}</div>

      {/* CENTER — titre, centré mathématiquement grâce à la grid 1fr/auto/1fr */}
      <div className="min-w-0 truncate text-center text-base font-medium text-[var(--text-default-grey,#3a3a3a)]">
        {center}
      </div>

      {/* RIGHT — preview + publish */}
      <div className="flex items-center gap-4 justify-end">{right}</div>
    </header>
  );
}
