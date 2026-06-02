"use client";

import { Badge, Conformite, Tag } from "@playground/ui/primitives";
import { useDocument } from "../DocumentContext";
import { DocumentPublicationStatus } from "./DocumentPublicationStatus";

/**
 * DocumentStatus — Affiche les statuts de publication et de travail.
 *
 *   - Si la fiche est publiée ou archivée, le statut de publication est affiché
 *     en premier, puis l'état de travail éventuel (ex: "Archivé" + "En cours").
 *   - Si la fiche n'a pas de statut de publication, les statuts d'arbitrage
 *     gardent la priorité historique sur l'état de travail.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1739-8632
 */
export function DocumentStatus() {
  const { document } = useDocument();

  if (!document) return null;

  const { complianceStatus, workStatus, onlineStatus } = document;

  const publicationStatus = (() => {
    if (onlineStatus === "published") return <DocumentPublicationStatus />;
    if (onlineStatus === "archived") return <Tag status="archive" />;
    return null;
  })();

  const workStatusTag = (() => {
    if (workStatus === "draft") return <Tag status="en-cours" />;
    if (workStatus === "to_process") return <Tag status="a-traiter" />;
    return null;
  })();

  if (publicationStatus) {
    return (
      <div className="flex items-center gap-2">
        {publicationStatus}
        {workStatusTag}
      </div>
    );
  }

  if (complianceStatus === "non_compliant") {
    return <Conformite value="non-conforme" />;
  }

  if (complianceStatus === "pending") {
    return <Badge variant="neutral">En cours d&apos;arbitrage</Badge>;
  }

  return workStatusTag;
}
