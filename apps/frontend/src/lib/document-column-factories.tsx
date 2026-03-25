"use client";

import type { Document } from "@playground/shared-types";
import { Avatar, DataTableColumnHeader } from "@playground/ui/primitives";
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
import { createTextColumn } from "@/lib/column-factories";

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
  cell: ({ row }) => <div className="font-medium">{row.original.title}</div>,
});

export const createStructureNameColumn = (): ColumnDef<Document> =>
  createTextColumn({
    accessorKey: "structureName",
    title: "Structure",
    getValue: (doc) => doc.structureName,
    className: "text-sm text-gray-700",
  });

// =============================================================================
// Documents-specific Factories (/documents table)
// =============================================================================

export const createExternalIdColumn = (): ColumnDef<Document> => ({
  id: "externalId",
  header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
  cell: ({ row }) => <ExternalIdCell externalId={row.original.externalId} />,
});

export const createModalitesEntreesSortiesColumn = (): ColumnDef<Document> => ({
  accessorKey: "modalitesEntreesSorties",
  header: ({ column }) => <DataTableColumnHeader column={column} title="E/S" />,
  cell: ({ row }) => (
    <ModalitesEntreesSortiesCell value={row.original.modalitesEntreesSorties} />
  ),
});

export const createOnlineStatusColumn = (): ColumnDef<Document> => ({
  accessorKey: "online_status",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Visibilité" />
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
  title: string = "Traitement",
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
    <Avatar
      email={row.original.authorEmail}
      userRole={row.original.authorRole}
      size="sm"
    />
  ),
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
