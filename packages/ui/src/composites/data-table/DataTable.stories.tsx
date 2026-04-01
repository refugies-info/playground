"use client";

import type { Meta, StoryObj } from "@storybook/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./data-table";
import { DataTableColumnHeader } from "./data-table-column-header";

/**
 * DataTable — Wrapper TanStack React Table avec pagination, tri et état vide.
 *
 * Utilise les primitives Table/TableHeader/TableCell.
 * Header : bg alt-grey, texte xs bold uppercase (Figma BO/Fiches).
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
// Données de démo
// =============================================================================

interface Fiche {
  id: string;
  titre: string;
  structure: string;
  lieu: string;
  dateDebut: string;
  statut: string;
}

const FICHES: Fiche[] = [
  {
    id: "OF-001",
    titre: "Formation développeur web",
    structure: "AFPA Lyon",
    lieu: "Lyon",
    dateDebut: "2026-03-01",
    statut: "Publié",
  },
  {
    id: "OF-002",
    titre: "CAP Cuisine",
    structure: "CFA Rhône",
    lieu: "Villeurbanne",
    dateDebut: "2026-03-15",
    statut: "Archivé",
  },
  {
    id: "OF-003",
    titre: "Bac Pro Commerce",
    structure: "Lycée Ampère",
    lieu: "Grenoble",
    dateDebut: "2026-04-01",
    statut: "Publié",
  },
  {
    id: "OF-004",
    titre: "BTS Informatique",
    structure: "IUT Clermont",
    lieu: "Clermont-Ferrand",
    dateDebut: "2026-04-15",
    statut: "Archivé",
  },
  {
    id: "OF-005",
    titre: "Master Data Science",
    structure: "Univ. Lyon 1",
    lieu: "Lyon",
    dateDebut: "2026-09-01",
    statut: "Publié",
  },
  {
    id: "OF-006",
    titre: "Licence Pro RH",
    structure: "IAE Grenoble",
    lieu: "Grenoble",
    dateDebut: "2026-09-15",
    statut: "Publié",
  },
  {
    id: "OF-007",
    titre: "CAP Maçonnerie",
    structure: "CFA BTP",
    lieu: "Chambéry",
    dateDebut: "2026-02-01",
    statut: "Archivé",
  },
  {
    id: "OF-008",
    titre: "BEP Électronique",
    structure: "Lycée Vaucanson",
    lieu: "Grenoble",
    dateDebut: "2026-02-15",
    statut: "Publié",
  },
  {
    id: "OF-009",
    titre: "DUT GEA",
    structure: "IUT Lyon 2",
    lieu: "Lyon",
    dateDebut: "2026-01-01",
    statut: "Publié",
  },
  {
    id: "OF-010",
    titre: "Titre Pro Soudeur",
    structure: "GRETA Rhône",
    lieu: "Saint-Étienne",
    dateDebut: "2026-01-15",
    statut: "Archivé",
  },
  {
    id: "OF-011",
    titre: "CQP Agent de sécurité",
    structure: "IFOCOP",
    lieu: "Valence",
    dateDebut: "2026-05-01",
    statut: "Publié",
  },
  {
    id: "OF-012",
    titre: "Prépa Concours IDE",
    structure: "IFSI Lyon",
    lieu: "Lyon",
    dateDebut: "2026-06-01",
    statut: "Publié",
  },
];

const columns: ColumnDef<Fiche>[] = [
  {
    accessorKey: "id",
    size: 80,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.id}</span>
    ),
  },
  {
    accessorKey: "titre",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.titre}</span>
    ),
  },
  {
    accessorKey: "structure",
    size: 148,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Structure" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-gray-700">{row.original.structure}</span>
    ),
  },
  {
    accessorKey: "lieu",
    size: 154,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lieu" />
    ),
    cell: ({ row }) => <span className="text-sm">{row.original.lieu}</span>,
  },
  {
    accessorKey: "dateDebut",
    size: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date de début" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">
        {new Date(row.original.dateDebut).toLocaleDateString("fr-FR")}
      </span>
    ),
  },
  {
    accessorKey: "statut",
    size: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => <span className="text-sm">{row.original.statut}</span>,
  },
];

// =============================================================================
// Stories
// =============================================================================

/** Table avec données et pagination (5 lignes par page) */
export const Default: Story = {
  args: {
    columns,
    data: FICHES,
    pageSize: 5,
  },
};

/** Ligne cliquable — curseur pointer + hover */
export const LigneCliquable: Story = {
  args: {
    columns,
    data: FICHES,
    pageSize: 5,
    onRowClick: (row) => alert(`Clic sur : ${row.titre}`),
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
