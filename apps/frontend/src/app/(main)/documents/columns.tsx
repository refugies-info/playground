"use client";

import type { Document } from "@playground/shared-types";
import type { ColumnDef } from "@tanstack/react-table";
import { createDateColumn, createTextColumn } from "@/lib/column-factories";
import {
  createAuthorColumn,
  createComplianceStatusColumn,
  createExternalIdColumn,
  createModalitesEntreesSortiesColumn,
  createOnlineStatusColumn,
  createStructureNameColumn,
  createTitleColumn,
  createWorkStatusColumn,
} from "@/lib/document-column-factories";

/**
 * Colonnes de la table Fiches.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1255-8745
 *
 * Ordre et intitulés exacts (header row 1255:8745) :
 *   Auteur=80 | Statut=136 | État=121 | Mots=76* | Titre=fill |
 *   Structure=148 | Ville=120 | Date de session=121 | Type d'entrée=154 |
 *   Date d'import=121 | Conformité=149 | ID=80
 *
 * * Mots non mappé pour l'instant (donnée non disponible)
 */
export const columns: ColumnDef<Document>[] = [
  { ...createAuthorColumn(), size: 80 },
  { ...createOnlineStatusColumn(), size: 136 }, // "Statut"
  { ...createWorkStatusColumn<Document>(), size: 121 }, // "État"
  // Mots (76px) — non mappé
  createTitleColumn(), // "Titre" fill
  createStructureNameColumn(), // "Structure"
  {
    ...createTextColumn({
      accessorKey: "commune",
      title: "Ville",
      getValue: (doc) => doc.commune,
      className: "text-sm",
    }),
    size: 120,
  },
  {
    ...createDateColumn({
      accessorKey: "sessionStartDate",
      title: "Date de session",
      getValue: (doc) => doc.sessionStartDate,
      showTime: false,
    }),
    size: 121,
  },
  { ...createModalitesEntreesSortiesColumn(), size: 154 }, // "Type d'entrée"
  {
    ...createDateColumn({
      accessorKey: "date_added",
      title: "Date d'import",
      getValue: (doc) => doc.date_added,
      showTime: false,
    }),
    size: 121,
  },
  { ...createComplianceStatusColumn(), size: 149 }, // "Conformité"
  { ...createExternalIdColumn(), size: 80 }, // "ID"
];
