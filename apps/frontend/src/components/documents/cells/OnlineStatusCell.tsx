"use client";

import type { OnlineStatus } from "@playground/shared-types";
import { Badge, EmptyDash } from "@playground/ui/primitives";
import { ExternalLink } from "lucide-react";
import {
  getOnlineStatusLabel,
  getOnlineStatusVariant,
} from "@/lib/document-labels";

interface OnlineStatusCellProps {
  status: OnlineStatus | undefined;
  publishedUrl?: string | null;
}

export const OnlineStatusCell = ({
  status,
  publishedUrl,
}: OnlineStatusCellProps) => {
  if (!status) return <EmptyDash />;

  const badge = (
    <Badge variant={getOnlineStatusVariant(status)}>
      {getOnlineStatusLabel(status)}
    </Badge>
  );

  if (status === "published" && publishedUrl) {
    return (
      <div className="flex items-center gap-2">
        {badge}
        <a
          href={publishedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-600 transition-colors"
          title="Voir la fiche publiée"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return badge;
};
OnlineStatusCell.displayName = "OnlineStatusCell";
