"use client";

import { EmptyDash } from "@playground/ui/composites";

interface SessionPeriodCellProps {
  startDate: string | null | undefined;
  endDate: string | null | undefined;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("fr-FR");
};

export const SessionPeriodCell = ({
  startDate,
  endDate,
}: SessionPeriodCellProps) => {
  if (!startDate) return <EmptyDash />;

  const formattedStartDate = formatDate(startDate);
  if (!formattedStartDate) return <EmptyDash />;

  const formattedEndDate = endDate ? formatDate(endDate) : null;

  return (
    <div className="text-sm tabular-nums whitespace-nowrap">
      <div>{formattedStartDate}</div>
      {formattedEndDate && <div>{formattedEndDate}</div>}
    </div>
  );
};
SessionPeriodCell.displayName = "SessionPeriodCell";
