"use client";

import { Badge, type BadgeVariant } from "../badge/Badge";

// =============================================================================
// EmptyDash — Placeholder for null/undefined values in table cells
// =============================================================================

export const EmptyDash = () => <div className="text-gray-400">—</div>;
EmptyDash.displayName = "EmptyDash";

// =============================================================================
// DateCell — Formatted date with optional time display
// =============================================================================

export interface DateCellProps {
  /** ISO date string or null/undefined */
  value: string | null | undefined;
  /** Show time below the date (default: false) */
  showTime?: boolean;
}

export const DateCell = ({ value, showTime = false }: DateCellProps) => {
  if (!value) return <EmptyDash />;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return <EmptyDash />;

  return (
    <div>
      <div>{date.toLocaleDateString("fr-FR")}</div>
      {showTime && (
        <div className="text-xs text-gray-400">
          {date.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}
    </div>
  );
};
DateCell.displayName = "DateCell";

// =============================================================================
// TextCell — Simple text display with optional className
// =============================================================================

export interface TextCellProps {
  /** Text value or null/undefined */
  value: string | null | undefined;
  /** Additional CSS classes */
  className?: string;
}

export const TextCell = ({ value, className }: TextCellProps) => {
  if (!value) return <EmptyDash />;
  return <div className={className}>{value}</div>;
};
TextCell.displayName = "TextCell";

// =============================================================================
// BadgeCell — Badge with variant and label
// =============================================================================

export interface BadgeCellProps {
  /** Raw value or null/undefined */
  value: string | null | undefined;
  /** Badge color variant */
  variant: BadgeVariant;
  /** Display label */
  label: string;
}

export const BadgeCell = ({ value, variant, label }: BadgeCellProps) => {
  if (!value) return <EmptyDash />;
  return <Badge variant={variant}>{label}</Badge>;
};
BadgeCell.displayName = "BadgeCell";

// =============================================================================
// LanguageCell — Flag icon + language name badge
// =============================================================================

export interface LanguageCellProps {
  /** CSS class for flag icon (e.g., "fi fi-fr") */
  flagClass: string;
  /** Language display name */
  name: string;
  /** Badge size (default: "md") */
  size?: "sm" | "md";
}

export const LanguageCell = ({
  flagClass,
  name,
  size = "md",
}: LanguageCellProps) => (
  <div className="flex items-center gap-2">
    <span className={`${flagClass} shadow-sm`} />
    <Badge variant="neutral" size={size} className="font-normal capitalize">
      {name}
    </Badge>
  </div>
);
LanguageCell.displayName = "LanguageCell";
