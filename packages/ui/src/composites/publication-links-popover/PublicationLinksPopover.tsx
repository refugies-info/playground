"use client";

import type * as React from "react";
import { RiExternalLinkLine, RiLoaderLine } from "../../icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../overlays/popover";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LanguagePublicationStatus {
  code: string;
  label: string;
  publishedUrl: string | null;
}

export interface PublicationLinksPopoverProps {
  /** Liste complète des langues avec leur URL de publication (null = non publié). */
  languages: LanguagePublicationStatus[];
  /** Affiche un spinner à la place de la liste pendant le chargement. */
  isLoading?: boolean;
  /** Le trigger de la popover (typiquement le Tag "Publié"). */
  children: React.ReactNode;
  /**
   * Callback appelé à l'ouverture/fermeture de la popover.
   * Utiliser pour du fetch lazy : charger les données uniquement à l'ouverture.
   */
  onOpenChange?: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Indicateurs visuels — hoistés au niveau module
// ---------------------------------------------------------------------------

// Rond vert au repos (Figma : 8px, --text-default-success)
const GREEN_DOT = (
  <span className="w-2 h-2 rounded-full bg-[var(--text-default-success,#18753c)] shrink-0 block" />
);

// Icône lien externe au hover
const ICON_EXTERNAL = (
  <RiExternalLinkLine className="w-4 h-4 shrink-0 text-[var(--text-default-grey,#3a3a3a)]" />
);

// ---------------------------------------------------------------------------
// Sous-composant LanguageRow — hoisté au niveau module
// ---------------------------------------------------------------------------

/**
 * LanguageRow — Affiche une langue dans la liste de publication.
 *
 * - Publié    : <button> cliquable, texte foncé (#3A3A3A medium), rond vert à droite
 * - Non publié : <div> statique, texte grisé (#929292 medium), pas d'indicateur
 *
 * Paddings Figma :
 *   - publié     (layout_KL57TV) : padding 4px 8px, justify-between
 *   - non publié (layout_JSZJJD) : padding 4px 8px
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1812-7566
 */
function LanguageRow({
  label,
  publishedUrl,
}: {
  label: string;
  publishedUrl: string | null;
}) {
  if (!publishedUrl) {
    return (
      <div className="flex items-center py-1 px-2">
        <span className="text-sm font-medium text-[var(--text-disabled-grey,#929292)]">
          {label}
        </span>
      </div>
    );
  }

  const handleClick = () =>
    window.open(publishedUrl, "_blank", "noopener,noreferrer");

  return (
    <button
      type="button"
      className="group flex w-full items-center justify-between rounded-xs py-1 px-2 hover:bg-[#f6f6f6] transition-colors"
      onClick={handleClick}
    >
      <span className="text-sm font-medium text-[var(--text-default-grey,#3a3a3a)]">
        {label}
      </span>
      {/* Rond vert au repos, lien externe au hover — crossfade via group */}
      <span className="flex items-center">
        <span className="group-hover:hidden">{GREEN_DOT}</span>
        <span className="hidden group-hover:flex">{ICON_EXTERNAL}</span>
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

/**
 * PublicationLinksPopover — Popover de statut de publication multi-langues.
 *
 * Affiche la liste de toutes les langues RI avec :
 *   - les langues publiées (lien cliquable, rond vert à droite)
 *   - les langues non publiées (texte grisé, non cliquable)
 *
 * Paddings Figma (node 1842-8998) :
 *   - Root         (layout_Z77DOF)  : pb-2, w-[155px]
 *   - Header       (layout_CJ5N30)  : pt-2 pb-1 (gap 4px entre texte et séparateur)
 *   - Texte header (layout_2Z1TJV)  : px-4 (16px H)
 *   - Body         (layout_OE92BO)  : px-2 pb-2 (8px H, 8px bottom)
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1842-8998
 */
export function PublicationLinksPopover({
  languages,
  isLoading = false,
  onOpenChange,
  children,
}: PublicationLinksPopoverProps) {
  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {/* <button> = élément interactif requis pour que Radix asChild fonctionne */}
        <button
          type="button"
          className="cursor-pointer inline-flex bg-transparent border-0 p-0 leading-none focus-visible:outline-none"
        >
          {children}
        </button>
      </PopoverTrigger>

      {/* w-[155px] pb-2 = largeur + padding-bottom Figma (layout_Z77DOF : 0 0 8px, width 155) */}
      <PopoverContent
        variant="default"
        align="start"
        className="w-[155px] p-0 pb-2"
      >
        {/* Header — layout_CJ5N30 : column, gap-1 (4px), pt-2 pb-1
            Le séparateur est DANS le header (gap entre texte et ligne) */}
        <div className="flex flex-col gap-1 pt-2 pb-1">
          <span className="block px-4 text-sm text-[var(--text-default-grey,#3a3a3a)]">
            Publié en ...
          </span>
          <hr className="border-[var(--border-default-grey,#dddddd)]" />
        </div>

        {/* Corps — layout_OE92BO : px-2, pas de padding vertical (pb vient du root) */}
        <div className="px-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <RiLoaderLine className="w-5 h-5 animate-spin text-[var(--text-mention-grey)]" />
            </div>
          ) : (
            languages.map((lang) => (
              <LanguageRow
                key={lang.code}
                label={lang.label}
                publishedUrl={lang.publishedUrl}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
