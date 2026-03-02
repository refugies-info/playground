/**
 * FieldBadge Component
 * Displays the status badge for a metadata field
 */

import { Badge } from "@playground/ui/primitives";
import {
  AlertTriangle,
  CircleX,
  FileQuestionMark,
  Pencil,
  Zap,
} from "lucide-react";
import type { MetadataFieldStatus } from "./types";

interface FieldBadgeProps {
  status: MetadataFieldStatus;
  error?: string;
  isModified: boolean;
  hasOriginalValue: boolean;
}

export function FieldBadge({
  status,
  error,
  isModified,
  hasOriginalValue,
}: FieldBadgeProps) {
  if (status === "saving") {
    return (
      <Badge size="sm" variant="info">
        <Zap className="h-3 w-3 mr-1 animate-pulse" /> Enregistrement...
      </Badge>
    );
  }

  if (status === "error") {
    return (
      <Badge size="sm" variant="danger" title={error}>
        <CircleX className="h-3 w-3 mr-1" /> Erreur
      </Badge>
    );
  }

  if (status === "fixed") {
    return (
      <Badge size="sm" variant="warning">
        <AlertTriangle className="h-3 w-3 mr-1" /> Erreur fixée
      </Badge>
    );
  }

  if (status === "modified" || isModified) {
    return (
      <Badge size="sm" variant="info">
        <Pencil className="h-3 w-3 mr-1" /> Modifié
      </Badge>
    );
  }

  if (!hasOriginalValue) {
    return (
      <Badge size="sm" variant="danger">
        <FileQuestionMark className="h-3 w-3 mr-1" /> Donnée introuvable
      </Badge>
    );
  }

  return (
    <Badge size="sm" variant="warning">
      <Zap className="h-3 w-3 mr-1" /> Pré-rempli par l&apos;IA
    </Badge>
  );
}
