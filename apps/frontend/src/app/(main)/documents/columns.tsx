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

export const columns: ColumnDef<Document>[] = [
  createExternalIdColumn(),
  createComplianceStatusColumn(),
  createTitleColumn(),
  createStructureNameColumn(),
  createDateColumn({
    accessorKey: "sessionStartDate",
    title: "Date de début",
    getValue: (doc) => doc.sessionStartDate,
    showTime: false,
  }),
  createTextColumn({
    accessorKey: "commune",
    title: "Lieu",
    getValue: (doc) => doc.commune,
    className: "text-sm",
  }),
  createModalitesEntreesSortiesColumn(),
  createOnlineStatusColumn(),
  createWorkStatusColumn<Document>(),
  createDateColumn({
    accessorKey: "date_added",
    title: "Date d'import",
    getValue: (doc) => doc.date_added,
    showTime: true,
  }),
  createAuthorColumn(),
];
