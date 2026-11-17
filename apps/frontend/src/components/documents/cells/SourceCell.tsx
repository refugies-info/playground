"use client";

import {
  SOURCE_SYSTEM_LABELS,
  type SourceSystem,
} from "@playground/shared-types";
import { formatDateFr } from "@/lib/format-date";

interface SourceCellProps {
  source: SourceSystem | null;
  migratedAt: string | null | undefined;
}

export const SourceCell = ({ source, migratedAt }: SourceCellProps) => {
  const formattedMigratedAt = formatDateFr(migratedAt);

  return (
    <div className="text-sm">
      <div className="font-bold">
        {source ? SOURCE_SYSTEM_LABELS[source] : "—"}
      </div>
      {formattedMigratedAt && (
        <div className="text-xs text-[var(--text-disabled-grey)]">
          Migré le {formattedMigratedAt}
        </div>
      )}
    </div>
  );
};
SourceCell.displayName = "SourceCell";
