import { RCO_ORIGIN_PREFIX, RCO_SOURCE } from "./config";
import type { OrganismeResponsable } from "./session-offre";

export type RcoStructureDocument = {
  id: string;
  nom: string;
  source: string;
  siret: string | null;
  raison_sociale: string | null;
  numero_activite: string | null;
  coordonnees: Record<string, unknown> | null;
  contact: unknown[];
};

export const toStructureOriginIdFromSiret = (siret: string): string =>
  `${RCO_ORIGIN_PREFIX}siret-${siret}`;

export function resolveStructureId({
  knownStructureId,
  siret,
  structureIdBySiret,
}: {
  knownStructureId: string | null;
  siret: string | null;
  structureIdBySiret: Map<string, string>;
}): string | null {
  if (knownStructureId) return knownStructureId;
  if (!siret) return null;
  return structureIdBySiret.get(siret) ?? toStructureOriginIdFromSiret(siret);
}

export function buildStructureDocument(
  organisme: OrganismeResponsable,
  id: string,
): RcoStructureDocument {
  return {
    id,
    nom: organisme.nom ?? organisme.raison_sociale ?? id,
    source: RCO_SOURCE,
    siret: organisme.siret ?? null,
    raison_sociale: organisme.raison_sociale ?? null,
    numero_activite: organisme.numero_activite ?? null,
    coordonnees: organisme.coordonnees ?? null,
    contact: organisme.contact ?? [],
  };
}
