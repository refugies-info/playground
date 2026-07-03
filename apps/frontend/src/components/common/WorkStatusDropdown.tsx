"use client";

import type { WorkStatus } from "@playground/shared-types";
import { TitledPopover } from "@playground/ui";
import { Tag } from "@playground/ui/primitives";
import { RiCheckLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  SELECTABLE_WORK_STATUSES,
  WORK_STATUS_TO_TAG,
} from "@/lib/work-status";
import { updateWorkStatusAction } from "@/services/work-status-actions";

interface WorkStatusDropdownProps {
  workflowId?: string;
  currentWorkStatus?: WorkStatus | null;
  onOptimisticUpdate?: (workStatus: WorkStatus | null) => void;
  /** Notifie le parent de l'état d'enregistrement (pour SaveIndicator). */
  onPendingChange?: (pending: boolean) => void;
}

/**
 * WorkStatusDropdown — changement manuel de l'état de traitement d'une fiche.
 *
 * Utilisé depuis la liste des fiches et depuis le header d'une fiche.
 * Sans `workflowId` (contexte lecture seule), affiche uniquement le Tag courant.
 */
export function WorkStatusDropdown({
  workflowId,
  currentWorkStatus,
  onOptimisticUpdate,
  onPendingChange,
}: WorkStatusDropdownProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const currentTag = currentWorkStatus
    ? WORK_STATUS_TO_TAG[currentWorkStatus]
    : undefined;

  // Lecture seule : pas de workflowId → juste le statut courant.
  if (!workflowId) {
    return <Tag status={currentTag} />;
  }

  const handleSelect = async (next: WorkStatus) => {
    if (pending || next === currentWorkStatus) return;
    setPending(true);
    onPendingChange?.(true);

    const previous = currentWorkStatus ?? null;
    onOptimisticUpdate?.(next);

    const result = await updateWorkStatusAction(workflowId, next);
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
          {SELECTABLE_WORK_STATUSES.map((status) => {
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
