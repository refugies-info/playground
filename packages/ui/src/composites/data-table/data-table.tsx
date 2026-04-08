"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";
import { DataTablePagination } from "./data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  manualPagination?: boolean;
  manualSorting?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  getRowClassName?: (row: TData) => string | undefined;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 10,
  onRowClick,
  manualPagination = false,
  manualSorting = false,
  sortBy,
  sortOrder,
  onSortChange,
  getRowClassName,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(
    sortBy && sortOrder ? [{ id: sortBy, desc: sortOrder === "desc" }] : [],
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination
      ? undefined
      : getPaginationRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: manualSorting
      ? (updater) => {
          const newSorting =
            typeof updater === "function" ? updater(sorting) : updater;
          setSorting(newSorting);
          if (onSortChange && newSorting.length > 0) {
            const sort = newSorting[0];
            onSortChange(sort.id, sort.desc ? "desc" : "asc");
          }
        }
      : setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
    manualPagination,
    manualSorting,
  });

  return (
    <div className="w-full">
      <Table className="bg-white">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    style={{
                      width:
                        header.getSize() !== 150 ? header.getSize() : undefined,
                      maxWidth:
                        header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, index) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                // Figma Zébré=on : lignes paires → alt-blue-france (#F5F5FE)
                data-zebra={index % 2 === 1 ? "true" : undefined}
                onClick={
                  onRowClick ? () => onRowClick(row.original) : undefined
                }
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onRowClick(row.original);
                        }
                      }
                    : undefined
                }
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                className={[
                  onRowClick ? "cursor-pointer" : undefined,
                  getRowClassName ? getRowClassName(row.original) : undefined,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {row.getVisibleCells().map((cell) => {
                  const fixedSize =
                    cell.column.getSize() !== 150
                      ? cell.column.getSize()
                      : undefined;
                  const metaClassName = (
                    cell.column.columnDef.meta as
                      | { className?: string }
                      | undefined
                  )?.className;
                  return (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: fixedSize,
                        maxWidth: fixedSize,
                      }}
                      className={metaClassName}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-gray-500 text-lg font-medium">
                    Aucune fiche trouvée
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Essayez d'ajuster vos filtres ou critères de recherche
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {!manualPagination && <DataTablePagination table={table} />}
    </div>
  );
}
