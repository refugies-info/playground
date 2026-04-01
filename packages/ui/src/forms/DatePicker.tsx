/**
 * @deprecated - NOT USED in apps/frontend
 * TODO: Verify usage before removing. Last checked: 2026-03-30
 */
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
        className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {value ? format(value, "dd/MM/yyyy") : placeholder}
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
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
