"use client";

import {
  DataTableColumnHeader,
  DateCell,
  TextCell,
} from "@playground/ui/composites";
import { RiAlertLine, RiFileCopyLine } from "@playground/ui/icons";
import { Button, Tag } from "@playground/ui/primitives";
import type { ColumnDef } from "@tanstack/react-table";
import {
  WIDGET_STATUS_TAGS,
  WIDGET_TYPE_LABELS,
  type WidgetRow,
  type WidgetSortField,
} from "@/lib/widget-list";

const header =
  (title: string): ColumnDef<WidgetRow>["header"] =>
  ({ column }) => <DataTableColumnHeader column={column} title={title} />;

interface GetColumnsOptions {
  duplicatingId: string | null;
  onDuplicate: (widget: WidgetRow) => void;
}

export function getColumns({
  duplicatingId,
  onDuplicate,
}: GetColumnsOptions): ColumnDef<WidgetRow>[] {
  const id = (field: WidgetSortField) => field;

  return [
    {
      id: id("status"),
      accessorFn: (row) => row.displayedStatus,
      header: header("Statut"),
      size: 136,
      cell: ({ row }) => {
        const { tag, label } = WIDGET_STATUS_TAGS[row.original.displayedStatus];
        if (!label) return <Tag status={tag} />;
        return (
          <Tag status={tag}>
            {label}
            {row.original.displayedStatus === "inactive" && (
              <RiAlertLine size={14} aria-hidden />
            )}
          </Tag>
        );
      },
    },
    {
      id: id("since"),
      accessorFn: (row) => row.since,
      header: header("Depuis le"),
      size: 121,
      cell: ({ row }) => <DateCell value={row.original.since} />,
    },
    {
      id: id("title"),
      accessorFn: (row) => row.internalTitle,
      header: header("Titre"),
      cell: ({ row }) => (
        <TextCell
          value={row.original.internalTitle}
          className="font-bold truncate"
        />
      ),
    },
    {
      id: id("structure"),
      accessorFn: (row) => row.structureName,
      header: header("Partenaire"),
      size: 148,
      cell: ({ row }) => (
        <TextCell value={row.original.structureName} className="truncate" />
      ),
    },
    {
      id: id("type"),
      accessorFn: (row) => row.type,
      header: header("Type"),
      size: 100,
      cell: ({ row }) => (
        <TextCell value={WIDGET_TYPE_LABELS[row.original.type]} />
      ),
    },
    {
      id: id("createdAt"),
      accessorFn: (row) => row.createdAt,
      header: header("Créé le"),
      size: 121,
      cell: ({ row }) => <DateCell value={row.original.createdAt} />,
    },
    {
      id: "actions",
      enableSorting: false,
      size: 140,
      header: () => null,
      cell: ({ row }) => (
        <Button
          variant="secondaire"
          size="sm"
          leftIcon={RiFileCopyLine}
          isLoading={duplicatingId === row.original._id}
          disabled={duplicatingId !== null}
          onClick={(event) => {
            event.stopPropagation();
            onDuplicate(row.original);
          }}
        >
          Dupliquer
        </Button>
      ),
    },
  ];
}
