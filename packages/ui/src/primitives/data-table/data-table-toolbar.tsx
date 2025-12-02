"use client";

import type { Table } from "@tanstack/react-table";

import { Button } from "../button/Button";
import { Input } from "../input/Input";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onClearFilters?: () => void;
}

export function DataTableToolbar<TData>({
  table,
  onClearFilters,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search documents..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
      </div>
      {isFiltered && (
        <Button
          variant="ghost"
          onClick={onClearFilters}
          className="h-8 px-2 lg:px-3"
        >
          Clear Filters
          <span className="ml-2">✕</span>
        </Button>
      )}
    </div>
  );
}
