"use client";

import type { WorkStatus } from "@playground/shared-types";
import { EmptyDash } from "@playground/ui/composites";
import { Badge, Tag } from "@playground/ui/primitives";
import { Loader2 } from "lucide-react";

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

  // to_process → À traiter, draft → En cours, to_review → À relire
  if (status === "to_process") return <Tag status="a-traiter" />;
  if (status === "draft") return <Tag status="en-cours" />;
  if (status === "to_review") return <Tag status="a-revoir" />;
};
WorkStatusCell.displayName = "WorkStatusCell";
