import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../utils";

/**
 * Variants for the EditableField component.
 */
const editableFieldVariants = cva(
  "min-h-[1.5em] w-full rounded px-1 py-0.5 transition-colors",
  {
    variants: {
      mode: {
        // h-full + flex-1: le bouton lecture remplit toute la hauteur de la
        // cellule (conteneur flex-col) → cliquer n'importe où dans la cellule édite.
        // Pas de hover propre : la couleur de survol est portée par la cellule
        // parente (violet en normal, rouge en warning) et transparaît ici, ce qui
        // garde toute la case d'une seule couleur au hover.
        read: "h-full flex-1 cursor-pointer text-left",
        edit: "relative  bg-white",
      },
      isDisabled: {
        true: "cursor-not-allowed opacity-50",
        false: "",
      },
    },
    defaultVariants: {
      mode: "read",
      isDisabled: false,
    },
  },
);

export interface EditableFieldProps
  extends VariantProps<typeof editableFieldVariants> {
  /** Content in read-only mode */
  children?: React.ReactNode;

  /** Render function for edit mode. Receives blur and keyboard handlers. */
  renderEdit: (props: {
    onBlur: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  }) => React.ReactNode;

  /** Whether the field is currently in edit mode */
  isEditing?: boolean;

  /** Callback when edit mode is requested */
  onEdit?: () => void;

  /** Callback when edit mode should exit */
  onExit?: () => void;

  /** Whether the field is disabled */
  disabled?: boolean;

  /** Placeholder text when value is empty */
  placeholder?: string;

  /**
   * Stretch the edit container to the full cell height (used for text fields so
   * the input fills the cell like the read button does). Cards/pickers leave it off.
   */
  fillHeight?: boolean;

  /** Additional class names */
  className?: string;
}

/**
 * EditableField — A wrapper that toggles between read-only and edit mode.
 *
 * @description
 * Provides an inline editing pattern where:
 * - Click on read-only content to enter edit mode
 * - Blur or Escape to exit edit mode
 * - Enter on single-line inputs commits and exits
 *
 * @example
 * ```tsx
 * <EditableField
 *   isEditing={isEditing}
 *   onEdit={() => setIsEditing(true)}
 *   onExit={() => setIsEditing(false)}
 *   renderEdit={({ onBlur }) => (
 *     <input defaultValue={value} onBlur={onBlur} autoFocus />
 *   )}
 * >
 *   {value || "Click to edit"}
 * </EditableField>
 * ```
 */
export const EditableField = React.forwardRef<
  HTMLDivElement,
  EditableFieldProps
>(
  (
    {
      children,
      renderEdit,
      isEditing = false,
      onEdit,
      onExit,
      disabled = false,
      placeholder = "Cliquer pour modifier",
      fillHeight = false,
      className,
    },
    ref,
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Handle click outside to exit edit mode
    React.useEffect(() => {
      if (!isEditing) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          onExit?.();
        }
      };

      // Use mousedown to catch clicks before they reach other elements
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [isEditing, onExit]);

    const handleBlur = React.useCallback(() => {
      onExit?.();
    }, [onExit]);

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onExit?.();
        }
        if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
          e.preventDefault();
          onExit?.();
        }
      },
      [onExit],
    );

    const handleClick = React.useCallback(() => {
      if (!disabled && !isEditing) {
        onEdit?.();
      }
    }, [disabled, isEditing, onEdit]);

    // Read-mode button. Also rendered underneath the edit overlay (see below)
    // so the cell keeps its size while the editing card floats on top.
    const readButton = (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        onClick={handleClick}
        disabled={disabled || isEditing}
        className={cn(
          editableFieldVariants({ mode: "read", isDisabled: disabled }),
          className,
        )}
      >
        {children || (
          <span className="text-gray-400 italic">{placeholder}</span>
        )}
      </button>
    );

    // Card/picker edit mode (fillHeight = false): render the editing UI as an
    // absolute overlay so elle flotte au-dessus du tableau au lieu d'agrandir la
    // cellule et de pousser les lignes. `top-full` l'ancre sous la cellule, comme
    // le panneau du ComboboxInput (thèmes/besoins) : la valeur affichée reste
    // lisible pendant l'édition au lieu d'être recouverte.
    if (isEditing && !fillHeight) {
      return (
        <div ref={containerRef} className="relative flex h-full flex-1">
          {readButton}
          <div className="absolute left-0 top-full z-20 mt-1 w-full">
            {renderEdit({ onBlur: handleBlur, onKeyDown: handleKeyDown })}
          </div>
        </div>
      );
    }

    // Inline edit mode (fillHeight = true, e.g. text inputs): replace the read
    // content in place so the input fills the cell like the read button did.
    if (isEditing) {
      return (
        <div
          ref={containerRef}
          className={cn(
            editableFieldVariants({ mode: "edit", isDisabled: disabled }),
            "h-full flex-1",
            className,
          )}
        >
          {renderEdit({ onBlur: handleBlur, onKeyDown: handleKeyDown })}
        </div>
      );
    }

    // Read mode
    return readButton;
  },
);

EditableField.displayName = "EditableField";
