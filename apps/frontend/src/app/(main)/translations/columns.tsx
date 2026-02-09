"use client";

import {
  Badge,
  // Button, // unused for now
  DataTableColumnHeader,
} from "@playground/ui/primitives";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import {
  getLanguageFlag,
  getLanguageName,
  getTranslationStatusLabel,
  getTranslationStatusVariant,
} from "@/lib/document-labels";
import type { TranslationItem } from "@/services/translations";

export const columns: ColumnDef<TranslationItem>[] = [
  {
    accessorKey: "language",
    size: 100, // Hint for the table (if supported)
    minSize: 100,
    maxSize: 100,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Langue"
        className="w-[100px]"
      />
    ),
    cell: ({ row }) => {
      const lang = row.getValue("language") as string;
      return (
        <div className="flex items-center gap-2 w-[100px]" title={lang}>
          <span className={`${getLanguageFlag(lang)} shadow-sm`} />
          <Badge variant="neutral" size="sm" className="font-normal capitalize">
            {getLanguageName(lang)}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/translations/${row.original.id}`}
        className="font-medium hover:underline text-blue-600 block truncate"
      >
        {row.getValue("title")}
      </Link>
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
      return (
        <Badge variant={getTranslationStatusVariant(status)}>
          {getTranslationStatusLabel(status)}
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
