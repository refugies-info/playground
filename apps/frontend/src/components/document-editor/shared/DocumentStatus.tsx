"use client";

import { Badge, Conformite, EmptyDash, Tag } from "@playground/ui/primitives";
import { useDocument } from "../DocumentContext";

export function DocumentStatus() {
  const { document } = useDocument();

  if (!document) return null;

  const { complianceStatus, workStatus, onlineStatus, publishedUrl } = document;

  return (
    <div className="flex items-center gap-2">
      {/* Conformité — Conformite pour conforme/non_compliant, Badge pour les états transitoires */}
      {!complianceStatus && <EmptyDash />}
      {complianceStatus === "compliant" && <Conformite value="conforme" />}
      {complianceStatus === "non_compliant" && (
        <Conformite value="non-conforme" />
      )}
      {complianceStatus === "pending" && (
        <Badge variant="neutral">En cours d&apos;arbitrage</Badge>
      )}
      {complianceStatus === "error" && <Badge variant="danger">Erreur</Badge>}

      {/* Statut de travail */}
      {workStatus === "to_process" && <Tag status="a-traiter" />}
      {workStatus === "draft" && <Tag status="en-cours" />}

      {/* Statut en ligne — Tag publie intègre le lien externe */}
      {onlineStatus === "published" && (
        <Tag status="publie" href={publishedUrl ?? undefined} />
      )}
      {onlineStatus === "archived" && <Tag status="archive" />}
      {onlineStatus === "unpublished" && <Tag status="na">Non publié</Tag>}
    </div>
  );
}
