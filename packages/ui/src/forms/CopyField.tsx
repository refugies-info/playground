"use client";

import * as React from "react";
import { RiCheckLine, RiFileCopyLine } from "../icons";
import { cn } from "../utils";

const COPIED_FEEDBACK_IN_MS = 2000;

export interface CopyFieldProps {
  label: string;
  value: string;
  copyLabel?: string;
  copiedLabel?: string;
  className?: string;
}

export function CopyField({
  label,
  value,
  copyLabel = "Copier",
  copiedLabel = "Copié",
  className,
}: CopyFieldProps) {
  const id = React.useId();
  const [isCopied, setIsCopied] = React.useState(false);

  React.useEffect(() => {
    if (!isCopied) return;
    const timeout = setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_IN_MS);
    return () => clearTimeout(timeout);
  }, [isCopied]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setIsCopied(true);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-bold">
        {label}
      </label>
      <div className="flex">
        <input
          id={id}
          readOnly
          value={value}
          onFocus={(event) => event.currentTarget.select()}
          className="h-10 min-w-0 flex-1 truncate rounded-tl border border-r-0 border-(--border-default-grey) bg-white px-4 text-sm text-(--text-default-grey) outline-none focus-visible:ring-2 focus-visible:ring-(--border-active-blue-france)"
        />
        <button
          type="button"
          onClick={handleCopy}
          title={copyLabel}
          aria-label={isCopied ? copiedLabel : copyLabel}
          className={cn(
            "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-tr px-3 text-sm text-white transition-colors",
            isCopied
              ? "bg-(--background-action-high-success)"
              : "bg-(--background-action-high-blue-france) hover:bg-(--background-action-high-blue-france-hover)",
          )}
        >
          {isCopied ? (
            <>
              <RiCheckLine className="h-4 w-4" aria-hidden="true" />
              {copiedLabel}
            </>
          ) : (
            <RiFileCopyLine className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
CopyField.displayName = "CopyField";
