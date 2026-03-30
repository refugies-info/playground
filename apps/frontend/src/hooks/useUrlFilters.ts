"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Generic hook to manage filters synced with URL search params.
 * Replaces duplicated filter logic in list components.
 *
 * @example
 * ```tsx
 * const { filters, updateFilter, clearFilters, hasActiveFilters } = useUrlFilters({
 *   basePath: "/documents",
 *   initialFilters: { complianceStatus: "", workStatus: "", search: "" },
 * });
 * ```
 */
export interface UseUrlFiltersOptions<T extends Record<string, string>> {
  /** Base path for navigation (e.g., "/documents") */
  basePath: string;
  /** Initial filter values from server-side props */
  initialFilters: T;
}

export interface UseUrlFiltersReturn<T extends Record<string, string>> {
  /** Current filter values (local state, synced with URL) */
  filters: T;
  /** Update a single filter (resets page to 1) */
  updateFilter: (key: keyof T, value: string) => void;
  /** Update multiple filters at once (resets page to 1) */
  updateFilters: (updates: Partial<T>) => void;
  /** Clear all filters (navigates to basePath without params) */
  clearFilters: () => void;
  /** Whether any filter has a non-empty value */
  hasActiveFilters: boolean;
}

export function useUrlFilters<T extends Record<string, string>>({
  basePath,
  initialFilters,
}: UseUrlFiltersOptions<T>): UseUrlFiltersReturn<T> {
  const router = useRouter();
  const [filters, setFilters] = useState<T>(initialFilters);

  // Track if this is the initial mount (skip URL sync on first render)
  const isInitialMount = useRef(true);

  // Track if a clear operation is pending (navigate to basePath without params)
  const pendingClearRef = useRef(false);

  // Set isInitialMount to false after the first render
  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  // Sync filters to URL when they change (effect-based, not in setState)
  useEffect(() => {
    // Skip on initial mount — URL already contains the filters from server
    if (isInitialMount.current) {
      return;
    }

    // If clear was requested, navigate to basePath without params
    if (pendingClearRef.current) {
      pendingClearRef.current = false;
      router.push(basePath);
      return;
    }

    // Build URL params from filters
    const params = new URLSearchParams(window.location.search);

    // Reset to page 1 when filters change
    params.set("page", "1");

    // Update each filter in URL
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    router.push(`${basePath}?${params.toString()}`);
  }, [filters, router, basePath]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((v) => v && v !== "");
  }, [filters]);

  const updateFilters = useCallback((updates: Partial<T>) => {
    setFilters((prev) => ({ ...prev, ...updates }) as T);
  }, []);

  const updateFilter = useCallback(
    (key: keyof T, value: string) => {
      updateFilters({ [key]: value } as Partial<T>);
    },
    [updateFilters],
  );

  const clearFilters = useCallback(() => {
    // Reset to empty filters
    const emptyFilters = Object.fromEntries(
      Object.keys(initialFilters).map((key) => [key, ""]),
    ) as T;
    // Set flag for the effect to navigate to basePath without params
    pendingClearRef.current = true;
    setFilters(emptyFilters);
  }, [initialFilters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    hasActiveFilters,
  };
}
