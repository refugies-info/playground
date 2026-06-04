"use client";

import type { Meta, StoryObj } from "@storybook/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Avatar } from "../../primitives/avatar";
import { Badge } from "../../primitives/badge/Badge";
import { Conformite } from "../../primitives/conformite/Conformite";
import { Tag } from "../../primitives/tag/Tag";
import { DateCell, EmptyDash, TextCell } from "./cells";
import { DataTable } from "./data-table";
import { DataTableColumnHeader } from "./data-table-column-header";

/**
 * Tableau de données TanStack avec pagination, tri par colonne et état vide.
 *
 * `manualPagination` + `manualSorting` → délègue la pagination et le tri au serveur
 * (mode utilisé dans /documents et /translations).
 */
const meta: Meta<typeof DataTable> = {
  title: "Primitives/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// Données de démo — miroir du type Document (/documents)
// =============================================================================

interface FicheDemo {
  id: string;
  assigneeEmail: string | null;
  onlineStatus: "published" | "archived" | "unpublished" | null;
  workStatus: "to_process" | "draft" | null;
  title: string;
  structureName: string | null;
  commune: string | null;
  sessionStartDate: string | null;
  modalitesEntreesSorties: "0" | "1" | null;
  dateAdded: string | null;
  complianceStatus: "compliant" | "non_compliant" | "pending" | "error" | null;
  externalId: string;
}

const FICHES: FicheDemo[] = [
  {
    id: "1",
    assigneeEmail: "alice@example.com",
    onlineStatus: "published",
    workStatus: "draft",
    title: "Formation développeur web fullstack",
    structureName: "AFPA Lyon",
    commune: "Lyon",
    sessionStartDate: "2026-03-01T00:00:00Z",
    modalitesEntreesSorties: "1",
    dateAdded: "2026-01-15T10:30:00Z",
    complianceStatus: "compliant",
    externalId: "OF-001",
  },
  {
    id: "2",
    assigneeEmail: "bob@example.com",
    onlineStatus: "archived",
    workStatus: null,
    title: "CAP Cuisine",
    structureName: "CFA Rhône",
    commune: "Villeurbanne",
    sessionStartDate: "2026-03-15T00:00:00Z",
    modalitesEntreesSorties: "0",
    dateAdded: "2026-01-20T14:00:00Z",
    complianceStatus: "non_compliant",
    externalId: "OF-002",
  },
  {
    id: "3",
    assigneeEmail: null,
    onlineStatus: null,
    workStatus: "to_process",
    title: "Bac Pro Commerce et Vente",
    structureName: "Lycée Ampère",
    commune: "Grenoble",
    sessionStartDate: "2026-04-01T00:00:00Z",
    modalitesEntreesSorties: null,
    dateAdded: "2026-02-01T09:00:00Z",
    complianceStatus: "pending",
    externalId: "OF-003",
  },
  {
    id: "4",
    assigneeEmail: "charlie@example.com",
    onlineStatus: "published",
    workStatus: "draft",
    title: "BTS Informatique et Réseaux",
    structureName: "IUT Clermont-Ferrand",
    commune: "Clermont-Ferrand",
    sessionStartDate: "2026-04-15T00:00:00Z",
    modalitesEntreesSorties: "1",
    dateAdded: "2026-02-05T11:00:00Z",
    complianceStatus: "compliant",
    externalId: "OF-004",
  },
  {
    id: "5",
    assigneeEmail: null,
    onlineStatus: null,
    workStatus: "to_process",
    title: "Master Data Science & IA",
    structureName: "Université Claude Bernard Lyon 1",
    commune: "Lyon",
    sessionStartDate: "2026-09-01T00:00:00Z",
    modalitesEntreesSorties: "0",
    dateAdded: "2026-02-10T16:00:00Z",
    complianceStatus: "error",
    externalId: "OF-005",
  },
  {
    id: "6",
    assigneeEmail: "alice@example.com",
    onlineStatus: "published",
    workStatus: "draft",
    title: "Licence Pro Ressources Humaines",
    structureName: "IAE Grenoble",
    commune: "Grenoble",
    sessionStartDate: "2026-09-15T00:00:00Z",
    modalitesEntreesSorties: "1",
    dateAdded: "2026-02-12T08:00:00Z",
    complianceStatus: "compliant",
    externalId: "OF-006",
  },
  {
    id: "7",
    assigneeEmail: null,
    onlineStatus: "archived",
    workStatus: null,
    title: "CAP Maçonnerie et Carrelage",
    structureName: "CFA BTP Savoie",
    commune: "Chambéry",
    sessionStartDate: null,
    modalitesEntreesSorties: "0",
    dateAdded: "2025-12-01T09:00:00Z",
    complianceStatus: "non_compliant",
    externalId: "OF-007",
  },
  {
    id: "8",
    assigneeEmail: "bob@example.com",
    onlineStatus: "published",
    workStatus: "draft",
    title: "BEP Électrotechnique",
    structureName: null,
    commune: "Grenoble",
    sessionStartDate: "2026-02-15T00:00:00Z",
    modalitesEntreesSorties: "1",
    dateAdded: "2025-11-20T14:00:00Z",
    complianceStatus: "compliant",
    externalId: "OF-008",
  },
  {
    id: "9",
    assigneeEmail: null,
    onlineStatus: null,
    workStatus: "to_process",
    title: "DUT Gestion des Entreprises et Administrations",
    structureName: "IUT Lyon 2",
    commune: "Lyon",
    sessionStartDate: "2026-01-01T00:00:00Z",
    modalitesEntreesSorties: "0",
    dateAdded: "2025-10-15T11:00:00Z",
    complianceStatus: "pending",
    externalId: "OF-009",
  },
  {
    id: "10",
    assigneeEmail: "charlie@example.com",
    onlineStatus: "unpublished",
    workStatus: "draft",
    title: "Titre Pro Soudeur Assembleur",
    structureName: "GRETA Rhône-Alpes",
    commune: "Saint-Étienne",
    sessionStartDate: "2026-01-15T00:00:00Z",
    modalitesEntreesSorties: "1",
    dateAdded: "2025-10-20T09:00:00Z",
    complianceStatus: "compliant",
    externalId: "OF-010",
  },
  {
    id: "11",
    assigneeEmail: "alice@example.com",
    onlineStatus: "published",
    workStatus: "draft",
    title: "CQP Agent de Prévention et de Sécurité",
    structureName: "IFOCOP",
    commune: "Valence",
    sessionStartDate: "2026-05-01T00:00:00Z",
    modalitesEntreesSorties: "0",
    dateAdded: "2026-03-01T10:00:00Z",
    complianceStatus: "compliant",
    externalId: "OF-011",
  },
  {
    id: "12",
    assigneeEmail: null,
    onlineStatus: null,
    workStatus: "to_process",
    title: "Prépa Concours Infirmier IDE",
    structureName: "IFSI Lyon",
    commune: "Lyon",
    sessionStartDate: "2026-06-01T00:00:00Z",
    modalitesEntreesSorties: "1",
    dateAdded: "2026-03-05T08:00:00Z",
    complianceStatus: "pending",
    externalId: "OF-012",
  },
];

// =============================================================================
// Helpers cellules — miroir de OnlineStatusCell, WorkStatusCell,
// ComplianceStatusCell, ModalitesEntreesSortiesCell (apps/frontend)
// =============================================================================

const OnlineStatusCellDemo = ({
  status,
}: {
  status: FicheDemo["onlineStatus"];
}) => {
  if (!status) return <EmptyDash />;
  if (status === "published") return <Tag status="publie" />;
  if (status === "archived") return <Tag status="archive" />;
  return <Tag status="na">Non publié</Tag>;
};
OnlineStatusCellDemo.displayName = "OnlineStatusCellDemo";

const WorkStatusCellDemo = ({
  status,
}: {
  status: FicheDemo["workStatus"];
}) => {
  if (!status) return <EmptyDash />;
  if (status === "to_process") return <Tag status="a-traiter" />;
  if (status === "draft") return <Tag status="en-cours" />;
  return <EmptyDash />;
};
WorkStatusCellDemo.displayName = "WorkStatusCellDemo";

const ComplianceStatusCellDemo = ({
  status,
}: {
  status: FicheDemo["complianceStatus"];
}) => {
  if (!status) return <EmptyDash />;
  if (status === "compliant") return <Conformite value="conforme" />;
  if (status === "non_compliant") return <Conformite value="non-conforme" />;
  if (status === "pending")
    return <Badge variant="neutral">En cours d&apos;arbitrage</Badge>;
  if (status === "error") return <Badge variant="danger">Erreur</Badge>;
  return <EmptyDash />;
};
ComplianceStatusCellDemo.displayName = "ComplianceStatusCellDemo";

const ModalitesCellDemo = ({
  value,
}: {
  value: FicheDemo["modalitesEntreesSorties"];
}) => {
  if (value === "0")
    return <div className="text-sm whitespace-nowrap">À tout moment</div>;
  if (value === "1")
    return <div className="text-sm whitespace-nowrap">À dates fixes</div>;
  return <EmptyDash />;
};
ModalitesCellDemo.displayName = "ModalitesCellDemo";

// =============================================================================
// Colonnes — miroir exact de /documents/columns.tsx (Figma node 1255:8745)
// =============================================================================

const columns: ColumnDef<FicheDemo>[] = [
  // Assignée (80px) — Avatar utilisateur ou IA
  {
    accessorKey: "assigneeEmail",
    size: 80,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assignée" />
    ),
    cell: ({ row }) => (
      <Avatar
        email={row.original.assigneeEmail}
        isAI={!row.original.assigneeEmail}
      />
    ),
  },
  // Statut (136px) — publication online
  {
    accessorKey: "online_status",
    size: 136,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => (
      <OnlineStatusCellDemo status={row.original.onlineStatus} />
    ),
  },
  // État (121px) — traitement éditorial
  {
    accessorKey: "work_status",
    size: 121,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="État" />
    ),
    cell: ({ row }) => <WorkStatusCellDemo status={row.original.workStatus} />,
  },
  // Titre (fill) — intitulé de la formation
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre" />
    ),
    cell: ({ row }) => <div className="font-medium">{row.original.title}</div>,
  },
  // Structure (148px) — organisme porteur, tronqué si long
  {
    accessorKey: "structureName",
    size: 148,
    meta: { className: "overflow-hidden" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Structure" />
    ),
    cell: ({ row }) => {
      const value = row.original.structureName;
      if (!value) return <EmptyDash />;
      return (
        <div className="text-sm text-gray-700 truncate" title={value}>
          {value}
        </div>
      );
    },
  },
  // Ville (120px)
  {
    accessorKey: "commune",
    size: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ville" />
    ),
    cell: ({ row }) => (
      <TextCell value={row.original.commune} className="text-sm" />
    ),
  },
  // Date de session (121px)
  {
    accessorKey: "sessionStartDate",
    size: 121,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date de session" />
    ),
    cell: ({ row }) => <DateCell value={row.original.sessionStartDate} />,
  },
  // Type d'entrée (154px) — 0=À tout moment, 1=À dates fixes
  {
    accessorKey: "modalitesEntreesSorties",
    size: 154,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type d'entrée" />
    ),
    cell: ({ row }) => (
      <ModalitesCellDemo value={row.original.modalitesEntreesSorties} />
    ),
  },
  // Date d'import (121px)
  {
    accessorKey: "dateAdded",
    size: 121,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date d'import" />
    ),
    cell: ({ row }) => <DateCell value={row.original.dateAdded} />,
  },
  // Conformité (149px) — résultat arbitrage IA
  {
    accessorKey: "compliance_status",
    size: 149,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Conformité" />
    ),
    cell: ({ row }) => (
      <ComplianceStatusCellDemo status={row.original.complianceStatus} />
    ),
  },
  // ID (80px) — identifiant externe RCO
  {
    id: "externalId",
    size: 80,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <span
        className="font-mono text-xs text-[var(--text-mention-grey)] bg-[var(--background-alt-grey)] rounded px-1.5 py-0.5"
        title={row.original.externalId}
      >
        {row.original.externalId}
      </span>
    ),
  },
];

// =============================================================================
// Stories
// =============================================================================

/** Colonnes et données miroir de /documents (Figma node 1255:8745) */
export const Default: Story = {
  args: {
    columns,
    data: FICHES,
    pageSize: 5,
  },
};

/** Ligne cliquable — curseur pointer + hover (comme /documents) */
export const LigneCliquable: Story = {
  args: {
    columns,
    data: FICHES,
    pageSize: 5,
    onRowClick: (row) => alert(`Clic sur : ${row.title}`),
  },
};

/** État vide — aucune donnée */
export const Vide: Story = {
  args: {
    columns,
    data: [],
  },
};

/** Pagination manuelle (serveur) — désactive la pagination interne */
export const PaginationManuelle: Story = {
  args: {
    columns,
    data: FICHES.slice(0, 5),
    pageSize: 5,
    manualPagination: true,
  },
};
