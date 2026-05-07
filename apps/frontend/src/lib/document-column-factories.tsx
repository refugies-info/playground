"use client";

import type { Document } from "@playground/shared-types";
import { DataTableColumnHeader } from "@playground/ui/composites";
import { Avatar } from "@playground/ui/primitives";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ComplianceStatusCell,
  ExternalIdCell,
  ModalitesEntreesSortiesCell,
  OnlineStatusCell,
  QualityScoreCell,
  WorkStatusCell,
  type WorkStatusCellProps,
} from "@/components/documents/cells";

/**
 * Domain-specific column factories for the Document type.
 * Each factory is a thin adapter wiring a named cell component into a ColumnDef.
 */

// =============================================================================
// Shared Factories (used in both /documents and /workflow)
// =============================================================================

export const createComplianceStatusColumn = (): ColumnDef<Document> => ({
  accessorKey: "compliance_status",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Conformité" />
  ),
  cell: ({ row }) => (
    <ComplianceStatusCell status={row.original.complianceStatus} />
  ),
});

export const createTitleColumn = (): ColumnDef<Document> => ({
  accessorKey: "title",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Titre" />
  ),
  cell: ({ row }) => (
    <div className="min-w-[242px] font-medium">{row.original.title}</div>
  ),
});

export const createStructureNameColumn = (): ColumnDef<Document> => ({
  accessorKey: "structureName",
  meta: { className: "max-w-[148px]" },
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Structure" />
  ),
  cell: ({ row }) => {
    const value = row.original.structureName;
    if (!value) return <span className="text-gray-400">—</span>;
    const titleLength = row.original.title?.length ?? 0;
    const structureLength = value.length;
    // Truncate si la structure risque de prendre plus de lignes que le titre.
    // La colonne structure est ~2x plus étroite que le titre, donc à longueur
    // égale elle prend ~2x plus de lignes. On tronque quand le ratio dépasse.
    const shouldTruncate = structureLength > titleLength * 0.4;
    return (
      <div
        className={`text-sm text-gray-700 ${shouldTruncate ? "truncate" : ""}`}
        title={value}
      >
        {value}
      </div>
    );
  },
});

// =============================================================================
// Documents-specific Factories (/documents table)
// =============================================================================

export const createExternalIdColumn = <
  T extends { externalId?: string | null },
>(): ColumnDef<T> => ({
  id: "externalId",
  header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
  cell: ({ row }) => <ExternalIdCell externalId={row.original.externalId} />,
});

export const createModalitesEntreesSortiesColumn = (): ColumnDef<Document> => ({
  accessorKey: "modalitesEntreesSorties",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Type d'entrée" />
  ),
  cell: ({ row }) => (
    <ModalitesEntreesSortiesCell value={row.original.modalitesEntreesSorties} />
  ),
});

export const createOnlineStatusColumn = (): ColumnDef<Document> => ({
  accessorKey: "online_status",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Statut" />
  ),
  cell: ({ row }) => (
    <OnlineStatusCell
      status={row.original.onlineStatus}
      publishedUrl={row.original.publishedUrl}
    />
  ),
});

export const createWorkStatusColumn = <
  T extends { workStatus: WorkStatusCellProps["status"] },
>(
  title: string = "État",
): ColumnDef<T> => ({
  accessorKey: "work_status",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title={title} />
  ),
  cell: ({ row }) => <WorkStatusCell status={row.original.workStatus} />,
});

export const createAuthorColumn = (): ColumnDef<Document> => ({
  // accessorKey matches DocumentSortField for correct sort key
  accessorKey: "authorEmail",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Auteur" />
  ),
  cell: ({ row }) => (
    <Avatar email={row.original.authorEmail} isAI={!row.original.authorEmail} />
  ),
});

export const createWordCountColumn = (): ColumnDef<Document> => ({
  accessorKey: "wordCount",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Mots" />
  ),
  cell: ({ row }) => {
    const count = row.original.wordCount;
    if (count == null) return <span className="text-gray-400">—</span>;
    return <span className="text-sm tabular-nums">{count}</span>;
  },
});

// =============================================================================
// Workflow-specific Factories (/workflow table)
// =============================================================================

export const createExternalIdRawColumn = (): ColumnDef<Document> => ({
  id: "externalId",
  header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
  cell: ({ row }) => (
    <ExternalIdCell
      externalId={
        row.original.externalId ??
        (row.original.metadata?.id as string | undefined)
      }
    />
  ),
});

export const createQualityScoreColumn = (): ColumnDef<Document> => ({
  accessorKey: "qualityScore",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Score de qualité" />
  ),
  cell: ({ row }) => <QualityScoreCell score={row.original.qualityScore} />,
});
