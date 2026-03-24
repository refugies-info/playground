"use client";

import {
  Avatar,
  Badge,
  DataTableColumnHeader,
  LanguageCell,
} from "@playground/ui/primitives";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { OnlineStatusCell, WorkStatusCell } from "@/components/documents/cells";
import { getFlagClass, getLanguageName } from "@/lib/document-labels";
import { retryTranslationGeneration } from "@/services/translation-actions";
import type { TranslationItem } from "@/services/translations";

export const columns: ColumnDef<TranslationItem>[] = [
  {
    accessorKey: "language",
    size: 100,
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
      const lang = row.original.language;
      return (
        <LanguageCell
          flagClass={getFlagClass(lang)}
          name={getLanguageName(lang)}
          size="sm"
        />
      );
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre" />
    ),
    cell: ({ row }) => (
      <div className="font-medium truncate">{row.original.title}</div>
    ),
  },
  {
    accessorKey: "onlineStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Visibilité" />
    ),
    cell: ({ row }) => (
      <OnlineStatusCell
        status={
          row.original.onlineStatus as
            | "published"
            | "unpublished"
            | "archived"
            | undefined
        }
        publishedUrl={row.original.publicationUrl}
      />
    ),
  },
  {
    accessorKey: "workStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Traitement" />
    ),
    cell: ({ row }) => {
      const status = row.original.workStatus;

      // Error case: badge + retry button (inline, seul usage)
      if (status === "error") {
        return <ErrorWithRetry row={row} />;
      }

      // Other cases: pure WorkStatusCell
      return <WorkStatusCell status={status as any} />;
    },
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

// =============================================================================
// Inline Components (single usage)
// =============================================================================

/** Error badge with retry button — only used in translations table */
const ErrorWithRetry = ({ row }: { row: { original: TranslationItem } }) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRetry = () => {
    startTransition(async () => {
      await retryTranslationGeneration(row.original.id);
      router.refresh();
    });
  };

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
};
