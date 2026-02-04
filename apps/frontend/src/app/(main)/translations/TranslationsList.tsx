"use client";

import { DataTable } from "@playground/ui/primitives";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TranslationItem } from "@/services/translations";
import { columns } from "./columns";

interface TranslationsListProps {
  initialTranslations: TranslationItem[];
  initialFilters: {
    status: string;
  };
  title: string;
}

export function TranslationsList({
  initialTranslations,
  initialFilters,
  title,
}: TranslationsListProps) {
  const router = useRouter();
  const [filters, setFilters] = useState(initialFilters);

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    // Default pagination
    params.set("page", "1");
    params.set("pageSize", "50");

    if (newFilters.status) params.set("status", newFilters.status);

    router.push(`/translations?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({ status: "" });
    router.push("/translations");
  };

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
                  value={filters.status}
                  onChange={(e) =>
                    updateFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                >
                  <option value="">Statut</option>
                  <option value="to_process">À traiter</option>
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                </select>
              </div>
            </div>
            {filters.status && (
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
        <DataTable columns={columns} data={initialTranslations} pageSize={50} />
      </div>
    </div>
  );
}
