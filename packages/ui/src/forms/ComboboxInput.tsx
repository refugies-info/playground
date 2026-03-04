import { cva, type VariantProps } from "class-variance-authority";
import { Plus, X } from "lucide-react";
import * as React from "react";
import { Badge } from "../primitives";
import { cn } from "../utils";

/**
 * Variants for the ComboboxInput component.
 */
const comboboxInputVariants = cva("w-full relative", {
  variants: {
    variant: {
      default: "rounded-md border border-gray-300 bg-white",
      inline: "bg-transparent",
    },
    hasError: {
      true: "border-red-500",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    hasError: false,
  },
});

export interface ComboboxInputProps
  extends VariantProps<typeof comboboxInputVariants> {
  /** Options to display */
  options: readonly { value: string; label: string }[];

  /** Currently selected values */
  value: string[];

  /** Change handler — receives the array of selected values */
  onChange: (value: string[]) => void;

  /** Blur handler */
  onBlur?: () => void;

  /** Placeholder text for search input */
  placeholder?: string;

  /** Error message to display */
  error?: string;

  /** Whether the field is disabled */
  disabled?: boolean;

  /** Label to display on the first badge (e.g., "thème principal") */
  firstBadgeLabel?: string;

  /** Maximum number of items that can be selected */
  maxItems?: number;

  /** Additional class names */
  className?: string;
}

/**
 * ComboboxInput — A searchable multi-select component.
 *
 * @description
 * Provides a searchable dropdown with multi-select capability.
 * - Type to filter options
 * - Click to toggle selection
 * - Shows selected items as removable tags
 *
 * @example
 * ```tsx
 * const options = [
 *   { value: "A1", label: "A1 - Débutant" },
 *   { value: "A2", label: "A2 - Élémentaire" },
 * ];
 *
 * <ComboboxInput
 *   options={options}
 *   value={selectedLevels}
 *   onChange={setSelectedLevels}
 *   placeholder="Rechercher un niveau..."
 * />
 * ```
 */
export function ComboboxInput({
  options,
  value,
  onChange,
  onBlur,
  placeholder = "",
  error,
  disabled = false,
  variant = "default",
  firstBadgeLabel,
  maxItems,
  className,
}: ComboboxInputProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const isAtMax = maxItems !== undefined && value.length >= maxItems;

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    const searchLower = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(searchLower) ||
        opt.value.toLowerCase().includes(searchLower),
    );
  }, [options, search]);

  // Close on outside click (but not when clicking inside dropdown)
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlur]);

  // Toggle a value
  const toggleValue = React.useCallback(
    (val: string) => {
      if (value.includes(val)) {
        onChange(value.filter((v) => v !== val));
      } else {
        if (isAtMax) return;
        onChange([...value, val]);
      }
    },
    [value, onChange, isAtMax],
  );

  // Remove a value
  const removeValue = React.useCallback(
    (val: string) => {
      onChange(value.filter((v) => v !== val));
    },
    [value, onChange],
  );

  // Get label for a value
  const getLabel = React.useCallback(
    (val: string) => {
      return options.find((opt) => opt.value === val)?.label ?? val;
    },
    [options],
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        comboboxInputVariants({ variant, hasError: !!error }),
        className,
      )}
    >
      {/* Selected tags + search input */}
      <div
        className={cn(
          "flex flex-wrap gap-1 p-1 min-h-[2.5rem] items-center",
          variant === "default" && "rounded-md",
        )}
      >
        {value.map((val, index) => (
          <Badge
            key={val}
            variant="info"
            size="sm"
            className="gap-1 items-center"
          >
            {getLabel(val)}
            {firstBadgeLabel && index === 0 && (
              <span className="bg-white text-black inline-block px-1 rounded-sm text-[10px]">
                {firstBadgeLabel}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeValue(val);
              }}
              className="hover:text-blue-600 cursor-pointer"
              disabled={disabled}
            >
              <X size={12} />
            </button>
          </Badge>
        ))}
        <button
          type="button"
          onClick={() => !disabled && !isAtMax && setIsOpen(!isOpen)}
          disabled={disabled || isAtMax}
          className={cn(
            "inline-flex cursor-pointer items-center justify-center w-6 h-6 rounded text-lg font-bold",
            isAtMax
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-500 hover:text-blue-600 hover:bg-blue-50",
          )}
          aria-label="Ajouter"
        >
          <Plus size={14} />
        </button>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => !isAtMax && setIsOpen(true)}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled || isAtMax}
          className="flex-1 min-w-[80px] outline-none bg-transparent text-sm py-1"
        />
        {isAtMax && (
          <span className="text-xs text-amber-500 pr-1">{maxItems} max</span>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              Aucun résultat
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleValue(option.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleValue(option.value);
                    }
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2",
                    isSelected && "bg-blue-50",
                  )}
                >
                  <span
                    className={cn(
                      "w-4 h-4 border rounded flex items-center justify-center",
                      isSelected
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-gray-300",
                    )}
                  >
                    {isSelected && "✓"}
                  </span>
                  {option.label}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

ComboboxInput.displayName = "ComboboxInput";
