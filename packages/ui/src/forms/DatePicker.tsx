"use client";

import { format } from "date-fns";
import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { cn } from "../utils";

export interface DatePickerProps {
  /** Selected date */
  value?: Date | null;

  /** Change handler */
  onChange?: (date: Date | undefined) => void;

  /** Placeholder text */
  placeholder?: string;

  /** Whether the field is disabled */
  disabled?: boolean;

  /** Additional class names */
  className?: string;
}

/**
 * DatePicker — A simple date picker component.
 *
 * @description
 * Uses react-day-picker for the calendar.
 * Click to open the calendar, select a date to close.
 *
 * @example
 * ```tsx
 * <DatePicker
 *   value={selectedDate}
 *   onChange={setSelectedDate}
 *   placeholder="Sélectionner une date"
 * />
 * ```
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Sélectionner...",
  disabled = false,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
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
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          // DSFR "Champ de saisie" — fond gris contrasté, bordure basse pleine
          "w-full rounded-t-[4px] border-0 border-b-2 border-[var(--border-plain-grey)] bg-[var(--background-contrast-grey)] px-4 py-2 text-left text-[14px] leading-[24px] disabled:cursor-not-allowed disabled:opacity-50",
          value
            ? "text-[var(--text-default-grey)]"
            : "text-[var(--text-disabled-grey)]",
        )}
      >
        {value ? format(value, "dd/MM/yyyy") : placeholder}
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 rounded-[2px] border border-[var(--border-default-grey)] bg-white p-2 shadow-lg">
          <DayPicker
            mode="single"
            selected={value ?? undefined}
            onSelect={(date) => {
              onChange?.(date);
              setIsOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

DatePicker.displayName = "DatePicker";
