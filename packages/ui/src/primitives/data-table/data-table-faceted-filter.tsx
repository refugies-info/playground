"use client";

import * as React from "react";
import { Column } from "@tanstack/react-table";

import { Button } from "../button/Button";
import { cn } from "../../utils/cn";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
  }[];
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = React.useMemo(() => {
    if (!column) return new Map();
    const map = new Map<string, number>();
    return map;
  }, [column]);

  const selectedValues = new Set(
    column?.getFilterValue() as string[] | undefined
  );

  return (
    <div className="space-y-2">
      {title && <p className="text-sm font-medium">{title}</p>}
      <div className="space-y-1">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedValues.has(option.value)}
              onChange={(e) => {
                if (e.target.checked) {
                  selectedValues.add(option.value);
                } else {
                  selectedValues.delete(option.value);
                }
                const filterValues = Array.from(selectedValues);
                column?.setFilterValue(
                  filterValues.length ? filterValues : undefined
                );
              }}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm">{option.label}</span>
            {facets?.get(option.value) && (
              <span className="ml-auto text-xs text-gray-500">
                ({facets.get(option.value)})
              </span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
