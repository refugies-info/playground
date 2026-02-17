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
import {
  getLanguageFlag,
  getLanguageName,
  getOnlineStatusLabel,
  getOnlineStatusVariant,
  getWorkStatusLabel,
  getWorkStatusVariant,
} from "@/lib/document-labels";
import { retryTranslationGeneration } from "@/services/translation-actions";
import type { TranslationItem } from "@/services/translations";

// Work status cell with pending/error handling
const WorkStatusCell = ({ row }: { row: { original: TranslationItem } }) => {
  const status = row.original.workStatus;
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

  if (!status) return <div className="text-gray-400">—</div>;

  return (
    <Badge variant={getWorkStatusVariant(status as "to_process" | "draft")}>
      {getWorkStatusLabel(status as "to_process" | "draft")}
    </Badge>
  );
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
    accessorKey: "onlineStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Visibilité" />
    ),
    cell: ({ row }) => {
      const status = row.original.onlineStatus;
      const url = row.original.publicationUrl;

      if (!status) return <div className="text-gray-400">—</div>;

      // Show link if published
      if (status === "published" && url) {
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={getOnlineStatusVariant(
                status as "published" | "unpublished" | "archived",
              )}
            >
              {getOnlineStatusLabel(
                status as "published" | "unpublished" | "archived",
              )}
            </Badge>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 transition-colors"
              title="Voir la fiche publiée"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        );
      }

      return (
        <Badge
          variant={getOnlineStatusVariant(
            status as "published" | "unpublished" | "archived",
          )}
        >
          {getOnlineStatusLabel(
            status as "published" | "unpublished" | "archived",
          )}
        </Badge>
      );
    },
  },
  {
    accessorKey: "workStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Traitement" />
    ),
    cell: ({ row }) => <WorkStatusCell row={row} />,
  },
  {
    accessorKey: "wordCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mots" />
    ),
    cell: ({ row }) => <div>{row.getValue("wordCount")}</div>,
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
