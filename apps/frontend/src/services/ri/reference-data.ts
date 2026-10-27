import { logger } from "@playground/shared-types";
import { unstable_cache } from "next/cache";
import { riWebhookRequest } from "./webhook-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RiTheme {
  id: string;
  name: string;
  /** Libellé court du thème (name.short.fr côté RI), préféré pour l'affichage */
  short?: string;
  /** Couleur de fond du thème (colors.color40 côté RI, exposée sous `color`) */
  color?: string;
}

interface RiNeed {
  id: string;
  name: string;
  themeId: string;
}

export interface RiReferenceData {
  /** Map of theme ID → display name */
  themes: Record<string, string>;
  /** Map of theme ID → background color (colors.color40 côté RI) */
  themeColors: Record<string, string>;
  /** Map of need ID → display name */
  needs: Record<string, string>;
  /** Map of theme ID → array of need IDs (for filtering needs by selected themes) */
  needsByTheme: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const REFERENCE_DATA_REVALIDATE_SECONDS = 86400; // 24h, complements unstable_cache

function fetchFromRi<T>(path: string): Promise<T[]> {
  return riWebhookRequest<T[]>(path, {
    revalidateSeconds: REFERENCE_DATA_REVALIDATE_SECONDS,
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetches themes and needs reference data from Réfugiés.info.
 *
 * Uses unstable_cache (24h) pour bypasser le `revalidate = 0` des routes dynamiques
 * comme /documents/[id]. Sans ça, chaque render refaisait 2 appels HTTP vers RI.
 *
 * Returns empty maps on failure (non-blocking for the UI).
 */
export const fetchRiReferenceData = unstable_cache(
  async (): Promise<RiReferenceData> => {
    try {
      const [themes, needs] = await Promise.all([
        fetchFromRi<RiTheme>("/api/webhook/themes"),
        fetchFromRi<RiNeed>("/api/webhook/needs"),
      ]);

      const themesMap: Record<string, string> = {};
      const themeColorsMap: Record<string, string> = {};
      for (const t of themes) {
        // Prefer the short label; fall back to the full name
        themesMap[t.id] = t.short || t.name;
        if (t.color) themeColorsMap[t.id] = t.color;
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

      return {
        themes: themesMap,
        themeColors: themeColorsMap,
        needs: needsMap,
        needsByTheme,
      };
    } catch (error) {
      logger.error(error, "Failed to fetch RI reference data");
      return { themes: {}, themeColors: {}, needs: {}, needsByTheme: {} };
    }
  },
  ["ri-reference-data"],
  { revalidate: 86400 }, // 24h
);
