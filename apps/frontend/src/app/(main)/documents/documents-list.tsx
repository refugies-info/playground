"use client";

import type { Document, DocumentSortField } from "@playground/shared-types";
import {
  BoutonFiltre,
  BoutonFiltreDate,
  SearchInput,
  TooltipProvider,
} from "@playground/ui";
import { DataTable } from "@playground/ui/composites";
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
    modalitesEntreesSorties?: string;
  };
  initialAuthors: { email: string; displayName: string }[];
}

export function DocumentsList({
  initialDocuments,
  totalCount,
  currentPage,
  pageSize,
  sortBy,
  sortOrder,
  initialFilters,
  initialAuthors,
}: DocumentsListProps) {
  const router = useRouter();

  // Use the shared hook for filter state + URL sync
  const { filters, updateFilter } = useUrlFilters({
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
    <div className="w-full flex flex-col gap-8">
      {/* Figma node 1264-7549 — gap: 16px, ordre: Search / Auteur / Visibilité / Traitement / Date session / Conformité */}
      <div className="flex flex-wrap items-center gap-4">
        <SearchInput
          value={filters.search}
          onChange={(value) => updateFilter("search", value)}
          placeholder="Rechercher par titre, ID, structure, etc."
          wrapperClassName="max-w-[330px] w-full"
        />

        <BoutonFiltre
          label="Auteur·ice"
          options={initialAuthors.map((a) => ({
            label: a.displayName,
            value: a.email,
          }))}
          value={filters.authorEmail || ""}
          onChange={(value) => updateFilter("authorEmail", value)}
        />

        <BoutonFiltre
          label="Statut de publication"
          options={[
            { label: "Publié", value: "published" },
            { label: "Archivé", value: "archived" },
          ]}
          value={filters.onlineStatus || ""}
          onChange={(value) => updateFilter("onlineStatus", value)}
        />

        <BoutonFiltre
          label="État de traitement"
          options={[
            { label: "En cours", value: "draft" },
            { label: "À traiter", value: "to_process" },
          ]}
          value={filters.workStatus || ""}
          onChange={(value) => updateFilter("workStatus", value)}
        />

        {/* Groupe date : label + De + à + À */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--text-default-grey,#3A3A3A)]">
            Date de session
          </span>
          <BoutonFiltreDate
            value={filters.dateFrom}
            onChange={(value) => updateFilter("dateFrom", value)}
          />
          <span className="text-sm text-[var(--text-default-grey,#3A3A3A)]">
            à
          </span>
          <BoutonFiltreDate
            value={filters.dateTo}
            onChange={(value) => updateFilter("dateTo", value)}
          />
        </div>

        <BoutonFiltre
          label="Type d'entrée"
          options={[
            { label: "À dates fixes", value: "0" },
            { label: "À tout moment", value: "1" },
          ]}
          value={filters.modalitesEntreesSorties || ""}
          onChange={(value) => updateFilter("modalitesEntreesSorties", value)}
        />

        <BoutonFiltre
          label="Conformité"
          options={[
            { label: "Conforme", value: "compliant" },
            { label: "Non conforme", value: "non_compliant" },
          ]}
          value={filters.complianceStatus || ""}
          onChange={(value) => updateFilter("complianceStatus", value)}
        />
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
            params.set("page", "1");
            router.push(`/documents?${params.toString()}`, { scroll: false });
          }}
          getRowClassName={(row) =>
            highlightedIds.has(row.id)
              ? "animate-highlight bg-yellow-50 transition-colors duration-1000"
              : undefined
          }
        />
      </TooltipProvider>

      {/* Custom server-side pagination controls */}
      {totalCount > 0 && (
        <div className="flex justify-end">
          <AppPaginationControls
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
          />
        </div>
      )}
    </div>
  );
}
