import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, Info, type LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../../utils";

const calloutVariants = cva(
  "w-full my-2 flex gap-3 p-4 rounded-lg border [&>div]:flex-1 [&>div]:min-h-6",
  {
    variants: {
      variant: {
        default: "bg-gray-50 border-gray-200 text-gray-800",
        important: "bg-red-50 border-red-200 text-red-800",
        goodToKnow: "bg-blue-50 border-blue-200 text-blue-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const variantIcons: Record<string, LucideIcon> = {
  important: AlertTriangle,
  goodToKnow: Info,
};

export interface CalloutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof calloutVariants> {}

const Callout = React.forwardRef<HTMLDivElement, CalloutProps>(
  ({ className, variant, children, ...props }, ref) => {
    const Icon = variant ? variantIcons[variant] : undefined;

    return (
      <div
        ref={ref}
        className={cn(calloutVariants({ variant, className }))}
        {...props}
      >
        {Icon && <Icon className="shrink-0 mt-0.5" size={20} />}
        {children}
      </div>
    );
  },
);
Callout.displayName = "Callout";

export { Callout, calloutVariants };
