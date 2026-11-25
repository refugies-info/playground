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
    <div className={cn("flex items-center gap-3", className)}>
      <Switch
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <label htmlFor={id} className="text-base">
        {label}
      </label>
      {hint && (
        <span className="text-xs text-(--text-mention-grey)">{hint}</span>
      )}
    </div>
  );
}
SwitchField.displayName = "SwitchField";
