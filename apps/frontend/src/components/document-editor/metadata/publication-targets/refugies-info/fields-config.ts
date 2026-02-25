/**
 * Réfugiés.info - Field Configuration
 * Defines which metadata fields are expected by Réfugiés.info
 */

import type { MetadataFieldDef } from "../../types";

/**
 * Metadata fields configuration for Réfugiés.info publication target.
 */
export const METADATA_FIELDS_RI: MetadataFieldDef[] = [
  // ── Identity ──────────────────────────────────────────────────────────────
  { label: "Titre marque", riKey: "titreMarque" },
  { label: "Structure", riKey: "mainSponsor" },
  { label: "Logo", riKey: "logo" },
  { label: "En bref", riKey: "abstract" },

  // ── Classification ────────────────────────────────────────────────────────
  { label: "Thèmes", riKey: "theme", relatedKeys: ["secondaryThemes"] },
  { label: "Besoins", riKey: "needs" },

  // ── Public ────────────────────────────────────────────────────────────────
  { label: "Public visé", riKey: "publicStatus" },
  { label: "Public", riKey: "public" },
  { label: "Fréquence", riKey: "frequency" },
  { label: "Niveau de français", riKey: "frenchLevel" },
  { label: "Âge", riKey: "age" },

  // ── Modalities ────────────────────────────────────────────────────────────
  { label: "Prix", riKey: "price" },
  { label: "Durée totale", riKey: "commitment" },
  { label: "Session", riKey: "periode" },
  { label: "Jours de présence", riKey: "timeSlots" },

  // ── Geography ─────────────────────────────────────────────────────────────
  { label: "Départements", riKey: "location" },
  { label: "Conditions", riKey: "conditions" },
  { label: "Zone d'actions", riKey: "map" },
];
