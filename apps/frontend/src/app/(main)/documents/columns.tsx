"use client";

import type { Document } from "@playground/shared-types";
import type { ColumnDef } from "@tanstack/react-table";
import type { AssigneeEditor } from "@/components/common/assignee-dropdown";
import { createDateColumn, createTextColumn } from "@/lib/column-factories";
import {
  createAssigneeColumn,
  createComplianceStatusColumn,
  createExternalIdColumn,
  createModalitesEntreesSortiesColumn,
  createOnlineStatusColumn,
  createSessionPeriodColumn,
  createStructureNameColumn,
  createTitleColumn,
  createWordCountColumn,
  createWorkStatusColumn,
} from "@/lib/document-column-factories";

/**
 * Colonnes de la table Fiches.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=1255-8745
 *
 * Ordre et intitulés exacts (header row 1255:8745) :
 *   Assigné·e=80 | Statut=136 | État=121 | Mots=76 | Titre=fill |
 *   Structure=148 | Ville=120 | Date de session=121 | Type d'entrée=154 |
 *   Date d'arbitrage=121 | Conformité=149 | ID=80
 */
export function getColumns(
  editors: AssigneeEditor[],
  onOptimisticUpdate: (docId: string, email: string | null) => void,
): ColumnDef<Document>[] {
  return [
    { ...createAssigneeColumn(editors, onOptimisticUpdate), size: 80 },
    { ...createOnlineStatusColumn(), size: 136 }, // "Statut"
    { ...createWorkStatusColumn<Document>(), size: 121 }, // "État"
    { ...createWordCountColumn(), size: 76 }, // "Mots"
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
      ...createSessionPeriodColumn(),
      size: 121,
    },
    { ...createModalitesEntreesSortiesColumn(), size: 154 }, // "Type d'entrée"
    {
      ...createDateColumn({
        accessorKey: "arbitrationDate",
        title: "Date d'arbitrage",
        getValue: (doc) => doc.arbitrationDate,
        showTime: true,
      }),
      size: 121,
    },
    { ...createComplianceStatusColumn(), size: 149 }, // "Conformité"
    { ...createExternalIdColumn(), size: 80 }, // "ID"
  ];
}
