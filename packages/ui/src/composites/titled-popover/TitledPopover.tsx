"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../overlays/popover";
import { cn } from "../../utils";

export interface TitledPopoverProps {
  title: string;
  trigger: React.ReactElement;
  children: React.ReactNode;
  align?: React.ComponentProps<typeof PopoverContent>["align"];
  side?: React.ComponentProps<typeof PopoverContent>["side"];
  contentClassName?: string;
  onOpenChange?: (open: boolean) => void;
  /** "click" (default) — Radix toggle natif. "hover" — survol avec délai anti-flicker. */
  openOn?: "click" | "hover";
  /** Ferme le popover au clic sur un enfant. */
  closeOnChildClick?: boolean;
}

export function TitledPopover({
  title,
  trigger,
  children,
  align = "start",
  side = "bottom",
  contentClassName,
  onOpenChange,
  openOn = "click",
  closeOnChildClick = false,
}: TitledPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const openedByMouseRef = React.useRef(false);
  const closedByMouseRef = React.useRef(false);

  React.useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const handleHoverOpen = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (!open) {
      openedByMouseRef.current = true;
      setOpen(true);
      onOpenChange?.(true);
    }
  };

  const handleHoverClose = () => {
    closeTimer.current = setTimeout(() => {
      closedByMouseRef.current = true;
      setOpen(false);
      onOpenChange?.(false);
    }, 80);
  };

  const handleOpenChange = (next: boolean) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(next);
    onOpenChange?.(next);
  };

  const triggerEl =
    openOn === "hover"
      ? React.cloneElement(
          trigger as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
          { onMouseEnter: handleHoverOpen, onMouseLeave: handleHoverClose },
        )
      : trigger;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{triggerEl}</PopoverTrigger>

      {openOn === "hover" ? (
        <PopoverContent
          align={align}
          side={side}
          className={cn("p-0 pb-2", contentClassName)}
          onMouseEnter={handleHoverOpen}
          onMouseLeave={handleHoverClose}
          onOpenAutoFocus={(e) => {
            if (openedByMouseRef.current) e.preventDefault();
          }}
          onCloseAutoFocus={(e) => {
            if (closedByMouseRef.current) {
              e.preventDefault();
              closedByMouseRef.current = false;
            }
          }}
        >
          <Header title={title} />
          <button
            type={"button"}
            onClick={
              closeOnChildClick ? () => handleOpenChange(false) : undefined
            }
          >
            {children}
          </button>
        </PopoverContent>
      ) : (
        <PopoverContent
          align={align}
          side={side}
          className={cn("p-0 pb-2", contentClassName)}
        >
          <Header title={title} />
          <div
            role="none"
            onClick={
              closeOnChildClick ? () => handleOpenChange(false) : undefined
            }
            onKeyDown={
              closeOnChildClick
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleOpenChange(false);
                  }
                : undefined
            }
          >
            {children}
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}

function Header({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-1 pt-2 pb-1">
      <span className="block px-4 text-sm text-[var(--text-default-grey,#3a3a3a)]">
        {title}
      </span>
      <hr className="border-[var(--border-default-grey,#dddddd)]" />
    </div>
  );
}
