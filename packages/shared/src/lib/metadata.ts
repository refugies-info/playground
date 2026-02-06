/**
 * Metadata can have direct title fields.
 */
export type Metadata = {
  title?: string;
  "intitule-formation"?: string;
  nom?: string;
  [key: string]: unknown;
};

/**
 * Safely extracts the title from LHEO metadata.
 * Handles the nested structure: lheo.offres.formation[0]["intitule-formation"]
 * Also checks for direct title, nom or intitule-formation fields.
 */
export function extractTitleFromMetadata(metadata: Metadata): string | null {
  // Check for direct title field
  if (metadata.title && typeof metadata.title === "string") {
    return metadata.title;
  }

  // Check for direct intitule-formation field
  if (
    metadata["intitule-formation"] &&
    typeof metadata["intitule-formation"] === "string"
  ) {
    return metadata["intitule-formation"];
  }

  // Check for direct nom field
  if (metadata.nom && typeof metadata.nom === "string") {
    return metadata.nom;
  }

  return null;
}
