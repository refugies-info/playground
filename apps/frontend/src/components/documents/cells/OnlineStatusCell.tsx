"use client";

import type { OnlineStatus } from "@playground/shared-types";
import { EmptyDash } from "@playground/ui/composites";
import { Tag } from "@playground/ui/primitives";
import { RiExternalLinkLine } from "@remixicon/react";

export interface OnlineStatusCellProps {
  status: OnlineStatus | undefined;
  /** URL de la fiche publiée sur RI — affiche l'icône lien externe si fournie */
  publishedUrl?: string | null;
}

export const OnlineStatusCell = ({
  status,
  publishedUrl,
}: OnlineStatusCellProps) => {
  if (!status) return <EmptyDash />;

  if (status === "published") {
    return (
      <div className="flex items-center gap-2">
        <Tag status="publie" />
        {publishedUrl && (
          <a
            href={publishedUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Voir la fiche publiée sur Réfugiés.info (nouvelle fenêtre)"
            // Empêche le row-click de la table de se déclencher
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center w-5 h-5 shrink-0"
          >
            <RiExternalLinkLine
              className="w-[15px] h-[15px] text-[#27A658]"
              aria-hidden="true"
            />
          </a>
        )}
      </div>
    );
  }

  if (status === "archived") return <Tag status="archive" />;

  // unpublished — pas de variant Tag dédié
  return <Tag status="na">Non publié</Tag>;
};
OnlineStatusCell.displayName = "OnlineStatusCell";
