import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../utils";

/**
 * Variants for the NumberInput component.
 */
const numberInputVariants = cva(
  "w-full outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
  {
    variants: {
      variant: {
        default:
          "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500",
        inline:
          "bg-transparent px-1 py-0.5 text-inherit focus:bg-white focus:ring-1 focus:ring-blue-300",
      },
      hasError: {
        true: "border-red-500 focus:border-red-500 focus:ring-red-500",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "inline",
        hasError: true,
        className: "ring-red-300",
      },
    ],
    defaultVariants: {
      variant: "default",
      hasError: false,
    },
  },
);

export interface NumberInputProps
  extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "onChange" | "type" | "value"
    >,
    VariantProps<typeof numberInputVariants> {
  /** Current value (controlled). Use null for empty. */
  value?: number | null;

  /** Default value (uncontrolled) */
  defaultValue?: number;

  /** Change handler — receives the numeric value or null if empty */
  onChange?: (value: number | null) => void;

  /** Minimum allowed value */
  min?: number;

  /** Maximum allowed value */
  max?: number;

  /** Step increment for arrow keys/spinner */
  step?: number;

  /** Error message to display (also sets hasError variant) */
  error?: string;
}

/**
 * NumberInput — A number input with inline editing support.
 *
 * @description
 * Two variants available:
 * - `default`: Standard bordered input for forms
 * - `inline`: Transparent background for inline editing (used with EditableField)
 *
 * Handles null/undefined values gracefully — empty input returns null.
 *
 * @example
 * ```tsx
 * // Standard form input
 * <NumberInput value={50} onChange={setValue} min={0} max={100} />
 *
 * // Inline editing mode
 * <NumberInput variant="inline" value={50} onChange={setValue} autoFocus />
 * ```
 */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      value,
      defaultValue,
      onChange,
      min,
      max,
      step = 1,
      error,
      variant = "default",
      ...props
    },
    ref,
  ) => {
    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;

        if (rawValue === "") {
          onChange?.(null);
          return;
        }

        const numValue = parseFloat(rawValue);

        if (isNaN(numValue)) {
          return;
        }

        onChange?.(numValue);
      },
      [onChange],
    );

    const displayValue = value === null || value === undefined ? "" : value;

    return (
      <input
        ref={ref}
        type="number"
        value={displayValue}
        defaultValue={defaultValue}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        className={cn(
          numberInputVariants({ variant, hasError: !!error }),
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
    );
  },
);

NumberInput.displayName = "NumberInput";
