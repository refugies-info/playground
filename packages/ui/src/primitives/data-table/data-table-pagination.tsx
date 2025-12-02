"use client";

import type { Table } from "@tanstack/react-table";

import { Button } from "../button/Button";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (pageCount <= maxVisiblePages) {
      for (let i = 0; i < pageCount; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(0);

      let startPage = Math.max(1, pageIndex - 1);
      let endPage = Math.min(pageCount - 2, pageIndex + 1);

      // Adjust start/end to keep visible count consistent
      if (pageIndex <= 2) {
        endPage = 3;
      } else if (pageIndex >= pageCount - 3) {
        startPage = pageCount - 4;
      }

      if (startPage > 1) {
        pages.push(-1); // -1 represents ellipsis
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < pageCount - 2) {
        pages.push(-2); // -2 represents ellipsis
      }

      // Always include last page
      pages.push(pageCount - 1);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        {table.getFilteredRowModel().rows.length} resultat(s)
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Page précédente
        </Button>

        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page) =>
            page < 0 ? (
              <span key={page} className="px-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={pageIndex === page ? "primary" : "outline"}
                size="sm"
                className={pageIndex === page ? "" : "w-9"}
                onClick={() => table.setPageIndex(page)}
              >
                {page + 1}
              </Button>
            ),
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Page suivante
        </Button>
      </div>
    </div>
  );
}
