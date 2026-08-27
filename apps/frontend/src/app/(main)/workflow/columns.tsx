"use client";

import type { Document } from "@playground/shared-types";
import type { ColumnDef } from "@tanstack/react-table";
import { createDateColumn } from "@/lib/column-factories";
import {
  createCommuneColumn,
  createComplianceStatusColumn,
  createExternalIdRawColumn,
  createIngestionVersionColumn,
  createModalitesEntreesSortiesColumn,
  createSessionPeriodColumn,
  createStructureNameColumn,
  createTitleColumn,
  createWordCountColumn,
} from "@/lib/document-column-factories";

export const inProgressColumns: ColumnDef<Document>[] = [
  createExternalIdRawColumn(),
  createComplianceStatusColumn(),
  { ...createIngestionVersionColumn(), size: 80 },
  createWordCountColumn(),
  createTitleColumn(),
  { ...createCommuneColumn(), size: 120 }, // "Ville"
  createStructureNameColumn(),
  { ...createSessionPeriodColumn(), size: 121 },
  { ...createModalitesEntreesSortiesColumn(), size: 154 }, // "Type d'entrée"
  createDateColumn({
    accessorKey: "date_added",
    title: "Date d'import",
    getValue: (doc) => doc.date_added,
    showTime: true,
  }),
];
