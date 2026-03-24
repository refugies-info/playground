"use client";

import type { Document } from "@playground/shared-types";
import type { ColumnDef } from "@tanstack/react-table";
import { createDateColumn } from "@/lib/column-factories";
import {
  createComplianceStatusColumn,
  createExternalIdRawColumn,
  createQualityScoreColumn,
  createStructureNameColumn,
  createTitleColumn,
} from "@/lib/document-column-factories";

export const inProgressColumns: ColumnDef<Document>[] = [
  createExternalIdRawColumn(),
  createComplianceStatusColumn(),
  createQualityScoreColumn(),
  createTitleColumn(),
  createStructureNameColumn(),
  createDateColumn({
    accessorKey: "date_added",
    title: "Date d'import",
    getValue: (doc) => doc.date_added,
    showTime: true,
  }),
];
