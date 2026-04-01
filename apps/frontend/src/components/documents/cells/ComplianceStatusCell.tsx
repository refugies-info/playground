"use client";

import type { ComplianceStatus } from "@playground/shared-types";
import { Badge, Conformite, EmptyDash } from "@playground/ui/primitives";

interface ComplianceStatusCellProps {
  status: ComplianceStatus | null | undefined;
}

export const ComplianceStatusCell = ({ status }: ComplianceStatusCellProps) => {
  if (!status) return <EmptyDash />;

  if (status === "compliant") return <Conformite value="conforme" />;
  if (status === "non_compliant") return <Conformite value="non-conforme" />;
  if (status === "pending")
    return <Badge variant="neutral">En cours d&apos;arbitrage</Badge>;
  if (status === "error") return <Badge variant="danger">Erreur</Badge>;
};
ComplianceStatusCell.displayName = "ComplianceStatusCell";
