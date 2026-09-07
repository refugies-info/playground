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

interface WorkStatusDropdownProps {
  currentWorkStatus?: WorkStatus | null;
  onOptimisticUpdate?: (workStatus: WorkStatus | null) => void;
  /** Notifie le parent de l'état d'enregistrement (pour SaveIndicator). */
  onPendingChange?: (pending: boolean) => void;
  /**
   * Appelé quand l'utilisateur choisit un nouveau statut. C'est à l'appelant
   * de fournir l'action serveur adaptée à la ressource éditée (fiche FR via
   * `updateWorkStatusAction`, traduction via `updateTranslationWorkStatusAction`,
   * etc.) — le dropdown ne connaît ni table ni id, juste le résultat.
   * Omis (ou `readOnly`) → rendu lecture seule (juste le Tag courant).
   */
  onUpdateStatus?: (
    status: WorkStatus,
  ) => Promise<{ success: boolean; error?: string }>;
  /** Force le rendu lecture seule (ex. fiche archivée) même si un handler est fourni. */
  readOnly?: boolean;
}

/**
 * WorkStatusDropdown — changement manuel de l'état de traitement d'une fiche.
 *
 * Composant purement présentationnel : il ne sait pas écrire en base, il
 * délègue ça à `onUpdateStatus`. Utilisé depuis la liste des fiches, le
 * header d'une fiche, et l'éditeur de traduction — chacun lui passe l'action
 * serveur adaptée à sa propre ressource.
 */
export function WorkStatusDropdown({
  currentWorkStatus,
  onOptimisticUpdate,
  onPendingChange,
  onUpdateStatus,
  readOnly,
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
