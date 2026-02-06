"use client";

import type { Document, DocumentSortField } from "@playground/shared-types";
import { DataTable } from "@playground/ui/primitives";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppPaginationControls } from "@/components/common/app-pagination";
import { STATE_CONFIG } from "@/lib/document-labels";
import { columns } from "./columns";

interface DocumentsListProps {
  initialDocuments: Document[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  sortBy: DocumentSortField;
  sortOrder: "asc" | "desc";
  initialFilters: {
    status: string;
    state: string;
    dateFrom: string;
    dateTo: string;
  };
}

export function DocumentsList({
  initialDocuments,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  sortBy,
  sortOrder,
  initialFilters,
}: DocumentsListProps) {
  const router = useRouter();
  // We keep local state for filters to allow immediate UI feedback if needed,
  // but mostly we rely on URL params.
  const [filters, setFilters] = useState(initialFilters);

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    // Reset to page 1 when filters change
    params.set("page", "1");

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`/documents?${params.toString()}`);
  };

  const clearFilters = () => {
    const emptyFilters = {
      status: "",
      state: "",
      dateFrom: "",
      dateTo: "",
    };
    setFilters(emptyFilters);
    router.push("/documents");
  };

  return (
    <div className="w-full h-full p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Documents</h1>
      </div>

      <div className="">
        <div className=" border rounded mb-8 bg-white">
          <div className="px-4 py-3 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    updateFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">État</option>
                  <option value="compliant">Conforme</option>
                  <option value="non_compliant">Non conforme</option>
                </select>
              </div>
              <div>
                <select
                  value={filters.state}
                  onChange={(e) =>
                    updateFilters({ ...filters, state: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">Traitement</option>
                  {Object.entries(STATE_CONFIG)
                    .filter(
                      ([_key, config], index, array) =>
                        // Garder seulement la première occurrence de chaque label
                        array.findIndex(([, c]) => c.label === config.label) ===
                        index,
                    )
                    .map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="dateFrom" className="text-sm font-medium">
                  De
                </label>
                <input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    updateFilters({ ...filters, dateFrom: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="dateTo" className="text-sm font-medium">
                  à
                </label>
                <input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    updateFilters({ ...filters, dateTo: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>
            {(filters.status ||
              filters.state ||
              filters.dateFrom ||
              filters.dateTo) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Re-initialiser les filtres
              </button>
            )}
          </div>
        </div>
        <DataTable
          columns={columns}
          data={initialDocuments}
          pageSize={pageSize}
          onRowClick={(row) => router.push(`/documents/${row.id}`)}
          manualPagination
          manualSorting
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(newSortBy, newSortOrder) => {
            const params = new URLSearchParams(window.location.search);
            params.set("sortBy", newSortBy);
            params.set("sortOrder", newSortOrder);
            // Reset to page 1 when sorting changes
            params.set("page", "1");
            router.push(`/documents?${params.toString()}`);
          }}
        />

        {/* Custom server-side pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-gray-700">
              Page {currentPage} sur {totalPages} ({totalCount} document
              {totalCount > 1 ? "s" : ""})
            </div>
            <div className="flex gap-2">
              <AppPaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
