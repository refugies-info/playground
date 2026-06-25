"use client";

import { RiExternalLinkLine } from "@playground/ui/icons";
import { Tag } from "@playground/ui/primitives";
import { useTranslation } from "./TranslationContext";

export function TranslationStatus() {
  const { translation, publicationUrl } = useTranslation();

  if (!translation) return null;

  const { workStatus, onlineStatus } = translation;

  return (
    <div className="flex items-center gap-2">
      {workStatus === "to_process" && <Tag status="a-traiter" />}
      {workStatus === "draft" && <Tag status="en-cours" />}

      {onlineStatus === "published" && <Tag status="publie" />}
      {onlineStatus === "archived" && <Tag status="archive" />}
      {onlineStatus === "unpublished" && <Tag status="na">Non publié</Tag>}

      {onlineStatus === "published" && publicationUrl && (
        <a
          href={publicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--text-action-high-blue-france,#000091)] hover:opacity-75 transition-opacity"
          title="Voir la fiche publiée"
        >
          <RiExternalLinkLine className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}
