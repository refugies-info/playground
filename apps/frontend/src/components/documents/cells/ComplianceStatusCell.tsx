"use client";

import type { ComplianceStatus } from "@playground/shared-types";
import { Badge } from "@playground/ui/primitives";
import {
  getComplianceStatusLabel,
  getComplianceStatusVariant,
} from "@/lib/document-labels";

interface ComplianceStatusCellProps {
  status: ComplianceStatus | null | undefined;
}

export const ComplianceStatusCell = ({ status }: ComplianceStatusCellProps) => (
  <Badge variant={getComplianceStatusVariant(status)}>
    {getComplianceStatusLabel(status)}
  </Badge>
);
ComplianceStatusCell.displayName = "ComplianceStatusCell";
