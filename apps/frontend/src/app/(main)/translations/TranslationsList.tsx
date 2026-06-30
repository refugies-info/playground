"use client";

import { DataTable } from "@playground/ui/composites";
import { RiSearchLine } from "@playground/ui/icons";
import { BoutonFiltre, Switch } from "@playground/ui/primitives";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
    priority: string;
    authorId: string;
  };
  authors: { value: string; label: string }[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  showLanguageFilter: boolean;
  initialSorting: {
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
  userRole?: string;
}

export function TranslationsList({
  initialTranslations,
  initialFilters,
  authors,
  currentPage,
  totalPages: _totalPages,
  totalCount,
  pageSize,
  showLanguageFilter,
  initialSorting,
  userRole,
}: TranslationsListProps) {
  const router = useRouter();
  const [filters, setFilters] = useState(initialFilters);
  const [search, setSearch] = useState(
    () =>
      new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : "",
      ).get("search") ?? "",
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visibleColumns =
    userRole === "translator"
      ? columns.filter((col) => {
          const key =
            "accessorKey" in col ? col.accessorKey : "id" in col ? col.id : "";
          return key !== "language" && key !== "author";
        })
      : columns;

  // Supabase Realtime: refresh when a translation_record is updated
  const hasPending = initialTranslations.some(
    (t) => t.workStatus === "pending",
  );
  useEffect(() => {
    if (!hasPending) return;

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

  const pushParams = (newFilters: typeof filters) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1");

    if (newFilters.workStatus) params.set("workStatus", newFilters.workStatus);
    else params.delete("workStatus");

    if (newFilters.onlineStatus)
      params.set("onlineStatus", newFilters.onlineStatus);
    else params.delete("onlineStatus");

    if (newFilters.language && showLanguageFilter)
      params.set("language", newFilters.language);
    else params.delete("language");

    if (newFilters.priority) params.set("priority", newFilters.priority);
    else params.delete("priority");

    if (newFilters.authorId) params.set("authorId", newFilters.authorId);
    else params.delete("authorId");

    router.push(`/translations?${params.toString()}`, { scroll: false });
  };

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    pushParams(newFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      params.set("page", "1");
      if (value) params.set("search", value);
      else params.delete("search");
      router.push(`/translations?${params.toString()}`, { scroll: false });
    }, 400);
  };

  const handleSortChange = (sortBy: string, sortOrder: "asc" | "desc") => {
    const params = new URLSearchParams(window.location.search);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    router.push(`/translations?${params.toString()}`, { scroll: false });
  };

  const isPriority = filters.priority === "urgent";

  return (
    <div className="w-full flex flex-col gap-8">
      <h1 className="text-[40px] font-bold leading-[48px]">
        Espace de traduction
      </h1>

      {/* Barre de recherche + filtres */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Recherche */}
        <div className="flex items-center border border-(--border-default-grey) rounded-[4px] bg-white overflow-hidden cursor-text">
          <div className="flex items-center gap-1 pl-3 pr-2 py-[6px] border-r border-(--border-default-grey)">
            <span className="text-sm font-medium text-(--text-default-grey) whitespace-nowrap">
              Rechercher par
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-[6px]">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Titre, ID, structure, etc."
              className="text-sm text-(--text-disabled-grey) placeholder:text-(--text-disabled-grey) bg-transparent outline-none min-w-[180px]"
            />
            <RiSearchLine className="w-4 h-4 text-(--text-disabled-grey) shrink-0" />
          </div>
        </div>

        {/* Filtre Langue */}
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

        {/* Filtre Auteur */}
        <BoutonFiltre
          label="Auteur"
          options={authors}
          value={filters.authorId}
          onChange={(value) => updateFilters({ ...filters, authorId: value })}
        />

        {/* Filtre Statut de publication */}
        <BoutonFiltre
          label="Statut de publication"
          options={[
            { label: "Publié", value: "published" },
            { label: "Archivé", value: "archived" },
          ]}
          value={filters.onlineStatus}
          onChange={(value) =>
            updateFilters({ ...filters, onlineStatus: value })
          }
        />

        {/* Filtre État de traitement */}
        <BoutonFiltre
          label="État de traitement"
          options={[
            { label: "À traiter", value: "to_process" },
            { label: "En cours", value: "draft" },
            { label: "En erreur", value: "error" },
          ]}
          value={filters.workStatus}
          onChange={(value) => updateFilters({ ...filters, workStatus: value })}
        />

        {/* Toggle Traductions prioritaires */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-(--text-default-grey) whitespace-nowrap">
            Traductions prioritaires
          </span>
          <Switch
            checked={isPriority}
            onChange={(checked) =>
              updateFilters({ ...filters, priority: checked ? "urgent" : "" })
            }
            aria-label="Traductions prioritaires"
          />
        </div>
      </div>

      {/* Table */}
      <div>
        <DataTable
          columns={visibleColumns}
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
