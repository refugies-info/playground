import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../utils";
import { FieldMessage } from "./FieldMessage";

/**
 * Variants for the TextInput component.
 */
const textInputVariants = cva("w-full outline-none", {
  variants: {
    variant: {
      default:
        "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500",
      inline: "bg-transparent  text-inherit",
      // DSFR "Champ de saisie" — fond gris contrasté, bordure basse pleine
      dsfr: "rounded-t-[4px] border-0 border-b-2 border-[var(--border-plain-grey)] bg-[var(--background-contrast-grey)] px-4 py-2 text-[14px] leading-[24px] text-[var(--text-default-grey)]",
    },
    hasError: {
      true: "border-red-500 focus:border-red-500 focus:ring-red-500",
      false: "",
    },
  },
  compoundVariants: [
    {
      variant: "dsfr",
      hasError: true,
      className: "border-(--border-plain-error)",
    },
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

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">,
    VariantProps<typeof textInputVariants> {
  /** Current value (controlled) */
  value?: string;

  /** Default value (uncontrolled) */
  defaultValue?: string;

  /** Change handler — receives the new string value */
  onChange?: (value: string) => void;

  /** Error message to display (also sets hasError variant) */
  error?: string;

  /** Label to display above the input */
  label?: string;

  /** Helper text shown under the input while there is no error (dsfr variant) */
  hint?: string;
}

/**
 * TextInput — A text input with inline editing support.
 *
 * @description
 * Two variants available:
 * - `default`: Standard bordered input for forms
 * - `inline`: Transparent background for inline editing (used with EditableField)
 *
 * @example
 * ```tsx
 * // Standard form input
 * <TextInput value={value} onChange={setValue} />
 *
 * // Inline editing mode
 * <TextInput variant="inline" value={value} onChange={setValue} autoFocus />
 * ```
 */
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      className,
      value,
      defaultValue,
      onChange,
      error,
      variant = "default",
      type = "text",
      label,
      hint,
      id: idProp,
      ...props
    },
    ref,
  ) => {
    // Generate a unique ID if not provided, ensuring label-input association
    const generatedId = React.useId();
    const id = idProp ?? generatedId;

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
      },
      [onChange],
    );

    return (
      <div className="space-y-1">
        {label && (
          <label
            className={cn(
              "font-medium",
              variant === "dsfr" ? "text-base leading-6" : "text-sm",
              variant === "dsfr" && error && "text-(--text-default-error)",
            )}
            htmlFor={id}
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          type={type}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={cn(
            textInputVariants({ variant, hasError: !!error }),
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {error &&
          (variant === "dsfr" ? (
            <FieldMessage id={`${id}-error`} variant="error">
              {error}
            </FieldMessage>
          ) : (
            <p
              id={`${id}-error`}
              className="text-[12px] leading-[20px] text-(--text-default-error)"
            >
              {error}
            </p>
          ))}
        {!error && hint && <FieldMessage variant="info">{hint}</FieldMessage>}
      </div>
    );
  },
);

TextInput.displayName = "TextInput";
