"use client";

import type { OnlineStatus } from "@playground/shared-types";
import { EmptyDash } from "@playground/ui/composites";
import { Tag } from "@playground/ui/primitives";
import { RiExternalLinkLine } from "@remixicon/react";

export interface OnlineStatusCellProps {
  status: OnlineStatus | undefined;
  /** URL de la fiche publiée sur RI — affiche l'icône lien externe si fournie */
  publishedUrl?: string | null;
  /** Date à afficher sous le badge quand le statut est "published" */
  publishedDate?: string | null;
}

export const OnlineStatusCell = ({
  status,
  publishedUrl,
  publishedDate,
}: OnlineStatusCellProps) => {
  if (!status) return <EmptyDash />;

  if (status === "published") {
    const formattedDate = publishedDate
      ? new Date(publishedDate).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : null;

    return (
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-0.5">
          <Tag status="publie" />
          {formattedDate && (
            <span className="text-[12px] leading-5 text-(--text-disabled-grey)">
              {formattedDate}
            </span>
          )}
        </div>
        {publishedUrl && (
          <a
            href={publishedUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Voir la fiche publiée sur Réfugiés.info (nouvelle fenêtre)"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center w-5 h-5 shrink-0 mt-0.5"
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
