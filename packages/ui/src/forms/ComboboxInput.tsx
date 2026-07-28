import { cva, type VariantProps } from "class-variance-authority";
import { Check, Crown, X } from "lucide-react";
import * as React from "react";
import { cn } from "../utils";

/**
 * Variants for the ComboboxInput component.
 */
const comboboxInputVariants = cva("w-full h-full relative", {
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

  /**
   * Optional per-option background colors (option value → CSS color).
   * Used for `optionVariant="pill"` (thèmes/besoins colorés par thème).
   * Falls back to the uniform pill color when a value has no entry.
   */
  optionColors?: Record<string, string>;

  /**
   * When true, render a prominent DSFR-styled search field (grey background,
   * bottom border, always-visible placeholder) above the selected tags, instead
   * of the compact transparent input that sits among the tags. Used by the
   * departments picker.
   */
  searchField?: boolean;

  /** Additional class names */
  className?: string;
}

// Pill text color (always applied). Background is either a per-option color
// (via `optionColors`) or this uniform fallback.
const PILL_TEXT = "text-[var(--text-default-grey)]";
const PILL_BG_UNIFORM = "bg-[var(--background-action-low-blue-france)]";

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
  optionColors,
  searchField = false,
  className,
}: ComboboxInputProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

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

  // Pills: hide already-selected options from the dropdown (they show as tags).
  // Checkbox rows keep selected options visible (with their checkmark).
  const displayedOptions = React.useMemo(
    () =>
      optionVariant === "pill"
        ? filteredOptions.filter((opt) => !value.includes(opt.value))
        : filteredOptions,
    [filteredOptions, optionVariant, value],
  );

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
      {/* Prominent DSFR search field (departments picker): a visible input above
          the tags with an always-on placeholder, matching the mockup. */}
      {searchField && !isAtMax && (
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="mb-2 w-full rounded-t-[4px] border-x-0 border-t-[1px] border-t-[color:var(--border-default-grey)] border-b-2 border-b-[color:var(--border-plain-grey)] bg-[var(--background-contrast-grey)] px-4 py-2 text-[14px] leading-[24px] text-[var(--text-default-grey)] outline-none placeholder:text-[var(--text-mention-grey)]"
        />
      )}

      {/* Selected tags + inline search input. Clicking anywhere in this zone opens
          the dropdown and focuses the input — not only the input itself. Clicks on
          the tags' remove buttons are handled separately (stopPropagation).
          A plain <div> is used (not <label>) because a label forwards clicks to
          its first focusable descendant, which would trigger a tag's X button. */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: acts as the click target for the nested search input */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard users reach the nested input via Tab, whose onFocus opens the dropdown */}
      <div
        onClick={() => {
          if (disabled || isAtMax) return;
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className={cn(
          "flex flex-wrap content-start items-center gap-x-4 gap-y-3 p-1",
          !searchField && "h-full min-h-[2.5rem]",
          !disabled && !isAtMax && "cursor-text",
          variant === "default" && "rounded-md",
        )}
      >
        {value.map((val, index) => {
          const tagColor = optionColors?.[val];
          return (
            <span
              key={val}
              className={cn(
                "inline-flex items-center gap-1 rounded-[12px] px-2 py-0.5 text-[12px] leading-[20px]",
                PILL_TEXT,
                !tagColor && PILL_BG_UNIFORM,
              )}
              style={tagColor ? { backgroundColor: tagColor } : undefined}
            >
              {getLabel(val)}
              {firstBadgeLabel && index === 0 && (
                <span className="inline-flex items-center gap-1 rounded-[16px] bg-[var(--background-default-grey)] px-1.5 text-[10px] leading-[16px] text-[var(--text-default-grey)]">
                  {firstBadgeLabel}
                  <Crown
                    size={12}
                    className="shrink-0 fill-[#FABE30] text-[#FABE30]"
                  />
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
          );
        })}
        {isAtMax ? (
          <span className="text-xs text-amber-500 px-1">{maxItems} max</span>
        ) : searchField ? null : (
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={value.length === 0 ? placeholder : ""}
            disabled={disabled}
            className="flex-1 min-w-[80px] outline-none bg-transparent text-sm py-1"
          />
        )}
      </div>

      {/* Dropdown panel — DSFR style */}
      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xs border border-[var(--border-default-grey)] bg-white shadow-lg">
          <div className="border-[var(--border-default-grey)] px-3 py-2 text-[14px] font-medium leading-[24px] text-[var(--text-mention-grey)]">
            {panelTitle}
          </div>
          <div
            className={cn(
              "max-h-60 overflow-auto p-2",
              optionVariant === "pill" &&
                (optionLayout === "wrap"
                  ? "flex flex-wrap gap-x-4 gap-y-3"
                  : "flex flex-col items-start gap-x-4 gap-y-3"),
            )}
          >
            {displayedOptions.length === 0 ? (
              <div className="px-1 py-2 text-sm text-[var(--text-mention-grey)]">
                Aucun résultat
              </div>
            ) : (
              displayedOptions.map((option) => {
                const isSelected = value.includes(option.value);

                if (optionVariant === "pill") {
                  const pillColor = optionColors?.[option.value];
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleValue(option.value)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-[12px] px-2 py-0.5 text-left text-[12px] leading-[20px]",
                        PILL_TEXT,
                        !pillColor && PILL_BG_UNIFORM,
                      )}
                      style={
                        pillColor ? { backgroundColor: pillColor } : undefined
                      }
                    >
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
