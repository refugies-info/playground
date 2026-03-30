"use client";

import type { Document, DocumentSortField } from "@playground/shared-types";
import { SearchInput, TooltipProvider } from "@playground/ui";
import { DataTable } from "@playground/ui/primitives";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppPaginationControls } from "@/components/common/app-pagination";
import { useUrlFilters } from "@/hooks/useUrlFilters";
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
    authorEmail: string;
    search: string;
  };
  initialAuthors: { email: string; displayName: string }[];
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
  initialAuthors,
}: DocumentsListProps) {
  const router = useRouter();

  // Use the shared hook for filter state + URL sync
  const { filters, updateFilter, clearFilters, hasActiveFilters } =
    useUrlFilters({
      basePath: "/documents",
      initialFilters,
    });

  // Track documents locally to detect changes for animation
  const [documents, setDocuments] = useState(initialDocuments);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const prevDocumentsRef = useRef<Document[]>(initialDocuments);
  // Flag set by the Realtime callback — animation only fires for live DB changes,
  // not for sort/filter/page navigation (which would falsely highlight every row).
  const isRealtimeUpdateRef = useRef(false);

  // Detect document changes and trigger animations
  useEffect(() => {
    const newDocs = initialDocuments;

    // Only animate when the refresh was triggered by a Realtime event,
    // not by a user sort/filter/page action.
    if (!isRealtimeUpdateRef.current) {
      setDocuments(newDocs);
      prevDocumentsRef.current = newDocs;
      return;
    }
    isRealtimeUpdateRef.current = false;

    const prevDocs = prevDocumentsRef.current;

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
          // Flag the refresh as coming from Realtime so the animation fires
          isRealtimeUpdateRef.current = true;
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
        <div className=" border rounded mb-8 bg-white p-4 flex flex-col items-start gap-2">
          <div className="grid grid-cols-1 md:grid-cols-8 gap-4 w-full">
            <SearchInput
              value={filters.search}
              onChange={(value) => updateFilter("search", value)}
              placeholder="Rechercher..."
              wrapperClassName="col-span-2"
            />

            <select
              value={filters.complianceStatus || ""}
              onChange={(e) => updateFilter("complianceStatus", e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="">Conformité</option>
              <option value="pending">En cours</option>
              <option value="compliant">Conforme</option>
              <option value="non_compliant">Non conforme</option>
              <option value="error">Erreur</option>
            </select>

            <select
              value={filters.onlineStatus || ""}
              onChange={(e) => updateFilter("onlineStatus", e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="">Visibilité</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>

            <select
              value={filters.workStatus || ""}
              onChange={(e) => updateFilter("workStatus", e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="">Traitement</option>
              <option value="draft">Brouillon</option>
              <option value="to_process">À traiter</option>
            </select>

            <div className="flex items-center gap-2">
              <label
                htmlFor="dateFrom"
                className="text-sm font-medium shrink-0"
              >
                De
              </label>
              <input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="dateTo" className="text-sm font-medium shrink-0">
                à
              </label>
              <input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>

            <select
              value={filters.authorEmail || ""}
              onChange={(e) => updateFilter("authorEmail", e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="">Auteur·ice</option>
              {initialAuthors.map((author) => (
                <option key={author.email} value={author.email}>
                  {author.displayName}
                </option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className=" text-sm text-blue-600 hover:text-blue-800 font-medium underline cursor-pointer"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>
      <TooltipProvider>
        <DataTable
          columns={columns}
          data={documents}
          pageSize={pageSize}
          onRowClick={(row) => {
            const search = window.location.search.substring(1);
            const query = search ? `?from=${encodeURIComponent(search)}` : "";
            router.push(`/documents/${row.id}${query}`);
          }}
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
      </TooltipProvider>

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
  );
}
