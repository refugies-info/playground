import { cva, type VariantProps } from "class-variance-authority";
import { Check, Plus, X } from "lucide-react";
import * as React from "react";
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

  /**
   * How each option is rendered in the dropdown panel.
   * - `checkbox` (default): DSFR checkbox rows (public, niveau, conditions…)
   * - `pill`: rounded pill/chip (thèmes, besoins)
   */
  optionVariant?: "checkbox" | "pill";

  /**
   * Layout of the options list (only meaningful for `optionVariant="pill"`).
   * - `list` (default): one item per row (besoins)
   * - `wrap`: chips flowing on multiple rows (thèmes)
   */
  optionLayout?: "list" | "wrap";

  /** Title shown at the top of the dropdown panel */
  panelTitle?: string;

  /** Additional class names */
  className?: string;
}

// Uniform placeholder color for pills/chips.
// TODO: couleur par thème — remplacer par un mapping themeId → couleur DSFR.
const PILL_BASE =
  "bg-[var(--background-action-low-blue-france)] text-[var(--text-default-grey)]";

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
  optionVariant = "checkbox",
  optionLayout = "list",
  panelTitle = "Sélectionne des options",
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
          <span
            key={val}
            className={cn(
              "inline-flex items-center gap-1 rounded-[12px] px-2 py-0.5 text-[12px] leading-[20px]",
              PILL_BASE,
            )}
          >
            {getLabel(val)}
            {firstBadgeLabel && index === 0 && (
              <span className="inline-block rounded-sm bg-[var(--background-default-grey)] px-1 text-[10px] text-[var(--text-default-grey)]">
                {firstBadgeLabel}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeValue(val);
              }}
              className="cursor-pointer hover:text-[var(--text-action-high-blue-france)]"
              disabled={disabled}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {isAtMax ? (
          <span className="text-xs text-amber-500 px-1">{maxItems} max</span>
        ) : (
          <>
            <button
              type="button"
              onClick={() => !disabled && setIsOpen(!isOpen)}
              disabled={disabled}
              className="inline-flex cursor-pointer items-center justify-center w-6 h-6 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded text-lg font-bold"
              aria-label="Ajouter"
            >
              <Plus size={14} />
            </button>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={value.length === 0 ? placeholder : ""}
              disabled={disabled}
              className="flex-1 min-w-[80px] outline-none bg-transparent text-sm py-1"
            />
          </>
        )}
      </div>

      {/* Dropdown panel — DSFR style */}
      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-[var(--border-default-grey)] bg-white shadow-lg">
          <div className="border-b border-[var(--border-default-grey)] px-3 py-2 text-[14px] leading-[24px] text-[var(--text-mention-grey)]">
            {panelTitle}
          </div>
          <div
            className={cn(
              "max-h-60 overflow-auto p-2",
              optionVariant === "pill" &&
                (optionLayout === "wrap"
                  ? "flex flex-wrap gap-2"
                  : "flex flex-col items-start gap-2"),
            )}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-1 py-2 text-sm text-[var(--text-mention-grey)]">
                Aucun résultat
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);

                if (optionVariant === "pill") {
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleValue(option.value)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-[12px] px-2 py-0.5 text-left text-[12px] leading-[20px] transition-shadow",
                        PILL_BASE,
                        isSelected
                          ? "ring-2 ring-[var(--text-action-high-blue-france)]"
                          : "opacity-70 hover:opacity-100",
                      )}
                    >
                      {isSelected && <Check size={12} className="shrink-0" />}
                      {option.label}
                    </button>
                  );
                }

                // Default: DSFR checkbox row
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleValue(option.value)}
                    className="flex w-full items-center gap-2 py-2 pl-2.5 pr-2 text-left hover:bg-[var(--background-alt-grey)]"
                  >
                    <span
                      className={cn(
                        "flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border border-[var(--border-action-high-blue-france)]",
                        isSelected &&
                          "bg-[var(--background-action-high-blue-france)] text-[var(--text-inverted-grey)]",
                      )}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </span>
                    <span className="text-[14px] leading-[24px] text-[var(--text-default-grey)]">
                      {option.label}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

ComboboxInput.displayName = "ComboboxInput";
