"use client";

import * as React from "react";

import { Input } from "../input";

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
 * Reuses the Input primitive with leftIcon/rightIcon slots.
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
    // Uses ref for onChange to avoid unnecessary effect re-runs
    React.useEffect(() => {
      const timer = setTimeout(() => {
        // Only emit if value actually changed
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

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="search"
        role="searchbox"
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
