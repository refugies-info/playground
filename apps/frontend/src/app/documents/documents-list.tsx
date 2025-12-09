"use client";

import type { Document } from "@playground/shared-types";
import { DataTable } from "@playground/ui/primitives";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { columns } from "./columns";

interface DocumentsListProps {
  initialDocuments: Document[];
  initialFilters: {
    status: string;
    state: string;
    dateFrom: string;
    dateTo: string;
  };
}

export function DocumentsList({
  initialDocuments,
  initialFilters,
}: DocumentsListProps) {
  const router = useRouter();
  // We keep local state for filters to allow immediate UI feedback if needed,
  // but mostly we rely on URL params.
  const [filters, setFilters] = useState(initialFilters);

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    // We keep page size consistent
    params.set("page", "1");
    params.set("pageSize", "50");

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
                  <option value="">Status</option>
                  <option value="accepted">Accepté</option>
                  <option value="rejected">Rejeté</option>
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
                  <option value="">État</option>
                  <option value="draft">Brouillon</option>
                  <option value="to_process">En attente</option>
                  <option value="archived">Archivé</option>
                  <option value="published">Publié</option>
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
        <DataTable columns={columns} data={initialDocuments} pageSize={50} />
      </div>
    </div>
  );
}
