"use client";

import type { OnlineStatus } from "@playground/shared-types";
import { EmptyDash } from "@playground/ui/composites";
import { Tag } from "@playground/ui/primitives";

interface OnlineStatusCellProps {
  status: OnlineStatus | undefined;
  publishedUrl?: string | null;
}

export const OnlineStatusCell = ({
  status,
  publishedUrl,
}: OnlineStatusCellProps) => {
  if (!status) return <EmptyDash />;

  if (status === "published")
    return <Tag status="publie" href={publishedUrl ?? undefined} />;
  if (status === "archived") return <Tag status="archive" />;

  // unpublished — pas de variant Tag dédié
  return <Tag status="na">Non publié</Tag>;
};
OnlineStatusCell.displayName = "OnlineStatusCell";
