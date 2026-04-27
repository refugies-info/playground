"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../utils/cn";

/**
 * Popover — Wrapper Radix UI générique.
 *
 * `PopoverContent` expose un `variant` pour les styles métier courants :
 *   - `default` : neutre (pas de border ni shadow prédéfinis)
 *   - `panel`   : style PublishPanel — Figma node 1824-25605
 *                 border #dddddd, radius 4px, padding 24px, width 368px
 *
 * Usage avec variant :
 *   <PopoverContent variant="panel" align="end">…</PopoverContent>
 *
 * Usage custom (className libre) :
 *   <PopoverContent className="w-48 p-3 border shadow-md">…</PopoverContent>
 */

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;
const PopoverClose = PopoverPrimitive.Close;

const popoverContentVariants = cva(
  // Base : positionnement + animations Radix
  [
    "z-50 outline-none",
    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
    "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
    "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
  ],
  {
    variants: {
      variant: {
        /** Neutre — styles laissés au consommateur via className */
        default: "",
        /**
         * Style PublishPanel — Figma node 1824-25605
         * border #dddddd, radius 4px, padding 24px, width 368px, fond blanc
         */
        panel:
          "w-[368px] rounded-xs bg-white p-6 border border-[var(--border-default-grey,#dddddd)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

interface PopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
    VariantProps<typeof popoverContentVariants> {}

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ className, variant, align = "center", sideOffset = 8, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(popoverContentVariants({ variant }), className)}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverAnchor, PopoverClose, PopoverContent };
