"use client";

import type { Document } from "@playground/shared-types";
import {
  Badge,
  Button,
  DataTableColumnHeader,
} from "@playground/ui/primitives";
import type { ColumnDef } from "@tanstack/react-table";
import {
  getStateLabel,
  getStateVariant,
  getStatusLabel,
  getStatusVariant,
} from "@/lib/document-labels";

export const columns: ColumnDef<Document>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "date_added",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date d'ajout" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("date_added") as string);
      return <div>{date.toLocaleDateString("fr-FR")}</div>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={getStatusVariant(status)}>
          {getStatusLabel(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "state",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="État" />
    ),
    cell: ({ row }) => {
      const state = row.getValue("state") as string;
      return (
        <Badge variant={getStateVariant(state)}>{getStateLabel(state)}</Badge>
      );
    },
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const document = row.original;
      return (
        <Button
          variant="secondary"
          className="cursor-pointer"
          onClick={() => {
            // Navigate to document detail page
            window.location.href = `/documents/${document.id}`;
          }}
        >
          Voir le doc
        </Button>
      );
    },
  },
];
