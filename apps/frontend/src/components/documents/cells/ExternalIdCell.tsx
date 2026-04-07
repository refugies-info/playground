"use client";

import { EmptyDash } from "@playground/ui/composites";
import { RiInformation2Line } from "@playground/ui/icons";
import { Icon } from "@playground/ui/primitives";
import * as React from "react";

interface ExternalIdCellProps {
  externalId: string | null | undefined;
}

/**
 * Cellule ID — chip icône sur fond alt-grey.
 *
 * @figma node I1255:8756;1256:7369 — bg alt-grey (#F6F6F6), border-radius 4px, padding 4px, icône 16px
 *
 * - Survol  : title natif navigateur "Cliquez pour copier l'ID"
 * - Clic    : copie dans le presse-papier + tooltip "ID copié dans votre presse-papier"
 */
export const ExternalIdCell = ({ externalId }: ExternalIdCellProps) => {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  if (!externalId) return <EmptyDash />;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(externalId);
    setCopied(true);
  };

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={handleCopy}
        title="Cliquez pour copier l'ID"
        className="inline-flex items-center justify-center text-[var(--text-mention-grey)] rounded p-1 bg-[var(--background-alt-grey)] transition-colors hover:bg-[var(--background-contrast-grey)] cursor-pointer"
        aria-label="Copier l'identifiant externe"
      >
        <Icon icon={RiInformation2Line} size={16} />
      </button>

      {copied && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 whitespace-nowrap px-2 py-1 text-xs  bg-white shadow-sm pointer-events-none">
          ID copié
          {/* Petite flèche vers le bas */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--white)]" />
        </div>
      )}
    </div>
  );
};
ExternalIdCell.displayName = "ExternalIdCell";
