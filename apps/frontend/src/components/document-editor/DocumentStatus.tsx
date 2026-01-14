"use client";

import { Badge } from "@playground/ui/primitives";
import {
  getStateLabel,
  getStateVariant,
  getStatusLabel,
  getStatusVariant,
} from "@/lib/document-labels";
import { useDocument } from "./DocumentContext";

export function DocumentStatus() {
  const { document } = useDocument();

  if (!document) return null;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getStatusVariant(document.status)}>
        {getStatusLabel(document.status)}
      </Badge>
      <Badge variant={getStateVariant(document.state)}>
        {getStateLabel(document.state)}
      </Badge>
    </div>
  );
}
