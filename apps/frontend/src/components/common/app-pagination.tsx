"use client";

import { PaginationControls } from "@playground/ui/composites";
import { usePathname, useRouter } from "next/navigation";

interface AppPaginationControlsProps {
  currentPage: number;
  totalPages: number;
  className?: string;
}

export function AppPaginationControls({
  currentPage,
  totalPages,
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
    <PaginationControls
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      className={className}
    />
  );
}
