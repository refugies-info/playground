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
