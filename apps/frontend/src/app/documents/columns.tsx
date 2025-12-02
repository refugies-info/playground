"use client";

import { Button, DataTableColumnHeader } from "@refugies/ui/primitives";
import type { MockDocument } from "@shared/types";
import type { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<MockDocument>[] = [
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
      const statusColors: Record<string, string> = {
        accepted: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
      };

      const translatedStatus: Record<string, string> = {
        accepted: "Accepté",
        rejected: "Rejeté",
      };

      return (
        <span
          className={`inline-block px-2 py-1 rounded text-sm ${
            statusColors[status] || "bg-gray-100"
          }`}
        >
          {translatedStatus[status] || status}
        </span>
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
      const stateColors: Record<string, string> = {
        draft: "bg-blue-100 text-blue-800",
        to_process: "bg-yellow-100 text-yellow-800",
        archived: "bg-gray-100 text-gray-800",
        published: "bg-purple-100 text-purple-800",
      };

      const translatedState: Record<string, string> = {
        draft: "Brouillon",
        to_process: "En attente",
        archived: "Archivé",
        published: "Publié",
      };

      return (
        <span
          className={`inline-block px-2 py-1 rounded text-sm ${
            stateColors[state] || "bg-gray-100"
          }`}
        >
          {translatedState[state] || state.replace("_", " ")}
        </span>
      );
    },
  },
  {
    accessorKey: "source",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Source" />
    ),
    cell: ({ row }) => <div>{row.getValue("source")}</div>,
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
