import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSkipLeftLine,
  RiSkipRightLine,
} from "../icons";
import { Button } from "../primitives/button/Button";

/**
 * Pagination numérotée — calquée sur le DSFR (première, précédente, numéros
 * avec ellipses, suivante, dernière).
 *
 * @see https://www.systeme-de-design.gouv.fr/version-courante/fr/composants/pagination/design-de-la-pagination
 */
export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

type PageItem = number | "ellipsis";

/** First two, middle, last two and current ±1, with an ellipsis for each gap. */
export function getPageItems(
  currentPage: number,
  totalPages: number,
): PageItem[] {
  const pages = [
    1,
    2,
    Math.ceil(totalPages / 2),
    currentPage - 1,
    currentPage,
    currentPage + 1,
    totalPages - 1,
    totalPages,
  ]
    .filter((page) => page >= 1 && page <= totalPages)
    .filter((page, index, all) => all.indexOf(page) === index)
    .sort((a, b) => a - b);

  return pages.flatMap((page, index) =>
    index > 0 && page - pages[index - 1] > 1
      ? (["ellipsis", page] as PageItem[])
      : [page],
  );
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationControlsProps) {
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  return (
    <nav aria-label="Pagination" className={className}>
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          <Button
            variant="quatrieme"
            size="sm"
            leftIcon={RiSkipLeftLine}
            aria-label="Première page"
            disabled={isFirst}
            onClick={() => onPageChange(1)}
          />
        </li>
        <li>
          <Button
            variant="quatrieme"
            size="sm"
            leftIcon={RiArrowLeftSLine}
            disabled={isFirst}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Page précédente
          </Button>
        </li>
        {getPageItems(currentPage, totalPages).map((item, index) =>
          item === "ellipsis" ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: up to two static ellipses
            <li key={`ellipsis-${index}`} className="px-2 text-sm">
              …
            </li>
          ) : (
            <li key={item}>
              <Button
                variant={item === currentPage ? "primaire" : "quatrieme"}
                size="sm"
                aria-current={item === currentPage ? "page" : undefined}
                aria-label={`Page ${item}`}
                onClick={() => onPageChange(item)}
                className="min-w-8 justify-center"
              >
                {item}
              </Button>
            </li>
          ),
        )}
        <li>
          <Button
            variant="quatrieme"
            size="sm"
            rightIcon={RiArrowRightSLine}
            disabled={isLast}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Page suivante
          </Button>
        </li>
        <li>
          <Button
            variant="quatrieme"
            size="sm"
            leftIcon={RiSkipRightLine}
            aria-label="Dernière page"
            disabled={isLast}
            onClick={() => onPageChange(totalPages)}
          />
        </li>
      </ul>
    </nav>
  );
}
