import { RiCheckLine } from "@remixicon/react";
import * as React from "react";
import { cn } from "../utils";

export interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  hint?: string;
  className?: string;
}

/**
 * CheckboxField — DSFR checkbox with its visible label (and an optional hint).
 *
 * @example
 * ```tsx
 * <CheckboxField label="Thème" checked={on} onChange={setOn} />
 * ```
 */
export function CheckboxField({
  label,
  checked,
  onChange,
  disabled,
  hint,
  className,
}: CheckboxFieldProps) {
  const id = React.useId();

  return (
    <div className={cn("flex items-start gap-2 py-2", className)}>
      <span className="relative mt-[3px] flex size-[18px] shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer size-full cursor-pointer appearance-none rounded-[4px] border border-(--border-action-high-blue-france) checked:bg-(--background-action-high-blue-france) disabled:cursor-not-allowed disabled:border-(--border-disabled-grey) disabled:checked:bg-(--background-disabled-grey) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-action-high-blue-france)"
        />
        <RiCheckLine
          aria-hidden="true"
          className="pointer-events-none absolute inset-[2px] hidden size-3.5 text-(--text-inverted-blue-france) peer-checked:block peer-disabled:text-(--text-disabled-grey)"
        />
      </span>
      <div className="flex flex-col">
        <label
          htmlFor={id}
          className={cn(
            "text-base leading-6 text-(--text-default-grey)",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
          )}
        >
          {label}
        </label>
        {hint && (
          <span className="text-sm leading-6 text-(--text-mention-grey)">
            {hint}
          </span>
        )}
      </div>
    </div>
  );
}
CheckboxField.displayName = "CheckboxField";
