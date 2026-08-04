"use client";

import { Badge, Conformite, Tag } from "@playground/ui/primitives";
import { useDocument } from "../DocumentContext";
import { DocumentPublicationStatus } from "./DocumentPublicationStatus";

/**
 * DocumentStatus — Affiche les statuts de publication.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1739-8632
 */
export function DocumentStatus() {
  const { document } = useDocument();

  if (!document) return null;

  const { complianceStatus, onlineStatus } = document;

  const publicationStatus = (() => {
    if (onlineStatus === "published") return <DocumentPublicationStatus />;
    if (onlineStatus === "archived") return <Tag status="archive" />;
    return null;
  })();

  if (publicationStatus) {
    return <div className="flex items-center gap-2">{publicationStatus}</div>;
  }

  if (complianceStatus === "non_compliant") {
    return <Conformite value="non-conforme" />;
  }

  if (complianceStatus === "pending") {
    return <Badge variant="neutral">En cours d&apos;arbitrage</Badge>;
  }

  return null;
}
