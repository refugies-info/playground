"use client";

import { Badge } from "@playground/ui/primitives";
import { ExternalLink } from "lucide-react";
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
      {document.publishedUrl && (
        <a
          href={document.publishedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-600 transition-colors"
          title="Voir la fiche publiée"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}
