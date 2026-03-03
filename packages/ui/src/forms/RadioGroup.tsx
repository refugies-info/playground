import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../utils";

// =============================================================================
// Types
// =============================================================================

export interface RadioGroupOption {
  value: string;
  label: string;
}

export interface RadioGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof radioGroupVariants> {
  /** Available options */
  options: readonly RadioGroupOption[];

  /** Current value (controlled). null = nothing selected. */
  value?: string | null;

  /** Change handler. Receives null when cleared via the nullable button. */
  onChange?: (value: string | null) => void;

  /** Show a clear (✕) button to deselect all options */
  nullable?: boolean;

  /**
   * Accessible group name — passed as `name` attribute to radio inputs.
   * Must be unique on the page if multiple RadioGroups are rendered.
   */
  name: string;
}

// =============================================================================
// Variants
// =============================================================================

const radioGroupVariants = cva("flex items-center gap-3", {
  variants: {
    direction: {
      horizontal: "flex-row flex-wrap",
      vertical: "flex-col items-start",
    },
  },
  defaultVariants: { direction: "horizontal" },
});

// =============================================================================
// Component
// =============================================================================

/**
 * RadioGroup — A group of radio buttons with optional clear functionality.
 *
 * @description
 * Two layout variants:
 * - `horizontal` (default): radio buttons side by side
 * - `vertical`: radio buttons stacked
 *
 * When `nullable` is true, a ✕ button appears when a value is selected,
 * allowing the user to clear the selection (calls `onChange(null)`).
 *
 * @example
 * ```tsx
 * const options = [
 *   { value: "0", label: "Dates fixes" },
 *   { value: "1", label: "Entrées permanentes" },
 * ];
 *
 * <RadioGroup
 *   name="modalites"
 *   options={options}
 *   value={value}
 *   onChange={setValue}
 *   nullable
 *   aria-label="Mode d'entrée"
 * />
 * ```
 */
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      options,
      value,
      onChange,
      nullable = false,
      name,
      direction,
      ...props
    },
    ref,
  ) => {
    const hasValue = value !== null && value !== undefined && value !== "";

    return (
      <div
        ref={ref}
        role="radiogroup"
        className={cn(radioGroupVariants({ direction }), className)}
        {...props}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-1.5 text-sm cursor-pointer select-none"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange?.(option.value)}
              className="accent-blue-600"
            />
            {option.label}
          </label>
        ))}

        {nullable && hasValue && (
          <button
            type="button"
            onClick={() => onChange?.(null)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Effacer la sélection"
          >
            ✕
          </button>
        )}
      </div>
    );
  },
);

RadioGroup.displayName = "RadioGroup";
