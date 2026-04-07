"use client";

import { RiArrowLeftSLine, RiArrowRightSLine } from "../icons";
import { Button } from "../primitives/button/Button";
import { cn } from "../utils/cn";

/**
 * Navigation entre pages — style Figma (node 1380:5898).
 *
 * Affiche "X–Y sur Z" avec boutons précédent/suivant icône seule.
 * Container bordé (1px --border-default-grey, radius 2px), boutons CTA Quatrième.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1380-5898
 */
export interface PaginationProps {
  /** Page courante (1-indexé) */
  currentPage: number;
  /** Nombre d'éléments par page */
  pageSize: number;
  /** Nombre total d'éléments */
  totalCount: number;
  /** Appelé avec le nouveau numéro de page */
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  className,
}: PaginationProps) {
  const start = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);
  const totalPages = Math.ceil(totalCount / pageSize);

  const canPrevious = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div
      className={cn(
        "inline-flex items-center",
        "bg-white border border-[var(--border-default-grey,#DDDDDD)] rounded-[2px]",
        className,
      )}
    >
      {/* Range info — séparateur droit vers les boutons */}
      <div className="flex items-center self-stretch px-2 border-r border-[var(--border-default-grey,#DDDDDD)]">
        <span className="text-sm text-[var(--text-default-grey,#3A3A3A)] whitespace-nowrap">
          {totalCount === 0 ? (
            "0 résultat"
          ) : (
            <>
              <b>
                {start}-{end}
              </b>{" "}
              sur {totalCount}
            </>
          )}
        </span>
      </div>

      {/* Bouton précédent */}
      <Button
        variant="quatrieme"
        size="sm"
        leftIcon={RiArrowLeftSLine}
        aria-label="Page précédente"
        disabled={!canPrevious}
        onClick={() => onPageChange(currentPage - 1)}
      />

      {/* Bouton suivant */}
      <Button
        variant="quatrieme"
        size="sm"
        leftIcon={RiArrowRightSLine}
        aria-label="Page suivante"
        disabled={!canNext}
        onClick={() => onPageChange(currentPage + 1)}
      />
    </div>
  );
}
