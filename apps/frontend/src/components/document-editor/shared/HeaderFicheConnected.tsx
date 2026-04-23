"use client";

import { Avatar } from "@playground/ui";
import { HeaderFiche } from "@playground/ui/composites";
import { RiArrowLeftSLine } from "@playground/ui/icons";
import { Button } from "@playground/ui/primitives";
import Link from "next/link";
import { useDocument } from "../DocumentContext";
import { DocumentStatus } from "./DocumentStatus";
import { useDocumentStatusRealtime } from "./hooks/useDocumentStatusRealtime";

interface HeaderFicheConnectedProps {
  /** Paramètre `from` — reconstruit le lien retour vers la liste */
  from?: string;
  /** Email de l'utilisateur connecté — pour l'avatar */
  userEmail?: string | null;
}

/**
 * HeaderFicheConnected — Câblage métier du composite HeaderFiche.
 *
 * Ce composant vit dans apps/frontend et injecte les données réelles
 * (contexte document, email utilisateur) dans les slots de HeaderFiche.
 *
 * Évolution prévue :
 * - Étape 2 : slot left enrichi avec <IndicationSauvegarde>
 * - Étape 3 : avatar wire avec userEmail
 * - Étape 5 : slot right avec Preview + PublishPanel (logique métier complète)
 *
 * ⚠️ Pendant la transition (étapes 1→4), les actions de sauvegarde/publication
 * restent dans DocumentActions (sidebar). Elles seront migrées en étape 5.
 */
export function HeaderFicheConnected({
  from,
  userEmail,
}: HeaderFicheConnectedProps) {
  const { document } = useDocument();

  // Maintient les badges de statut en temps réel (était dans TopBar)
  useDocumentStatusRealtime();

  const backHref = from
    ? `/documents?${decodeURIComponent(from)}`
    : "/documents";

  return (
    <HeaderFiche
      left={
        <>
          {/* Bouton retour */}
          <Link href={backHref}>
            <Button variant="quatrieme" size="sm" className="gap-1.5 px-2">
              <RiArrowLeftSLine className="w-4 h-4" />
              <span className="text-xs font-medium">Retour</span>
            </Button>
          </Link>

          {/* Statut conformité + travail + en ligne */}
          <DocumentStatus />

          {/* Avatar utilisateur — Assignation dans un sprint dédié */}
          <Avatar email={userEmail} />
        </>
      }
      center={document?.title ? <span>{document.title}</span> : undefined}
      right={
        // Placeholder — Preview + PublishPanel câblés en étape 5
        // Les actions restent dans DocumentActions (sidebar) pendant la transition
        undefined
      }
    />
  );
}
