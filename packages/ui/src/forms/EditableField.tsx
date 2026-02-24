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
        read: "cursor-pointer text-left hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
        edit: "relative border border-blue-300 bg-white",
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
      className,
    },
    ref,
  ) => {
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

    // Edit mode
    if (isEditing) {
      return (
        <div
          ref={ref}
          className={cn(
            editableFieldVariants({ mode: "edit", isDisabled: disabled }),
            className,
          )}
        >
          {renderEdit({ onBlur: handleBlur, onKeyDown: handleKeyDown })}
        </div>
      );
    }

    // Read mode
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
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
  },
);

EditableField.displayName = "EditableField";
