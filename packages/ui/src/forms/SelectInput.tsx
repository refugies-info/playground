import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../utils";

/**
 * Variants for the SelectInput component.
 */
const selectInputVariants = cva(
  "w-full outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0",
  {
    variants: {
      variant: {
        default:
          "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500",
        inline:
          "bg-transparent px-1 py-0.5 text-inherit focus:bg-white focus:ring-1 focus:ring-blue-300",
      },
      hasError: {
        true: "border-red-500 focus:ring-red-500",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      hasError: false,
    },
  },
);

export interface SelectInputProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange">,
    VariantProps<typeof selectInputVariants> {
  /** Options to display */
  options: readonly { value: string; label: string }[];

  /** Current value (controlled) */
  value?: string;

  /** Default value (uncontrolled) */
  defaultValue?: string;

  /** Change handler — receives the selected value */
  onChange?: (value: string) => void;

  /** Placeholder text for the default option */
  placeholder?: string;

  /** Error message to display */
  error?: string;
}

/**
 * SelectInput — A native select dropdown with inline editing support.
 *
 * @description
 * Uses the native `<select>` element for simplicity and accessibility.
 * Two variants available:
 * - `default`: Standard bordered select for forms
 * - `inline`: Transparent background for inline editing
 *
 * @example
 * ```tsx
 * const options = [
 *   { value: "asile", label: "Demandeurs d'asile" },
 *   { value: "refugie", label: "Réfugiés" },
 * ];
 *
 * <SelectInput
 *   options={options}
 *   value={value}
 *   onChange={setValue}
 *   placeholder="Sélectionner..."
 * />
 * ```
 */
export const SelectInput = React.forwardRef<
  HTMLSelectElement,
  SelectInputProps
>(
  (
    {
      className,
      options,
      value,
      defaultValue,
      onChange,
      placeholder = "Sélectionner...",
      error,
      variant = "default",
      ...props
    },
    ref,
  ) => {
    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange?.(e.target.value);
      },
      [onChange],
    );

    return (
      <select
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        className={cn(
          selectInputVariants({ variant, hasError: !!error }),
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  },
);

SelectInput.displayName = "SelectInput";
