import * as React from "react";
import { Switch } from "../primitives/switch";
import { cn } from "../utils";

export interface SwitchFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  hint?: string;
  className?: string;
}

/**
 * SwitchField — A Switch with its visible label (and an optional hint).
 *
 * @example
 * ```tsx
 * <SwitchField label="Afficher la description" checked={on} onChange={setOn} />
 * ```
 */
export function SwitchField({
  label,
  checked,
  onChange,
  disabled,
  hint,
  className,
}: SwitchFieldProps) {
  const id = React.useId();

  return (
    <div
      className={cn("flex items-center justify-between gap-8 py-2", className)}
    >
      <div className="flex flex-wrap items-center gap-x-3">
        <label
          htmlFor={id}
          className="text-base font-medium leading-6 text-(--text-default-grey)"
        >
          {label}
        </label>
        {hint && (
          <span className="text-xs text-(--text-mention-grey)">{hint}</span>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
SwitchField.displayName = "SwitchField";
