"use client";

import {
  type LanguagePublicationStatus,
  PublicationLinksPopover,
} from "@playground/ui/composites";
import { Tag } from "@playground/ui/primitives";
import { useState } from "react";
import { getPublicationUrls } from "@/services/publication-urls";
import { useDocument } from "../DocumentContext";

/**
 * DocumentPublicationStatus — Tag "Publié" déclenchant une popover multi-langues.
 *
 * Fetch lazy : les URLs de traduction ne sont chargées qu'à l'ouverture de la
 * popover (pas d'overhead si l'utilisateur ne l'ouvre jamais).
 *
 * FR est toujours publié en premier (invariant du workflow) → son URL est
 * calculée directement depuis `document.publicationRemoteId`.
 */
export function DocumentPublicationStatus() {
  const { document } = useDocument();
  const [isLoading, setIsLoading] = useState(false);
  const [languages, setLanguages] = useState<LanguagePublicationStatus[]>([]);

  if (!document) return null;

  const { id: workflowId, publicationRemoteId } = document;

  // Pas de remoteId (cas edge) → Tag statique sans popover, comme avant
  if (!publicationRemoteId) {
    return <Tag status="publie" />;
  }

  const handleOpenChange = async (open: boolean) => {
    if (!open || languages.length > 0) return;

    setIsLoading(true);
    try {
      const result = await getPublicationUrls(workflowId, publicationRemoteId);
      setLanguages(result);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicationLinksPopover
      languages={languages}
      isLoading={isLoading}
      onOpenChange={handleOpenChange}
    >
      <Tag status="publie" />
    </PublicationLinksPopover>
  );
}
