"use client";

import { Badge, Conformite, Tag } from "@playground/ui/primitives";
import { useDocument } from "../DocumentContext";

/**
 * DocumentStatus — Affiche UN seul badge de statut, par ordre de priorité :
 *
 *   1. published     → Tag "Publié" (avec lien)
 *   2. archived      → Tag "Archivé"
 *   3. non_compliant → Conformite "non-conforme"
 *   4. pending       → Badge "En cours d'arbitrage"
 *   5. draft         → Tag "En cours"
 *   6. to_process    → Tag "À traiter"
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/BOMO?node-id=1739-8632
 */
export function DocumentStatus() {
  const { document } = useDocument();

  if (!document) return null;

  const { complianceStatus, workStatus, onlineStatus, publishedUrl } = document;

  if (onlineStatus === "published") {
    return <Tag status="publie" href={publishedUrl ?? undefined} />;
  }

  if (onlineStatus === "archived") {
    return <Tag status="archive" />;
  }

  if (complianceStatus === "non_compliant") {
    return <Conformite value="non-conforme" />;
  }

  if (complianceStatus === "pending") {
    return <Badge variant="neutral">En cours d&apos;arbitrage</Badge>;
  }

  if (workStatus === "draft") {
    return <Tag status="en-cours" />;
  }

  if (workStatus === "to_process") {
    return <Tag status="a-traiter" />;
  }

  return null;
}
