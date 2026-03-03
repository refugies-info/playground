"use client";

import { Badge } from "@playground/ui/primitives";
import { ExternalLink } from "lucide-react";
import {
  getOnlineStatusLabel,
  getOnlineStatusVariant,
  getWorkStatusLabel,
  getWorkStatusVariant,
} from "@/lib/document-labels";
import { useTranslation } from "./TranslationContext";

export function TranslationStatus() {
  const { translation } = useTranslation();

  if (!translation) return null;

  return (
    <div className="flex items-center gap-2">
      {translation.workStatus && (
        <Badge
          variant={getWorkStatusVariant(translation.workStatus ?? undefined)}
        >
          {getWorkStatusLabel(translation.workStatus ?? undefined)}
        </Badge>
      )}
      {translation.onlineStatus && (
        <Badge
          variant={getOnlineStatusVariant(
            translation.onlineStatus ?? undefined,
          )}
        >
          {getOnlineStatusLabel(translation.onlineStatus ?? undefined)}
        </Badge>
      )}
      {translation.publicationUrl && (
        <a
          href={translation.publicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-600 transition-colors"
          title="Voir la fiche publiée"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}
