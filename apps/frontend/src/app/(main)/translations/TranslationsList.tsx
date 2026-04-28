"use client";

import { BoutonFiltre } from "@playground/ui";
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

    router.push(`/translations?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (sortBy: string, sortOrder: "asc" | "desc") => {
    const params = new URLSearchParams(window.location.search);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    router.push(`/translations?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setFilters({ workStatus: "", onlineStatus: "", language: "" });
    router.push("/translations", { scroll: false });
  };

  const isTranslator = userRole === "translator";

  return (
    <div className="w-full flex flex-col gap-8">
      <h1 className="text-[40px] font-bold leading-[1.2]">{title}</h1>

      <div className="flex flex-wrap items-center gap-4">
        <BoutonFiltre
          label="Statut de publication"
          options={[
            { label: "Publié", value: "published" },
            { label: "Non publié", value: "unpublished" },
            ...(!isTranslator ? [{ label: "Archivé", value: "archived" }] : []),
          ]}
          value={filters.onlineStatus}
          onChange={(value) =>
            updateFilters({ ...filters, onlineStatus: value })
          }
        />

        <BoutonFiltre
          label="État de traitement"
          options={[
            { label: "À traiter", value: "to_process" },
            { label: "Brouillon", value: "draft" },
            ...(!isTranslator
              ? [
                  { label: "Traduction IA en cours", value: "pending" },
                  { label: "Erreur de traduction IA", value: "error" },
                ]
              : []),
          ]}
          value={filters.workStatus}
          onChange={(value) => updateFilters({ ...filters, workStatus: value })}
        />

        {showLanguageFilter && (
          <BoutonFiltre
            label="Langue"
            options={LANGUAGES.map((lang) => ({
              label: lang.label,
              value: lang.value,
            }))}
            value={filters.language}
            onChange={(value) => updateFilters({ ...filters, language: value })}
          />
        )}
      </div>

      <div>
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
