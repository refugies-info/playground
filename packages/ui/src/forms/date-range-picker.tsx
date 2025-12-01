"use client";

import { format } from "date-fns";
import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { Button } from "../primitives/button/Button";
import { cn } from "../utils/cn";

interface DateRangePickerProps {
  from?: Date;
  to?: Date;
  onFromChange?: (date: Date | undefined) => void;
  onToChange?: (date: Date | undefined) => void;
}

export function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
}: DateRangePickerProps) {
  const [showFromPicker, setShowFromPicker] = React.useState(false);
  const [showToPicker, setShowToPicker] = React.useState(false);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Date Range</p>
      <div className="flex gap-2">
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFromPicker(!showFromPicker)}
            className="w-[140px] justify-start text-left font-normal"
          >
            {from ? format(from, "MMM dd, yyyy") : "From date"}
          </Button>
          {showFromPicker && (
            <div className="absolute top-full mt-2 z-10 bg-white border rounded-lg shadow-lg p-4">
              <DayPicker
                mode="single"
                selected={from}
                onSelect={(date) => {
                  onFromChange?.(date);
                  setShowFromPicker(false);
                }}
              />
            </div>
          )}
        </div>

        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowToPicker(!showToPicker)}
            className="w-[140px] justify-start text-left font-normal"
          >
            {to ? format(to, "MMM dd, yyyy") : "To date"}
          </Button>
          {showToPicker && (
            <div className="absolute top-full mt-2 z-10 bg-white border rounded-lg shadow-lg p-4">
              <DayPicker
                mode="single"
                selected={to}
                onSelect={(date) => {
                  onToChange?.(date);
                  setShowToPicker(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
