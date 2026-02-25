/**
 * MetadataView Component
 * Main view for displaying and editing metadata
 */

"use client";

import { useState } from "react";
import { triggerForceArbitration } from "@/services/document-actions";
import { useDocument } from "../DocumentContext";
import { MetadataProvider } from "./MetadataContext";
import { MetadataTable } from "./MetadataTable";
import { METADATA_FIELDS_RI } from "./publication-targets/refugies-info";

// =============================================================================
// Component
// =============================================================================

export function MetadataView() {
  const { document } = useDocument();
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const handleRefresh = async () => {
    if (!document?.id) return;
    setIsLoading(true);
    try {
      await triggerForceArbitration(document.id);
      setLastRefreshed(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  if (!document) {
    return <div className="p-4">Document non trouvé</div>;
  }

  return (
    <MetadataProvider>
      <MetadataTable
        report={document.metadataReport}
        diMetadata={document.metadata ?? {}}
        ref={document.referenceData ?? { themes: {}, needs: {} }}
        fields={METADATA_FIELDS_RI}
      />
    </MetadataProvider>
  );
}
