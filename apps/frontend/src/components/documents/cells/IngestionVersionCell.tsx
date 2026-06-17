"use client";

import { EmptyDash } from "@playground/ui/composites";
import { formatIngestionVersion } from "@/lib/format-ingestion-version";

interface IngestionVersionCellProps {
  activeVersion?: number | null;
  latestVersion?: number | null;
}

export function IngestionVersionCell({
  activeVersion,
  latestVersion,
}: IngestionVersionCellProps) {
  const value = formatIngestionVersion({
    activeVersion,
    latestVersion,
  });

  if (value === "—") return <EmptyDash />;

  return (
    <span className="text-sm tabular-nums whitespace-nowrap">{value}</span>
  );
}

IngestionVersionCell.displayName = "IngestionVersionCell";
