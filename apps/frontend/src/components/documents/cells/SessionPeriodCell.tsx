"use client";

import { EmptyDash } from "@playground/ui/composites";
import { formatDateFr } from "@/lib/format-date";

interface SessionPeriodCellProps {
  startDate: string | null | undefined;
  endDate: string | null | undefined;
}

export const SessionPeriodCell = ({
  startDate,
  endDate,
}: SessionPeriodCellProps) => {
  if (!startDate) return <EmptyDash />;

  const formattedStartDate = formatDateFr(startDate);
  if (!formattedStartDate) return <EmptyDash />;

  const formattedEndDate = formatDateFr(endDate);

  return (
    <div className="text-sm tabular-nums whitespace-nowrap">
      <div>{formattedStartDate}</div>
      {formattedEndDate && <div>{formattedEndDate}</div>}
    </div>
  );
};
SessionPeriodCell.displayName = "SessionPeriodCell";
