"use client";

import type { WorkStatus } from "@playground/shared-types";
import { Badge, EmptyDash } from "@playground/ui/primitives";
import { Loader2 } from "lucide-react";
import {
  getWorkStatusLabel,
  getWorkStatusVariant,
} from "@/lib/document-labels";

export type TranslationWorkStatus = "pending" | "error";

export interface WorkStatusCellProps {
  status: WorkStatus | TranslationWorkStatus | null | undefined;
}

export const WorkStatusCell = ({ status }: WorkStatusCellProps) => {
  if (status === "pending") {
    return (
      <Badge variant="neutral" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Traduction IA en cours
      </Badge>
    );
  }

  if (status === "error") {
    return <Badge variant="danger">Erreur de traduction IA</Badge>;
  }

  if (!status) return <EmptyDash />;

  return (
    <Badge variant={getWorkStatusVariant(status)}>
      {getWorkStatusLabel(status)}
    </Badge>
  );
};
WorkStatusCell.displayName = "WorkStatusCell";
