"use client";

import {
  Avatar,
  Badge,
  DataTableColumnHeader,
} from "@playground/ui/primitives";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Loader2, RotateCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { getLanguageFlag, getLanguageName } from "@/lib/document-labels";
import { retryTranslationGeneration } from "@/services/translation-actions";
import type { TranslationItem } from "@/services/translations";

const StatusCell = ({ row }: { row: { original: TranslationItem } }) => {
  const status = row.original.status;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRetry = () => {
    startTransition(async () => {
      await retryTranslationGeneration(row.original.id);
      router.refresh();
    });
  };

  if (status === "pending") {
    return (
      <Badge variant="neutral" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Traduction IA en cours
      </Badge>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="danger">Erreur de traduction IA</Badge>
        <button
          type="button"
          onClick={handleRetry}
          disabled={isPending}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          title="Relancer la génération"
        >
          <RotateCw
            className={`h-4 w-4 text-gray-500 ${isPending ? "animate-spin" : ""}`}
          />
        </button>
      </div>
    );
  }

  if (status === "to_process") {
    return <Badge variant="info">À traiter</Badge>;
  }

  if (status === "draft") {
    return <Badge variant="neutral">Brouillon</Badge>;
  }

  if (status === "published") {
    return <Badge variant="success">Publié</Badge>;
  }

  return <Badge variant="neutral">{status}</Badge>;
};

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
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Traitement" />
    ),
    cell: ({ row }) => <StatusCell row={row} />,
  },
  {
    accessorKey: "wordCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mots" />
    ),
    cell: ({ row }) => <div>{row.getValue("wordCount")}</div>,
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
  {
    accessorKey: "author",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Auteur" />
    ),
    cell: ({ row }) => {
      const email = row.original.author;
      const role = row.original.authorRole;
      return <Avatar email={email} userRole={role} size="sm" />;
    },
  },
];
