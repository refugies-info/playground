import { logger } from "@playground/shared-types";

/**
 * Safely constructs a publication URL from base URL, language, and remote ID.
 * Validates that baseUrl is a safe URL (http/https only) to prevent XSS.
 *
 * @param baseUrl - Base URL (e.g., "https://refugies.info")
 * @param language - Language code (e.g., "en", "ar", or empty for FR)
 * @param remoteId - MongoDB ObjectId of the published document
 * @returns Safe publication URL or null if baseUrl/remoteId invalid
 *
 * @example
 * buildPublicationUrl("https://refugies.info", "en", "507f1f77bcf86cd799439011")
 * // Returns: "https://refugies.info/en/program/507f1f77bcf86cd799439011"
 *
 * buildPublicationUrl("https://refugies.info", "", "507f1f77bcf86cd799439011")
 * // Returns: "https://refugies.info/dispositif/507f1f77bcf86cd799439011"
 */
export function buildPublicationUrl(
  baseUrl: string | undefined | null,
  language: string | undefined | null,
  remoteId: string | undefined | null,
): string | null {
  if (!baseUrl || !remoteId) {
    return null;
  }

  try {
    // Validate that baseUrl is a valid HTTPS or HTTP URL
    const url = new URL(baseUrl);

    // Only allow http and https protocols (prevent javascript:, data:, etc.)
    if (!["http:", "https:"].includes(url.protocol)) {
      logger.warn(
        { protocol: url.protocol },
        "Invalid protocol in base URL (XSS prevention)",
      );
      return null;
    }

    // Clean up trailing slash
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");

    // Build publication URL based on language
    const languageCode = language === "fr" || !language ? "" : language;

    if (languageCode) {
      return `${cleanBaseUrl}/${languageCode}/program/${remoteId}`;
    } else {
      return `${cleanBaseUrl}/dispositif/${remoteId}`;
    }
  } catch (error) {
    // URL constructor throws if baseUrl is not a valid URL
    logger.warn({ baseUrl, error }, "Invalid base URL in buildPublicationUrl");
    return null;
  }
}

const LEGACY_INTERCARIFOREF_PATTERN =
  /intercariforef\.org\/formations\/.*formation-(.+)\.html$/;

/**
 * Intercariforef dropped its legacy `formation-<numero_formation>_<action>.html`
 * pages (now 404). Rebuilds the new search URL from the legacy link, where the
 * action number appears without its region prefix (`02_00747097` → `00747097`).
 * Other links are returned unchanged.
 *
 * @example
 * buildRcoSourceUrl(
 *   "https://www.intercariforef.org/formations/asl/formation-02_202410265937_00511985.html",
 *   "carif-oref--02_00511985",
 * )
 * // Returns: "https://www.intercariforef.org/outils/recherche-offreinfo/formations/sessions/02_202410265937/02_00511985"
 */
export function buildRcoSourceUrl(
  lienSource: string | undefined,
  documentId: string | undefined,
): string | undefined {
  const legacyKey = lienSource?.match(LEGACY_INTERCARIFOREF_PATTERN)?.[1];
  const numeroAction = documentId?.replace(/^carif-oref--/, "");
  if (!legacyKey || !numeroAction) return lienSource;

  const actionSuffix = `_${numeroAction.replace(/^\d+_/, "")}`;
  if (!legacyKey.endsWith(actionSuffix)) return lienSource;

  const numeroFormation = legacyKey.slice(0, -actionSuffix.length);
  return `https://www.intercariforef.org/outils/recherche-offreinfo/formations/sessions/${numeroFormation}/${numeroAction}`;
}
