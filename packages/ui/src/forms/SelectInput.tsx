import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../utils";

/**
 * Variants for the SelectInput component.
 */
const selectInputVariants = cva("w-full", {
  variants: {
    variant: {
      // DSFR "Liste déroulante" (select.css) : le focus reste celui du DSFR
      default: [
        "appearance-none rounded-t-[4px] bg-[var(--background-contrast-grey)]",
        "py-2 pr-10 pl-4 text-[14px] leading-6 text-[var(--text-default-grey)]",
        "shadow-[inset_0_-2px_0_0_var(--border-plain-grey)]",
        "disabled:text-[var(--text-disabled-grey)] disabled:shadow-[inset_0_-2px_0_0_var(--border-disabled-grey)]",
      ].join(" "),
      inline:
        "outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 bg-transparent px-1 py-0.5 text-inherit focus:bg-white focus:ring-1 focus:ring-blue-300",
    },
    hasError: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      variant: "default",
      hasError: true,
      className: "shadow-[inset_0_-2px_0_0_var(--border-plain-error)]",
    },
    {
      variant: "inline",
      hasError: true,
      className: "border-red-500 focus:ring-red-500",
    },
  ],
  defaultVariants: {
    variant: "default",
    hasError: false,
  },
});

const DSFR_CHEVRON = (color: string) =>
  `url("data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23${color}' d='M12,13.1l5-4.9l1.4,1.4L12,15.9L5.6,9.5l1.4-1.4L12,13.1z'/></svg>")`;

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
 * - `default`: DSFR "Liste déroulante" (grey field, chevron), native list
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
        style={
          variant !== "inline"
            ? {
                backgroundImage: DSFR_CHEVRON(
                  props.disabled ? "929292" : "161616",
                ),
                backgroundRepeat: "no-repeat",
                backgroundPosition: "calc(100% - 1rem) 50%",
                backgroundSize: "1rem 1rem",
              }
            : undefined
        }
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
