"use client";

import { Badge } from "@playground/ui/primitives";
import { ExternalLink } from "lucide-react";
import {
  getComplianceStatusLabel,
  getComplianceStatusVariant,
  getOnlineStatusLabel,
  getOnlineStatusVariant,
  getWorkStatusLabel,
  getWorkStatusVariant,
} from "@/lib/document-labels";
import { useDocument } from "../DocumentContext";

export function DocumentStatus() {
  const { document } = useDocument();

  if (!document) return null;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getComplianceStatusVariant(document.complianceStatus)}>
        {getComplianceStatusLabel(document.complianceStatus)}
      </Badge>
      {document.workStatus && (
        <Badge variant={getWorkStatusVariant(document.workStatus)}>
          {getWorkStatusLabel(document.workStatus)}
        </Badge>
      )}
      <Badge variant={getOnlineStatusVariant(document.onlineStatus)}>
        {getOnlineStatusLabel(document.onlineStatus)}
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
