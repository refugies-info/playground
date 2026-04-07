"use client";

import type { Table } from "@tanstack/react-table";
import { Pagination } from "../pagination";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex justify-end py-4">
      <Pagination
        currentPage={pageIndex + 1}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={(page) => table.setPageIndex(page - 1)}
      />
    </div>
  );
}
