"use client";

import { Tag } from "@playground/ui/primitives";
import { useTranslation } from "./TranslationContext";

export function TranslationStatus() {
  const { translation } = useTranslation();

  if (!translation) return null;

  const { workStatus, onlineStatus, publicationUrl } = translation;

  return (
    <div className="flex items-center gap-2">
      {workStatus === "to_process" && <Tag status="a-traiter" />}
      {workStatus === "draft" && <Tag status="en-cours" />}

      {onlineStatus === "published" && (
        <Tag status="publie" href={publicationUrl ?? undefined} />
      )}
      {onlineStatus === "archived" && <Tag status="archive" />}
      {onlineStatus === "unpublished" && <Tag status="na">Non publié</Tag>}
    </div>
  );
}
