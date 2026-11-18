"use client";

import { DataTable } from "@playground/ui/composites";
import { SegmentedControl } from "@playground/ui/primitives";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { AppPaginationControls } from "@/components/common/AppPagination";
import {
  WIDGET_VIEW_LABELS,
  type WidgetListView,
  type WidgetRow,
  type WidgetSortField,
} from "@/lib/widget-list";
import { duplicateWidgetConfigAction } from "@/services/widget-config-actions";
import { getColumns } from "./columns";
import { CreateWidgetPopover } from "./create-widget-popover";

interface WidgetsListProps {
  rows: WidgetRow[];
  view: WidgetListView;
  counts: Record<WidgetListView, number>;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  sortBy: WidgetSortField;
  sortOrder: "asc" | "desc";
}

export function WidgetsList({
  rows,
  view,
  counts,
  totalCount,
  currentPage,
  pageSize,
  sortBy,
  sortOrder,
}: WidgetsListProps) {
  const router = useRouter();
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [duplicationError, setDuplicationError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const navigate = (updates: Record<string, string>) => {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(updates)) params.set(key, value);
    router.push(`/widgets?${params}`, { scroll: false });
  };

  const handleDuplicate = useCallback(
    async (widget: WidgetRow) => {
      setDuplicatingId(widget._id);
      setDuplicationError(null);
      const result = await duplicateWidgetConfigAction(widget._id);
      setDuplicatingId(null);
      if (!result.success) {
        setDuplicationError(result.error);
        return;
      }
      startTransition(() => router.refresh());
    },
    [router],
  );

  const columns = useMemo(
    () => getColumns({ duplicatingId, onDuplicate: handleDuplicate }),
    [duplicatingId, handleDuplicate],
  );

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-8">
          <h1 className="text-[40px] font-bold leading-[1.2]">Widgets</h1>
          <SegmentedControl
            variant="outlined"
            aria-label="Filtrer par statut"
            value={view}
            onChange={(next) => navigate({ view: next, page: "1" })}
            options={(Object.keys(WIDGET_VIEW_LABELS) as WidgetListView[]).map(
              (value) => ({
                value,
                label: `${WIDGET_VIEW_LABELS[value]} (${counts[value]})`,
              }),
            )}
          />
        </div>
        <CreateWidgetPopover />
      </div>

      {duplicationError && (
        <p role="alert" className="text-sm text-[var(--text-default-error)]">
          {duplicationError}
        </p>
      )}

      <DataTable
        columns={columns}
        data={rows}
        pageSize={pageSize}
        manualPagination
        manualSorting
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(field, order) =>
          navigate({ sortBy: field, sortOrder: order, page: "1" })
        }
        emptyTitle="Aucun widget"
        emptyDescription="Aucun widget ne correspond à cette vue."
      />

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
