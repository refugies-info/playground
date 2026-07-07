"use client";

import { Pagination } from "@playground/ui/composites";
import { usePathname, useRouter } from "next/navigation";

interface AppPaginationControlsProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  className?: string;
}

export function AppPaginationControls({
  currentPage,
  pageSize,
  totalCount,
  className,
}: AppPaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Pagination
      currentPage={currentPage}
      pageSize={pageSize}
      totalCount={totalCount}
      onPageChange={handlePageChange}
      className={className}
    />
  );
}
