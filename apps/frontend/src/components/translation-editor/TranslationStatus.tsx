"use client";

import type { WorkStatus } from "@playground/shared-types";
import { RiExternalLinkLine } from "@playground/ui/icons";
import { Tag } from "@playground/ui/primitives";
import { WorkStatusDropdown } from "@/components/common/WorkStatusDropdown";
import { useTranslation } from "./TranslationContext";

// Translations only ever have "to_process" ("à traiter") or "draft" ("en
// cours") — "to_review" ("à relire") is an FR editorial record status that
// doesn't apply here (RI-1430).
const TRANSLATION_SELECTABLE_STATUSES: WorkStatus[] = ["to_process", "draft"];

export function TranslationStatus() {
  const { translation, publicationUrl, updateWorkStatus, isArchived } =
    useTranslation();

  if (!translation) return null;

  const { workStatus, onlineStatus } = translation;

  const isSelectableStatus = TRANSLATION_SELECTABLE_STATUSES.includes(
    workStatus as WorkStatus,
  );

  return (
    <div className="flex items-center gap-2">
      {isSelectableStatus && (
        <WorkStatusDropdown
          currentWorkStatus={workStatus as WorkStatus}
          onUpdateStatus={updateWorkStatus}
          readOnly={isArchived}
          selectableStatuses={TRANSLATION_SELECTABLE_STATUSES}
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
