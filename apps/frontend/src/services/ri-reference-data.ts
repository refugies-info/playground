import { logger } from "@playground/shared-types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RiTheme {
  id: string;
  name: string;
}

interface RiNeed {
  id: string;
  name: string;
  themeId: string;
}

export interface RiReferenceData {
  /** Map of theme ID → display name */
  themes: Record<string, string>;
  /** Map of need ID → display name */
  needs: Record<string, string>;
  /** Map of theme ID → array of need IDs (for filtering needs by selected themes) */
  needsByTheme: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getConfig() {
  const baseUrl = process.env.RI_BASE_URL;
  const secret = process.env.RI_WEBHOOK_SECRET;

  if (!baseUrl || !secret) {
    throw new Error(
      "Missing RI_BASE_URL or RI_WEBHOOK_SECRET for reference data fetch",
    );
  }

  return { baseUrl: baseUrl.replace(/\/$/, ""), secret };
}

async function fetchFromRi<T>(path: string): Promise<T[]> {
  const { baseUrl, secret } = getConfig();
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "webhook-secret": secret,
    },
    next: { revalidate: 86400 }, // Next.js fetch cache: 24h
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `RI reference data fetch failed: ${response.status} ${errorText}`,
    );
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetches themes and needs reference data from Réfugiés.info.
 *
 * Uses Next.js fetch cache (24h revalidation).
 * Returns empty maps on failure (non-blocking for the UI).
 */
export async function fetchRiReferenceData(): Promise<RiReferenceData> {
  try {
    const [themes, needs] = await Promise.all([
      fetchFromRi<RiTheme>("/api/webhook/themes"),
      fetchFromRi<RiNeed>("/api/webhook/needs"),
    ]);

    const themesMap: Record<string, string> = {};
    for (const t of themes) {
      themesMap[t.id] = t.name;
    }

    const needsMap: Record<string, string> = {};
    const needsByTheme: Record<string, string[]> = {};
    for (const n of needs) {
      needsMap[n.id] = n.name;
      if (!needsByTheme[n.themeId]) {
        needsByTheme[n.themeId] = [];
      }
      needsByTheme[n.themeId].push(n.id);
    }

    return { themes: themesMap, needs: needsMap, needsByTheme };
  } catch (error) {
    logger.error(error, "Failed to fetch RI reference data");
    return { themes: {}, needs: {}, needsByTheme: {} };
  }
}
