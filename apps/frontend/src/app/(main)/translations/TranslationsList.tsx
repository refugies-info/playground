"use client";

import { DataTable } from "@playground/ui/composites";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppPaginationControls } from "@/components/common/app-pagination";
import { createClient } from "@/lib/supabase/client";
import type { TranslationItem } from "@/services/translations";
import { columns } from "./columns";

const LANGUAGES = [
  { value: "en", label: "Anglais" },
  { value: "uk", label: "Ukrainien" },
  { value: "ar", label: "Arabe" },
  { value: "ps", label: "Pachto" },
  { value: "fa", label: "Persan" },
  { value: "ru", label: "Russe" },
  { value: "ti", label: "Tigrinya" },
];

interface TranslationsListProps {
  initialTranslations: TranslationItem[];
  initialFilters: {
    workStatus: string;
    onlineStatus: string;
    language: string;
  };
  title: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  showLanguageFilter: boolean;
  initialSorting: {
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
}

export function TranslationsList({
  initialTranslations,
  initialFilters,
  title,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  showLanguageFilter,
  initialSorting,
  userRole,
}: TranslationsListProps & { userRole?: string }) {
  const router = useRouter();
  const [filters, setFilters] = useState(initialFilters);

  // Supabase Realtime: refresh when a translation_record is updated
  const hasPending = initialTranslations.some(
    (t) => t.workStatus === "pending",
  );
  useEffect(() => {
    if (!hasPending) return;

    // Collect pending IDs to scope the subscription
    const pendingIds = initialTranslations
      .filter((t) => t.workStatus === "pending")
      .map((t) => t.id);

    const supabase = createClient();
    const channel = supabase
      .channel("translation-status-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "translation_records",
          // Only listen to records currently visible as pending
          filter:
            pendingIds.length === 1 ? `id=eq.${pendingIds[0]}` : undefined,
        },
        () => {
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hasPending, router, initialTranslations]);

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    const params = new URLSearchParams(window.location.search);
    // Reset to page 1 on filter change
    params.set("page", "1");

    if (newFilters.workStatus) params.set("workStatus", newFilters.workStatus);
    else params.delete("workStatus");

    if (newFilters.onlineStatus)
      params.set("onlineStatus", newFilters.onlineStatus);
    else params.delete("onlineStatus");

    if (newFilters.language && showLanguageFilter) {
      params.set("language", newFilters.language);
    } else {
      params.delete("language");
    }

    router.push(`/translations?${params.toString()}`);
  };

  const handleSortChange = (sortBy: string, sortOrder: "asc" | "desc") => {
    const params = new URLSearchParams(window.location.search);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    router.push(`/translations?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({ workStatus: "", onlineStatus: "", language: "" });
    router.push("/translations");
  };

  const isTranslator = userRole === "translator";

  return (
    <div className="w-full h-full p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>

      <div className="">
        <div className=" border rounded mb-8 bg-white">
          <div className="px-4 py-3 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <select
                  value={filters.onlineStatus}
                  onChange={(e) =>
                    updateFilters({ ...filters, onlineStatus: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">Visibilité</option>
                  <option value="published">Publié</option>
                  <option value="unpublished">Non publié</option>
                  {!isTranslator && <option value="archived">Archivé</option>}
                </select>
              </div>
              <div>
                <select
                  value={filters.workStatus}
                  onChange={(e) =>
                    updateFilters({ ...filters, workStatus: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">Traitement</option>
                  <option value="to_process">À traiter</option>
                  <option value="draft">Brouillon</option>
                  {!isTranslator && (
                    <option value="pending">Traduction IA en cours</option>
                  )}
                  {!isTranslator && (
                    <option value="error">Erreur de traduction IA</option>
                  )}
                </select>
              </div>
              {showLanguageFilter && (
                <div>
                  <select
                    value={filters.language}
                    onChange={(e) =>
                      updateFilters({ ...filters, language: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="">Langue</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {(filters.workStatus ||
              filters.onlineStatus ||
              (showLanguageFilter && filters.language)) && (
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
          data={initialTranslations}
          pageSize={pageSize}
          onRowClick={(row) => {
            router.push(`/translations/${row.id}`);
          }}
          manualPagination
          manualSorting
          sortBy={initialSorting.sortBy}
          sortOrder={initialSorting.sortOrder}
          onSortChange={handleSortChange}
        />

        {totalCount > 0 && (
          <div className="flex justify-end px-2 py-4">
            <AppPaginationControls
              currentPage={currentPage}
              pageSize={pageSize}
              totalCount={totalCount}
            />
          </div>
        )}
      </div>
    </div>
  );
}
