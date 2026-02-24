import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../utils";

/**
 * Variants for the TextArea component.
 */
const textAreaVariants = cva("w-full outline-none resize-y", {
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
});

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange">,
    VariantProps<typeof textAreaVariants> {
  /** Current value (controlled) */
  value?: string;

  /** Default value (uncontrolled) */
  defaultValue?: string;

  /** Change handler — receives the new string value */
  onChange?: (value: string) => void;

  /** Error message to display (also sets hasError variant) */
  error?: string;
}

/**
 * TextArea — A textarea with inline editing support.
 *
 * @description
 * Two variants available:
 * - `default`: Standard bordered textarea for forms
 * - `inline`: Transparent background for inline editing (used with EditableField)
 *
 * @example
 * ```tsx
 * // Standard form textarea
 * <TextArea value={value} onChange={setValue} rows={4} />
 *
 * // Inline editing mode
 * <TextArea variant="inline" value={value} onChange={setValue} autoFocus />
 * ```
 */
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      value,
      defaultValue,
      onChange,
      error,
      variant = "default",
      rows = 3,
      ...props
    },
    ref,
  ) => {
    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(e.target.value);
      },
      [onChange],
    );

    return (
      <textarea
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        rows={rows}
        className={cn(
          textAreaVariants({ variant, hasError: !!error }),
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
    );
  },
);

TextArea.displayName = "TextArea";
