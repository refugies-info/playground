"use client";

import {
  Badge,
  // Button, // unused for now
  DataTableColumnHeader,
} from "@playground/ui/primitives";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import { getStatusLabel, getStatusVariant } from "@/lib/document-labels";
import type { TranslationItem } from "@/services/translations";

export const columns: ColumnDef<TranslationItem>[] = [
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
    accessorKey: "wordCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mots" />
    ),
    cell: ({ row }) => <div>{row.getValue("wordCount")}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      // Using existing label helpers if they apply, otherwise fallback to raw status
      // translation status might be 'draft', 'published' similar to documents
      return (
        <Badge variant={getStatusVariant(status)}>
          {getStatusLabel(status) || status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "publicationUrl",
    header: "Lien",
    cell: ({ row }) => {
      const url = row.original.publicationUrl;
      if (!url) return null;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-2"
          title="Voir la fiche publiée"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="text-xs underline">Voir</span>
        </a>
      );
    },
  },
];
