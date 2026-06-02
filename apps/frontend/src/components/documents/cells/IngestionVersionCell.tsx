"use client";

import { EmptyDash } from "@playground/ui/composites";
import { formatIngestionVersion } from "./format-ingestion-version";

interface IngestionVersionCellProps {
  label?: string | null;
  activeVersion?: number | null;
  latestVersion?: number | null;
}

export function IngestionVersionCell({
  label,
  activeVersion,
  latestVersion,
}: IngestionVersionCellProps) {
  const value = formatIngestionVersion({
    label,
    activeVersion,
    latestVersion,
  });

  if (value === "—") return <EmptyDash />;

  return (
    <span className="text-sm tabular-nums whitespace-nowrap">{value}</span>
  );
}

IngestionVersionCell.displayName = "IngestionVersionCell";
