"use client";

import type { OnlineStatus } from "@playground/shared-types";
import { EmptyDash } from "@playground/ui/composites";
import { Tag } from "@playground/ui/primitives";
import { RiExternalLinkLine } from "@remixicon/react";
import { formatDateFr } from "@/lib/format-date";

export interface OnlineStatusCellProps {
  status: OnlineStatus | undefined;
  /** URL de la fiche publiée sur RI — affiche l'icône lien externe si fournie */
  publishedUrl?: string | null;
  /** Date à afficher sous le badge quand le statut est "published" */
  publishedDate?: string | null;
  /** Date à afficher sous le badge quand le statut est "archived" */
  archivedDate?: string | null;
  /**
   * La date d'archivage est reconstituée, pas enregistrée (RI-1446) : on la
   * préfixe alors d'un « ~ » pour ne pas la faire passer pour une date certaine.
   */
  archivedDateIsApproximate?: boolean;
}

export const OnlineStatusCell = ({
  status,
  publishedUrl,
  publishedDate,
  archivedDate,
  archivedDateIsApproximate,
}: OnlineStatusCellProps) => {
  if (!status) return <EmptyDash />;

  if (status === "published") {
    const formattedDate = formatDateFr(publishedDate);

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

  if (status === "archived") {
    const formattedDate = formatDateFr(archivedDate);

    return (
      <div className="flex flex-col gap-0.5">
        <Tag status="archive" />
        {formattedDate && (
          <span
            className="text-[12px] leading-5 text-(--text-disabled-grey)"
            title={
              archivedDateIsApproximate
                ? "Date approximative : cette fiche a été archivée avant que le back-office n'enregistre les dates d'archivage."
                : undefined
            }
          >
            {archivedDateIsApproximate ? `~ ${formattedDate}` : formattedDate}
          </span>
        )}
      </div>
    );
  }

  // unpublished — pas de variant Tag dédié
  return <Tag status="na">Non publié</Tag>;
};
OnlineStatusCell.displayName = "OnlineStatusCell";
