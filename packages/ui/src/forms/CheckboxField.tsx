import { RiCheckLine, RiInformationLine } from "@remixicon/react";
import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../overlays/tooltip";
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
 * CheckboxField — DSFR checkbox with its visible label (and an optional hint in an info bubble).
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
  const hintId = `${id}-hint`;

  return (
    <div className={cn("flex items-start gap-2 py-2", className)}>
      <span className="relative mt-[3px] flex size-[18px] shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-describedby={hint ? hintId : undefined}
          onChange={(event) => onChange(event.target.checked)}
          className="peer size-full cursor-pointer appearance-none rounded-[4px] border border-(--border-action-high-blue-france) checked:bg-(--background-action-high-blue-france) disabled:cursor-not-allowed disabled:border-(--border-disabled-grey) disabled:checked:bg-(--background-disabled-grey) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-action-high-blue-france)"
        />
        <RiCheckLine
          aria-hidden="true"
          className="pointer-events-none absolute inset-[2px] hidden size-3.5 text-(--text-inverted-blue-france) peer-checked:block peer-disabled:text-(--text-disabled-grey)"
        />
      </span>
      <div className="flex items-center gap-1">
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
          <>
            <span id={hintId} className="sr-only">
              {hint}
            </span>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Informations sur « ${label} »`}
                    className="flex size-6 shrink-0 cursor-help items-center justify-center rounded-full text-(--text-mention-grey) focus-visible:outline-2 focus-visible:outline-(--border-action-high-blue-france)"
                  >
                    <RiInformationLine className="size-4" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-70 border-(--border-default-grey) text-xs leading-5 text-(--text-default-grey)">
                  {hint}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
      </div>
    </div>
  );
}
CheckboxField.displayName = "CheckboxField";
