import * as Label from "@radix-ui/react-label";
import * as React from "react";

import { cn } from "../../utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  /** Icon to display on the left side (e.g., search icon) */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side (e.g., clear button) */
  rightIcon?: React.ReactNode;
  /** Classes to apply to the wrapper div (e.g., col-span-2 for grid layouts) */
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      id,
      leftIcon,
      rightIcon,
      wrapperClassName,
      ...props
    },
    ref,
  ) => {
    // Generate ID unconditionally (hooks must be called at top level)
    // Only use it if there's a label that needs it
    const generatedId = React.useId();
    const inputId = id || (label ? generatedId : undefined);

    const inputElement = (
      <input
        id={inputId}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200",
          error && "border-red-500 focus:ring-red-500",
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          className,
        )}
        ref={ref}
        {...props}
      />
    );

    // If icons are present, wrap in a relative container
    const inputWithIcons =
      leftIcon || rightIcon ? (
        <div className="relative w-full">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {leftIcon}
            </div>
          )}
          {inputElement}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightIcon}
            </div>
          )}
        </div>
      ) : (
        inputElement
      );

    return (
      <div className={cn("w-full space-y-2", wrapperClassName)}>
        {label && (
          <Label.Root
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </Label.Root>
        )}
        {inputWithIcons}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
