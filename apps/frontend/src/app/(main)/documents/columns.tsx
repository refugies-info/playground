"use client";

import type { Document } from "@playground/shared-types";
import { Badge, DataTableColumnHeader } from "@playground/ui/primitives";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import {
  getStateLabel,
  getStateVariant,
  getStatusLabel,
  getStatusVariant,
} from "@/lib/document-labels";

export const columns: ColumnDef<Document>[] = [
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Arbitrage" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      if (status === "unknown") {
        return <Badge variant="neutral">En cours</Badge>;
      }
      if (status === "error") {
        return <Badge variant="danger">Erreur</Badge>;
      }
      return (
        <Badge variant={getStatusVariant(status)}>
          {getStatusLabel(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "qualityScore",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Score de qualité DI" />
    ),
    cell: ({ row }) => {
      const score = row.getValue("qualityScore") as number | undefined;
      if (score === undefined || score === null) {
        return <div className="text-gray-400">—</div>;
      }
      const percentage = Math.round(score * 100);
      let variant: "success" | "warning" | "danger" | "info" | "neutral" =
        "neutral";

      if (percentage >= 80) variant = "success";
      else if (percentage >= 50) variant = "warning";
      else if (percentage > 0) variant = "danger";

      return <Badge variant={variant}>{percentage}%</Badge>;
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "structureName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Structure" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("structureName") as string | undefined;
      return <div className="text-sm text-gray-700">{value || "—"}</div>;
    },
  },
  {
    accessorKey: "date_added",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date d'import" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("date_added") as string);
      return <div>{date.toLocaleDateString("fr-FR")}</div>;
    },
  },
  {
    accessorKey: "sessionStartDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date début session" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("sessionStartDate") as string | undefined;
      if (!value) return <div>—</div>;
      const date = new Date(value);
      return <div>{date.toLocaleDateString("fr-FR")}</div>;
    },
  },
  {
    accessorKey: "publishedUrl",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="En ligne" />
    ),
    cell: ({ row }) => {
      const url = row.original.publishedUrl;
      const debugStatus = row.original.publicationStatus;
      const debugRemoteId = row.original.publicationRemoteId;
      if (!url) {
        return (
          <span
            className="text-xs text-gray-400"
            title={`publication_status=${debugStatus ?? "null"} remote_id=${debugRemoteId ?? "null"}`}
          >
            —
          </span>
        );
      }
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-2"
          title="Voir la fiche publiée"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-4 h-4" />
          <span className="text-xs underline">Voir</span>
        </a>
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
      if (row.original.status === "unknown") {
        return null;
      }
      return (
        <Badge variant={getStateVariant(state)}>{getStateLabel(state)}</Badge>
      );
    },
  },
];

export const inProgressColumns: ColumnDef<Document>[] = [
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Arbitrage" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      if (status === "unknown") {
        return <Badge variant="neutral">En cours</Badge>;
      }
      return (
        <Badge variant={getStatusVariant(status)}>
          {getStatusLabel(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "qualityScore",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Score de qualité DI" />
    ),
    cell: ({ row }) => {
      const score = row.getValue("qualityScore") as number | undefined;
      if (score === undefined || score === null) {
        return <div className="text-gray-400">—</div>;
      }
      const percentage = Math.round(score * 100);
      let variant: "success" | "warning" | "danger" | "info" | "neutral" =
        "neutral";

      if (percentage >= 80) variant = "success";
      else if (percentage >= 50) variant = "warning";
      else if (percentage > 0) variant = "danger";

      return <Badge variant={variant}>{percentage}%</Badge>;
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "structureName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Structure" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("structureName") as string | undefined;
      return <div className="text-sm text-gray-700">{value || "—"}</div>;
    },
  },
  {
    accessorKey: "date_added",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date d'import" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("date_added") as string);
      return <div>{date.toLocaleDateString("fr-FR")}</div>;
    },
  },
];
