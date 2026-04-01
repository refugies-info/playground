"use client";

import {
  RiArrowDownLine,
  RiArrowUpDownLine,
  RiArrowUpLine,
} from "@remixicon/react";
import type { Column } from "@tanstack/react-table";
import type * as React from "react";
import { Icon } from "../../primitives/icon/Icon";
import { cn } from "../../utils/cn";

/**
 * Titre de colonne — bouton de tri pour les headers TanStack Table.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1256-5614
 *
 * 3 variants (Figma component set 1256:5614) :
 *   Statut=No         → texte title-grey (#161616), icône Tri (#FFFFFF) xs=12px
 *   Statut=Ascendant  → texte blue-france-hover (#1212FF), icône arrow-up (#1212FF) xs=12px
 *   Statut=Descendant → texte blue-france-hover (#1212FF), icône arrow-down (#1212FF) xs=12px
 *
 * Layout : row, gap 4px — padding délégué à TableHead (12px 4px 12px 16px)
 */

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLButtonElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const sorted = column.getIsSorted();

  if (!column.getCanSort()) {
    return (
      <span
        className={cn(
          "text-xs font-medium text-[var(--text-title-grey,#161616)]",
          className,
        )}
      >
        {title}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1 cursor-pointer select-none",
        "text-xs font-medium",
        sorted
          ? "text-[var(--blue-france-sun-113-625-hover,#1212FF)]"
          : "text-[var(--text-title-grey,#161616)]",
        className,
      )}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      {sorted === "asc" ? (
        <Icon icon={RiArrowUpLine} size="xs" />
      ) : sorted === "desc" ? (
        <Icon icon={RiArrowDownLine} size="xs" />
      ) : (
        // Statut=No : icône Tri, currentColor → hérite de title-grey (#161616)
        <Icon icon={RiArrowUpDownLine} size="xs" />
      )}
    </button>
  );
}
