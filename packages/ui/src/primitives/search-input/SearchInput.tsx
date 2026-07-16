"use client";

import * as Popover from "@radix-ui/react-popover";
import {
  RiArrowDownSLine,
  RiCloseCircleFill,
  RiSearchLine,
} from "@remixicon/react";
import * as React from "react";
import { cn } from "../../utils";
import { Icon } from "../icon/Icon";
import { Input } from "../input";

export interface SearchScopeOption {
  label: string;
  value: string;
}

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  /** Current search value */
  value: string;
  /** Called after debounce delay with new value */
  onChange: (value: string) => void;
  /** Placeholder text (default: "Rechercher...") */
  placeholder?: string;
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
  /** Classes to apply to the wrapper div (e.g., col-span-2 for grid layouts) */
  wrapperClassName?: string;

  /** When provided, renders a single-select scope dropdown on the left. */
  scopeOptions?: SearchScopeOption[];
  /** Selected scope value ("" = none selected). */
  scope?: string;
  /** Called immediately when the scope changes ("" clears it). */
  onScopeChange?: (value: string) => void;
  /** Dropdown label shown when no scope is selected (default: "Rechercher par"). */
  scopeLabel?: string;
}

// Static icons hoisted outside component to avoid recreation on every render
// (Vercel rule: rendering-hoist-jsx)
const SearchIcon = (
  <svg
    className="h-4 w-4 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const ClearIcon = (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

/**
 * Search input with built-in debounce and clear button.
 * With `scopeOptions`, also renders a single-select "Rechercher par" dropdown
 * (RI-1183) styled as a left segment inside the bordered search container.
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      placeholder = "Rechercher...",
      debounceMs = 300,
      className,
      wrapperClassName,
      scopeOptions,
      scope = "",
      onScopeChange,
      scopeLabel = "Rechercher par",
      ...props
    },
    ref,
  ) => {
    // Internal state for immediate UI feedback
    const [internalValue, setInternalValue] = React.useState(value);

    // Store onChange in a ref to avoid effect re-runs when parent passes inline function
    // (Vercel rule: rerender-dependencies)
    const onChangeRef = React.useRef(onChange);
    React.useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    // Sync internal value when external value changes (e.g., on clear)
    React.useEffect(() => {
      setInternalValue(value);
    }, [value]);

    // Debounce: emit onChange only after delay
    React.useEffect(() => {
      const timer = setTimeout(() => {
        if (internalValue !== value) {
          onChangeRef.current(internalValue);
        }
      }, debounceMs);

      return () => clearTimeout(timer);
    }, [internalValue, debounceMs, value]);

    const handleClear = () => {
      setInternalValue("");
      onChangeRef.current("");
    };

    // Clear button - only shown when there's a value
    const clearButton = internalValue ? (
      <button
        type="button"
        onClick={handleClear}
        className="text-gray-400 hover:text-gray-600"
        aria-label="Effacer la recherche"
      >
        {ClearIcon}
      </button>
    ) : undefined;

    // --- Scoped variant (RI-1183) ---
    if (scopeOptions) {
      return (
        <ScopedSearchInput
          ref={ref}
          internalValue={internalValue}
          setInternalValue={setInternalValue}
          handleClear={handleClear}
          placeholder={placeholder}
          wrapperClassName={wrapperClassName}
          scopeOptions={scopeOptions}
          scope={scope}
          onScopeChange={onScopeChange}
          scopeLabel={scopeLabel}
          {...props}
        />
      );
    }

    // --- Default variant (unchanged) ---
    return (
      <Input
        ref={ref}
        type="search"
        aria-label={placeholder}
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        leftIcon={SearchIcon}
        rightIcon={clearButton}
        className={className}
        wrapperClassName={wrapperClassName}
        {...props}
      />
    );
  },
);

SearchInput.displayName = "SearchInput";

interface ScopedSearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  internalValue: string;
  setInternalValue: (v: string) => void;
  handleClear: () => void;
  placeholder?: string;
  wrapperClassName?: string;
  scopeOptions: SearchScopeOption[];
  scope: string;
  onScopeChange?: (value: string) => void;
  scopeLabel: string;
}

const ScopedSearchInput = React.forwardRef<
  HTMLInputElement,
  ScopedSearchInputProps
>(
  (
    {
      internalValue,
      setInternalValue,
      handleClear,
      placeholder,
      wrapperClassName,
      scopeOptions,
      scope,
      onScopeChange,
      scopeLabel,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const hasScope = scope !== "";
    const selectedLabel = scopeOptions.find((o) => o.value === scope)?.label;

    const select = (value: string) => {
      onScopeChange?.(value);
      setOpen(false);
    };

    return (
      <div
        className={cn(
          "flex items-center rounded-[4px] border bg-white overflow-hidden",
          "border-[--border-default-grey]",
          wrapperClassName,
        )}
      >
        <Popover.Root open={open} onOpenChange={setOpen}>
          {/* Left segment: the label always opens the popover (switch scope in
              one click); when a scope is active a separate button clears it. */}
          <div
            className={cn(
              "flex items-center self-stretch border-r transition-colors",
              hasScope
                ? "bg-(--background-active-blue-france) border-(--background-active-blue-france) text-(--text-inverted-blue-france)"
                : "border-(--border-default-grey) text-(--text-default-grey)",
            )}
          >
            <Popover.Trigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 self-stretch py-[6px] pl-3 pr-2 text-sm font-medium leading-6 whitespace-nowrap cursor-pointer"
                aria-label={scopeLabel}
              >
                {selectedLabel ?? scopeLabel}
                {!hasScope && <Icon icon={RiArrowDownSLine} size="sm" />}
              </button>
            </Popover.Trigger>
            {hasScope && (
              <button
                type="button"
                onClick={() => onScopeChange?.("")}
                className="flex items-center self-stretch pl-1 pr-2 cursor-pointer"
                aria-label="Effacer le filtre de recherche"
              >
                <Icon icon={RiCloseCircleFill} size="sm" />
              </button>
            )}
          </div>
          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={4}
              className={cn(
                "z-50 min-w-[140px] rounded-lg border bg-white p-2 shadow-md",
                "border-(--border-default-grey)",
                "animate-in fade-in-0 zoom-in-95",
              )}
            >
              <button
                type="button"
                onClick={() => select("")}
                className={cn(
                  "block w-full text-left text-sm font-medium leading-6 px-2 py-1 rounded-sm",
                  "text-(--text-default-grey)",
                  "hover:bg-(--background-alt-grey)",
                  scope === "" && "font-bold",
                )}
              >
                Aucun
              </button>
              {scopeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => select(option.value)}
                  className={cn(
                    "block w-full text-left text-sm font-medium leading-6 px-2 py-1 rounded-sm",
                    "text-(--text-default-grey)",
                    "hover:bg-(--background-alt-grey)",
                    scope === option.value && "font-bold",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <div className="flex items-center gap-2 px-3 py-[6px] flex-1">
          <input
            ref={ref}
            type="search"
            aria-label={placeholder}
            value={internalValue}
            onChange={(e) => setInternalValue(e.target.value)}
            placeholder={placeholder}
            className="text-sm text-(--text-default-grey) placeholder:text-(--text-disabled-grey) bg-transparent outline-none w-full min-w-[120px]"
            {...props}
          />
          {internalValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-(--text-disabled-grey) hover:text-(--text-default-grey) shrink-0"
              aria-label="Effacer la recherche"
            >
              <RiCloseCircleFill className="w-4 h-4" />
            </button>
          ) : (
            <RiSearchLine className="w-4 h-4 text-(--text-disabled-grey) shrink-0" />
          )}
        </div>
      </div>
    );
  },
);

ScopedSearchInput.displayName = "ScopedSearchInput";
