import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded font-semibold text-sm px-2.5 py-0.5 transition-colors",
  {
    variants: {
      variant: {
        success: "bg-green-100 text-green-700 border border-green-200",
        danger: "bg-red-100 text-red-700 border border-red-200",
        warning: "bg-yellow-100 text-yellow-700 border border-yellow-200",
        info: "bg-blue-100 text-blue-700 border border-blue-200",
        neutral: "bg-gray-100 text-gray-700 border border-gray-200",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-0.5",
        lg: "text-base px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, children, ...props }, ref) => (
    <span
      className={cn(badgeVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  ),
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
