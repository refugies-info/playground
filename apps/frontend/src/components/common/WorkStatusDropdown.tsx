"use client";

import type { WorkStatus } from "@playground/shared-types";
import { TitledPopover } from "@playground/ui";
import { Tag } from "@playground/ui/primitives";
import { RiCheckLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { WORK_STATUS_TO_TAG } from "@/lib/work-status";

interface WorkStatusDropdownProps {
  currentWorkStatus?: WorkStatus | null;
  onOptimisticUpdate?: (workStatus: WorkStatus | null) => void;
  /** Notifies the parent of the saving state (for SaveIndicator). */
  onPendingChange?: (pending: boolean) => void;
  onUpdateStatus?: (
    status: WorkStatus,
  ) => Promise<{ success: boolean; error?: string }>;
  /** Forces read-only rendering (e.g. archived record) even if a handler is provided. */
  readOnly?: boolean;
  /**
   * Statuses offered in the popup, in display order. No default: the
   * component doesn't assume which resource it's editing (FR editorial
   * records have "to_review", translations don't — RI-1430) — every caller
   * passes the list that applies to its own resource.
   */
  selectableStatuses: WorkStatus[];
}

/**
 * WorkStatusDropdown — manually changes a record's work status.
 *
 * Purely presentational: it doesn't know how to write to the database, it
 * delegates that to `onUpdateStatus`. Used from the records list, a record's
 * header, and the translation editor — each passes it the server action and
 * the selectable statuses suited to its own resource.
 */
export function WorkStatusDropdown({
  currentWorkStatus,
  onOptimisticUpdate,
  onPendingChange,
  onUpdateStatus,
  readOnly,
  selectableStatuses,
}: WorkStatusDropdownProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const currentTag = currentWorkStatus
    ? WORK_STATUS_TO_TAG[currentWorkStatus]
    : undefined;

  if (readOnly || !onUpdateStatus) {
    return <Tag status={currentTag} />;
  }

  const handleSelect = async (newStatus: WorkStatus) => {
    if (pending || newStatus === currentWorkStatus) return;
    setPending(true);
    onPendingChange?.(true);

    const previous = currentWorkStatus ?? null;
    onOptimisticUpdate?.(newStatus);

    const result = await onUpdateStatus(newStatus);
    setPending(false);
    onPendingChange?.(false);

    if (result.success) {
      router.refresh();
    } else {
      onOptimisticUpdate?.(previous);
    }
  };

  const trigger = (
    <button
      type="button"
      className="flex items-center gap-1 rounded p-0.5 hover:bg-gray-100 transition-colors disabled:opacity-50"
      disabled={pending}
      aria-label={"État de traitement"}
    >
      <Tag status={currentTag} />
    </button>
  );

  return (
    <div
      role="none"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <TitledPopover
        title={"État de traitement"}
        trigger={trigger}
        contentClassName="w-[220px]"
        closeOnChildClick
      >
        <div className="flex flex-col gap-1 px-2">
          {selectableStatuses.map((status) => {
            const tagStatus = WORK_STATUS_TO_TAG[status];
            const isCurrent = status === currentWorkStatus;
            return (
              <button
                type="button"
                key={status}
                onClick={() => handleSelect(status)}
                aria-current={isCurrent}
                className="flex items-center gap-3 rounded px-2 py-1.5 hover:bg-(--background-action-low-blue-france,#E3E3FD) text-left text-sm w-full transition-colors"
              >
                <Tag status={tagStatus} className="shrink-0" />
                {isCurrent && (
                  <RiCheckLine className="w-4 h-4 text-(--text-title-blue-france,#000091) shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </TitledPopover>
    </div>
  );
}
