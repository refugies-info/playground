/**
 * Sanitize RI metadata by filtering out hallucinated theme/need IDs.
 *
 * The Letta AI agent may generate IDs that don't exist in Réfugiés.info's MongoDB
 * (e.g. "FR" instead of a valid ObjectId like "63286a015d31b2c0cad99615").
 * This function strips those invalid values before publication or preview,
 * preventing webhook errors on the RI side.
 *
 * @see RI-1211
 */

type ReferenceData = {
  themes: Record<string, string>;
  needs: Record<string, string>;
};

export function sanitizeRiMetadata(
  metadata: Record<string, unknown>,
  referenceData: ReferenceData | undefined,
): Record<string, unknown> {
  if (!referenceData) return metadata;

  const result = { ...metadata };
  const { themes, needs } = referenceData;

  // Theme (string) — falls back to DEFAULT_THEME_ID in buildRefugiesInfoPayload when null
  if (typeof result.theme === "string" && !(result.theme in themes)) {
    result.theme = null;
  }

  // Secondary themes (string[])
  if (Array.isArray(result.secondaryThemes)) {
    const valid = result.secondaryThemes.filter(
      (id) => typeof id === "string" && id in themes,
    );
    result.secondaryThemes = valid.length > 0 ? valid : null;
  }

  // Needs (string[])
  if (Array.isArray(result.needs)) {
    const valid = result.needs.filter(
      (id) => typeof id === "string" && id in needs,
    );
    result.needs = valid.length > 0 ? valid : null;
  }

  return result;
}
