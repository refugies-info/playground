"use client";

import {
  DataTableColumnHeader,
  EmptyDash,
  LanguageCell,
} from "@playground/ui/composites";
import { RiErrorWarningFill } from "@playground/ui/icons";
import { Avatar, Badge } from "@playground/ui/primitives";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  ExternalIdCell,
  OnlineStatusCell,
  WorkStatusCell,
} from "@/components/documents/cells";
import { createTextColumn } from "@/lib/column-factories";
import { getFlagClass } from "@/lib/document-labels";
import { retryTranslationGeneration } from "@/services/translation-actions";
import type { TranslationItem } from "@/services/translations";

/**
 * Colonnes de la table Traductions.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1284-6260
 *
 * Ordre et intitulés exacts (header row 1284:6291) :
 *   Langue | Auteur | Statut | État | Priorité | Mots | Titre |
 *   Structure | Ville | ID
 */
export const columns: ColumnDef<TranslationItem>[] = [
  // 1 — Langue
  {
    accessorKey: "language",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Langue" />
    ),
    cell: ({ row }) => {
      const lang = row.original.language;
      return (
        <LanguageCell
          flagClass={getFlagClass(lang)}
          name={lang.toUpperCase()}
          size="sm"
        />
      );
    },
  },

  // 2 — Auteur
  {
    accessorKey: "author",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Auteur" />
    ),
    cell: ({ row }) => {
      const email = row.original.author;
      return <Avatar email={email} isAI={!email} />;
    },
  },

  // 3 — Statut de publication
  {
    accessorKey: "onlineStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
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
        publishedDate={
          row.original.onlineStatus === "published"
            ? row.original.updatedAt
            : null
        }
      />
    ),
  },

  // 4 — État de traitement
  {
    accessorKey: "workStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="État" />
    ),
    cell: ({ row }) => {
      const status = row.original.workStatus;
      if (status === "error") return <ErrorWithRetry row={row} />;
      return <WorkStatusCell status={status} />;
    },
  },

  // 5 — Priorité
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priorité" />
    ),
    cell: ({ row }) =>
      row.original.priority === "urgent" ? (
        <RiErrorWarningFill
          className="w-4 h-4 text-(--text-default-warning)"
          aria-label="Urgent"
        />
      ) : (
        <EmptyDash />
      ),
  },

  // 6 — Mots
  {
    accessorKey: "wordCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mots" />
    ),
    cell: ({ row }) => {
      const count = row.original.wordCount;
      if (count == null) return <EmptyDash />;
      return <span className="text-sm tabular-nums">{count}</span>;
    },
  },

  // 7 — Titre (fill)
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre" />
    ),
    cell: ({ row }) => (
      <div className="min-w-[242px] font-medium">{row.original.title}</div>
    ),
  },

  // 8 — Structure
  createTextColumn<TranslationItem>({
    accessorKey: "structureName",
    title: "Structure",
    getValue: (row) => row.structureName,
    className: "text-sm",
  }),

  // 9 — Ville
  createTextColumn<TranslationItem>({
    accessorKey: "commune",
    title: "Ville",
    getValue: (row) => row.commune,
    className: "text-sm",
  }),

  // 10 — ID
  {
    id: "id",
    size: 80,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <ExternalIdCell externalId={row.original.id} />,
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
