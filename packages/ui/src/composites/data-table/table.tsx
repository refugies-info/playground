import * as React from "react";
import { cn } from "../../utils/cn";

/**
 * Primitives HTML table — usage interne à DataTable.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1255-8744
 *
 * Header : bg action-low-blue-france (#E3E3FD), texte title-grey (#161616) 12px medium
 * Zèbre  : lignes paires bg alt-blue-france (#F5F5FE) — via data-zebra="true" sur TableRow
 * Cells  : padding 12px 16px
 */

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto border border-[var(--border-default-grey,#DDDDDD)]">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      // Figma: action-low-blue-france (#E3E3FD), sticky
      "border-b border-[var(--border-default-grey,#DDDDDD)] sticky top-0 z-10",
      "bg-[var(--background-action-low-blue-france,#E3E3FD)]",
      className,
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-[var(--border-default-grey,#DDDDDD)] font-medium [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-[var(--border-default-grey,#DDDDDD)] transition-colors",
      // Zèbre : data-zebra="true" → alt-blue-france (#F5F5FE)
      "data-[zebra=true]:bg-[var(--background-alt-blue-france,#F5F5FE)]",

      "data-[state=selected]:bg-[var(--background-alt-blue-france,#F5F5FE)]",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      // Figma: padding 12px 4px 12px 16px, texte 12px medium, title-grey (#161616)
      // Note: le gap de 4px avec l'icône sort est géré dans DataTableColumnHeader
      "pt-3 pr-1 pb-3 pl-4 text-left align-middle whitespace-nowrap",
      "text-xs font-medium text-[var(--text-title-grey,#161616)]",
      "[&:has([role=checkbox])]:pr-0",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      // Figma: padding 12px 16px
      "px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0",
      className,
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn(
      "mt-4 text-sm text-[var(--text-mention-grey,#666666)]",
      className,
    )}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
