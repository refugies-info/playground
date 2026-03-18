"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../utils";

const errorCardVariants = cva(
  "w-full max-w-md rounded-lg border p-8 shadow-sm",
  {
    variants: {
      variant: {
        error: "border-red-200 bg-white",
        warning: "border-yellow-200 bg-white",
      },
    },
    defaultVariants: {
      variant: "error",
    },
  },
);

export interface ErrorCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof errorCardVariants> {
  /** Optional: rendered as h2 with proper styling */
  title?: React.ReactNode;
  /** Icon displayed before the title */
  icon?: React.ReactNode;
  /** Optional retry button - pass onClick handler to show the button */
  onRetry?: () => void;
  /** Custom retry button text */
  retryLabel?: string;
}

/**
 * Generic error display component.
 *
 * Use it as a container for any error content:
 * ```tsx
 * <ErrorCard title="Service indisponible" icon={<WifiOff />}>
 *   <p>La base de données ne répond pas.</p>
 * </ErrorCard>
 * ```
 */
const ErrorCard = React.forwardRef<HTMLDivElement, ErrorCardProps>(
  (
    {
      className,
      variant = "error",
      title,
      icon,
      onRetry,
      retryLabel = "Réessayer",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(errorCardVariants({ variant, className }))}
        {...props}
      >
        {(icon || title) && (
          <div className="mb-4 flex items-center gap-3">
            {icon && (
              <span className="text-red-500" aria-hidden="true">
                {icon}
              </span>
            )}
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
          </div>
        )}

        {children}

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            {retryLabel}
          </button>
        )}
      </div>
    );
  },
);
ErrorCard.displayName = "ErrorCard";

export { ErrorCard, errorCardVariants };
