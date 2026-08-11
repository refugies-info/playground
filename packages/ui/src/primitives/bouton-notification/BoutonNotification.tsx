import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { RiNotification3Line } from "../../icons";
import { cn } from "../../utils";

const boutonNotificationVariants = cva(
  [
    "relative inline-flex size-12 items-center justify-center rounded-3xl",
    "cursor-pointer transition-colors",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-(--border-action-high-blue-france) focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      open: {
        true: "bg-(--background-contrast-info) text-(--blue-france-sun-113-625-hover)",
        false: [
          "bg-(--background-alt-blue-france)",
          "text-(--text-mention-grey)",
          "hover:text-(--text-title-grey)",
        ].join(" "),
      },
    },
    defaultVariants: {
      open: false,
    },
  },
);

export interface BoutonNotificationProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    VariantProps<typeof boutonNotificationVariants> {
  /**
   * Nombre de notifications non lues. Au-dessus de zéro, la pastille apparaît.
   * Sert aussi à l'énoncé accessible, seul endroit où le compte exact est donné.
   */
  unreadCount?: number;
  /** Panneau ouvert — l'état « cliqué » de la maquette. */
  open?: boolean;
  className?: string;
}

export function BoutonNotification({
  unreadCount = 0,
  open = false,
  className,
  "aria-label": ariaLabel,
  ...props
}: BoutonNotificationProps) {
  const hasUnread = unreadCount > 0;

  const label =
    ariaLabel ??
    (hasUnread
      ? `Notifications, ${unreadCount} non ${unreadCount > 1 ? "lues" : "lue"}`
      : "Notifications");

  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={open}
      className={cn(boutonNotificationVariants({ open }), className)}
      {...props}
    >
      <RiNotification3Line size={24} aria-hidden />
      {hasUnread && (
        <span
          aria-hidden
          className="absolute left-7 top-3 size-2 rounded-full bg-(--text-default-warning)"
        />
      )}
    </button>
  );
}
