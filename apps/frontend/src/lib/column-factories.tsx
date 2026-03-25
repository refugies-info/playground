"use client";

import {
  DataTableColumnHeader,
  DateCell,
  TextCell,
} from "@playground/ui/primitives";
import type { ColumnDef } from "@tanstack/react-table";

/**
 * Generic column factory utilities for TanStack Table.
 * These are data-agnostic and can be used with any row type.
 * Cell rendering is delegated to named components from @playground/ui.
 */

// =============================================================================
// Generic Column Factories
// =============================================================================

export interface TextColumnOptions<T> {
  accessorKey: string;
  title: string;
  getValue: (row: T) => string | null | undefined;
  className?: string;
}

export const createTextColumn = <T,>(
  options: TextColumnOptions<T>,
): ColumnDef<T> => ({
  accessorKey: options.accessorKey,
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title={options.title} />
  ),
  cell: ({ row }) => (
    <TextCell
      value={options.getValue(row.original as T)}
      className={options.className}
    />
  ),
});

export interface DateColumnOptions<T> {
  accessorKey: string;
  title: string;
  getValue: (row: T) => string | null | undefined;
  showTime?: boolean;
}

export const createDateColumn = <T,>(
  options: DateColumnOptions<T>,
): ColumnDef<T> => ({
  accessorKey: options.accessorKey,
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title={options.title} />
  ),
  cell: ({ row }) => (
    <DateCell
      value={options.getValue(row.original as T)}
      showTime={options.showTime}
    />
  ),
});
