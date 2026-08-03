import { Check, ChevronRight } from "lucide-react";
import * as React from "react";

import { cn } from "../utils";

export interface SelectRowProps {
  /** Label shown on the left of the row */
  label: string;

  /** Options to choose from */
  options: readonly { value: string; label: string }[];

  /** Current value (controlled) */
  value?: string;

  /** Change handler — receives the selected value */
  onChange?: (value: string) => void;

  /** Text shown on the right when no value is selected */
  placeholder?: string;

  /** Additional class names on the row container */
  className?: string;
}

/**
 * SelectRow — DSFR "Format(hover)" row: a label on the left, the current value
 * (greyed) + chevron on the right. Clicking opens a small dropdown of options.
 *
 * @description
 * Used inside field modals (fréquence, prix, âge…) where several parameters are
 * stacked vertically as a settings list.
 *
 * @example
 * ```tsx
 * <SelectRow
 *   label="Par"
 *   options={[{ value: "week", label: "semaine" }]}
 *   value={unit}
 *   onChange={setUnit}
 * />
 * ```
 */
export function SelectRow({
  label,
  options,
  value,
  onChange,
  placeholder = "Sélectionner",
  className,
}: SelectRowProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside this row
  React.useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between rounded-[2px] px-2 py-1.5 text-left hover:bg-[var(--background-alt-grey)]"
      >
        <span className="text-[14px] leading-[24px] text-[var(--text-default-grey)]">
          {label}
        </span>
        <span className="flex items-center gap-1">
          <span className="text-[14px] leading-[24px] text-[var(--text-disabled-grey)]">
            {selectedLabel ?? placeholder}
          </span>
          <ChevronRight
            size={16}
            className={cn(
              "text-[var(--text-disabled-grey)] transition-transform",
              isOpen && "rotate-90",
            )}
          />
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-1 min-w-[160px] overflow-auto rounded-[2px] border border-[var(--border-default-grey)] bg-white p-2 shadow-lg">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange?.(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-[2px] px-2 py-1.5 text-left text-[14px] leading-[24px] text-[var(--text-default-grey)] hover:bg-[var(--background-alt-grey)]",
                  isSelected && "bg-[var(--background-alt-grey)] font-medium",
                )}
              >
                {option.label}
                {isSelected && (
                  <Check
                    size={16}
                    className="shrink-0 text-[var(--text-action-high-blue-france)]"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

SelectRow.displayName = "SelectRow";
