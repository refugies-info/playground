"use client";

import type { Document, DocumentSortField } from "@playground/shared-types";
import { DataTable } from "@playground/ui/primitives";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppPaginationControls } from "@/components/common/app-pagination";
import { createClient } from "@/lib/supabase/client";
import { columns } from "./columns";

// Duration must match the Tailwind animation duration used in getRowClassName (duration-1000)
const HIGHLIGHT_ANIMATION_DURATION_MS = 1000;

interface DocumentsListProps {
  initialDocuments: Document[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  sortBy: DocumentSortField;
  sortOrder: "asc" | "desc";
  initialFilters: {
    complianceStatus?: string;
    workStatus?: string;
    onlineStatus?: string;
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

  // Track documents locally to detect changes for animation
  const [documents, setDocuments] = useState(initialDocuments);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const prevDocumentsRef = useRef<Document[]>(initialDocuments);

  // Detect document changes and trigger animations
  useEffect(() => {
    const prevDocs = prevDocumentsRef.current;
    const newDocs = initialDocuments;

    // Find IDs that changed or are new
    const changedIds = new Set<string>();

    // Use Map for O(1) lookup instead of O(n) find in loop
    const prevDocsMap = new Map(prevDocs.map((doc) => [doc.id, doc]));

    // Check for new or modified documents
    for (const doc of newDocs) {
      const prevDoc = prevDocsMap.get(doc.id);
      if (!prevDoc) {
        // New document
        changedIds.add(doc.id);
      } else if (
        prevDoc.workStatus !== doc.workStatus ||
        prevDoc.onlineStatus !== doc.onlineStatus ||
        prevDoc.complianceStatus !== doc.complianceStatus ||
        prevDoc.title !== doc.title
      ) {
        // Modified document
        changedIds.add(doc.id);
      }
    }

    if (changedIds.size > 0) {
      setHighlightedIds(changedIds);
      setDocuments(newDocs);
      prevDocumentsRef.current = newDocs;

      // Clear highlight after animation completes
      const timer = setTimeout(() => {
        setHighlightedIds(new Set());
      }, HIGHLIGHT_ANIMATION_DURATION_MS);

      return () => clearTimeout(timer);
    } else {
      setDocuments(newDocs);
      prevDocumentsRef.current = newDocs;
    }
  }, [initialDocuments]);

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    // Preserve existing URL params (sortBy, sortOrder) while updating filters
    const params = new URLSearchParams(window.location.search);
    // Reset to page 1 when filters change
    params.set("page", "1");

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/documents?${params.toString()}`);
  };

  const clearFilters = () => {
    const emptyFilters = {
      complianceStatus: "",
      workStatus: "",
      onlineStatus: "",
      dateFrom: "",
      dateTo: "",
    };
    setFilters(emptyFilters);
    router.push("/documents");
  };

  // Supabase Realtime: refresh when workflows change
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("workflows-realtime")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "workflows",
        },
        () => {
          // Refresh server data when workflows change
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return (
    <div className="w-full h-full p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Documents</h1>
      </div>

      <div className="">
        <div className=" border rounded mb-8 bg-white">
          <div className="px-4 py-3 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <select
                  value={filters.complianceStatus || ""}
                  onChange={(e) =>
                    updateFilters({
                      ...filters,
                      complianceStatus: e.target.value,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">Conformité</option>
                  <option value="pending">En cours</option>
                  <option value="compliant">Conforme</option>
                  <option value="non_compliant">Non conforme</option>
                  <option value="error">Erreur</option>
                </select>
              </div>
              <div>
                <select
                  value={filters.onlineStatus || ""}
                  onChange={(e) =>
                    updateFilters({ ...filters, onlineStatus: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">Visibilité</option>
                  <option value="published">Publié</option>
                  <option value="unpublished">Non publié</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
              <div>
                <select
                  value={filters.workStatus || ""}
                  onChange={(e) =>
                    updateFilters({ ...filters, workStatus: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">Traitement</option>
                  <option value="draft">Brouillon</option>
                  <option value="to_process">À traiter</option>
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
            {(filters.complianceStatus ||
              filters.workStatus ||
              filters.onlineStatus ||
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
          data={documents}
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
          getRowClassName={(row) =>
            highlightedIds.has(row.id)
              ? "animate-highlight bg-yellow-50 transition-colors duration-1000"
              : undefined
          }
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
