"use client";

import type { WorkStatus } from "@playground/shared-types";
import { RiExternalLinkLine } from "@playground/ui/icons";
import { Tag } from "@playground/ui/primitives";
import { WorkStatusDropdown } from "@/components/common/WorkStatusDropdown";
import { useTranslation } from "./TranslationContext";

const SELECTABLE_STATUSES: WorkStatus[] = ["to_process", "draft", "to_review"];

export function TranslationStatus() {
  const { translation, publicationUrl, updateWorkStatus, isArchived } =
    useTranslation();

  if (!translation) return null;

  const { workStatus, onlineStatus } = translation;
  // RI-1430 — auparavant un simple <Tag> non cliquable : impossible de changer
  // le statut de traitement depuis l'éditeur de traduction.
  const isSelectableStatus = SELECTABLE_STATUSES.includes(
    workStatus as WorkStatus,
  );

  return (
    <div className="flex items-center gap-2">
      {isSelectableStatus && (
        <WorkStatusDropdown
          currentWorkStatus={workStatus as WorkStatus}
          onUpdateStatus={updateWorkStatus}
          readOnly={isArchived}
        />
      )}

      {onlineStatus === "published" && <Tag status="publie" />}
      {onlineStatus === "archived" && <Tag status="archive" />}
      {onlineStatus === "unpublished" && <Tag status="na">Non publié</Tag>}

      {onlineStatus === "published" && publicationUrl && (
        <a
          href={publicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#27A658] hover:opacity-75 transition-opacity"
          title="Voir la fiche publiée"
        >
          <RiExternalLinkLine className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}
