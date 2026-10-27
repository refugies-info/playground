"use client";

import { Pagination, PaginationControls } from "@playground/ui/composites";
import { usePathname, useRouter } from "next/navigation";

interface AppPaginationControlsProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  /** DSFR numbered pagination (page links) instead of the compact range. */
  numbered?: boolean;
  className?: string;
}

export function AppPaginationControls({
  currentPage,
  pageSize,
  totalCount,
  numbered = false,
  className,
}: AppPaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  return numbered ? (
    <PaginationControls
      currentPage={currentPage}
      totalPages={Math.ceil(totalCount / pageSize)}
      onPageChange={handlePageChange}
      className={className}
    />
  ) : (
    <Pagination
      currentPage={currentPage}
      pageSize={pageSize}
      totalCount={totalCount}
      onPageChange={handlePageChange}
      className={className}
    />
  );
}
