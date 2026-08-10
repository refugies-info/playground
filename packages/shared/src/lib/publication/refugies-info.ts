import type { RiPoi } from "../../types/metadata-ri";
import { stripFirstH1 } from "../markdown";

// Default theme ID ("Apprendre le français") used as fallback
const DEFAULT_THEME_ID = "63286a015d31b2c0cad99615";

export type RefugiesInfoSponsor = {
  name: string;
  logo?: string;
  link?: string;
};

export type RefugiesInfoSession = {
  startDate: string;
  endDate: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
  externalRef?: string;
  url?: string;
};

export type RefugiesInfoDispositif = {
  origin?: "RCO";
  theme: string;
  secondaryThemes: unknown[];
  needs: unknown[];
  sponsors: RefugiesInfoSponsor[];
  map?: RiPoi[];
  metadatas: Record<string, unknown>;
  translations: {
    fr: {
      content: {
        titreInformatif: string;
        titreMarque: string | null;
        abstract: string;
        markdown: string;
      };
    };
  };
};

export type RefugiesInfoPayload = {
  dispositif: RefugiesInfoDispositif;
};

type BuildRefugiesInfoPayloadInput = {
  title: string;
  markdown: string;
  metadata: Record<string, unknown>;
  origin?: "RCO";
  normalizeMarkdown?: (markdown: string) => string;
};

const convertMongoDate = (dateObj: unknown): string | undefined => {
  if (!dateObj) return undefined;
  if (typeof dateObj === "string") return dateObj;
  if (typeof dateObj === "object" && dateObj !== null) {
    return (dateObj as { $date?: string }).$date;
  }
  return undefined;
};

const mapPeriodeToSessions = (periode: unknown[]): RefugiesInfoSession[] =>
  periode.map((session) => {
    const s = session as {
      debut?: { $date?: string } | string;
      fin?: { $date?: string } | string;
      startDate?: string;
      endDate?: string;
      inscription?: { debut?: { $date?: string }; fin?: { $date?: string } };
      registrationStartDate?: { $date?: string } | string;
      registrationEndDate?: { $date?: string } | string;
      externalRef?: string;
      url?: string;
    };

    const startDate =
      convertMongoDate(s.debut) || s.startDate || "1970-01-01T00:00:00.000Z";
    const endDate =
      convertMongoDate(s.fin) || s.endDate || "1970-01-01T00:00:00.000Z";

    const result: RefugiesInfoSession = { startDate, endDate };

    const regStart =
      convertMongoDate(s.registrationStartDate) ||
      convertMongoDate(s.inscription?.debut);
    const regEnd =
      convertMongoDate(s.registrationEndDate) ||
      convertMongoDate(s.inscription?.fin);

    if (regStart) result.registrationStartDate = regStart;
    if (regEnd) result.registrationEndDate = regEnd;
    if (s.externalRef) result.externalRef = s.externalRef;
    if (s.url) result.url = s.url;

    return result;
  });

const setIfDefined = (
  target: Record<string, unknown>,
  key: string,
  value: unknown,
) => {
  if (value !== undefined && value !== null) {
    target[key] = value;
  }
};

/**
 * Build a Refugies.info payload (preview/create/update) from merged metadata.
 * Markdown is stripped of the first H1 and optionally normalized.
 */
export async function buildRefugiesInfoPayload(
  input: BuildRefugiesInfoPayloadInput,
): Promise<RefugiesInfoPayload> {
  const { title, markdown, metadata, origin, normalizeMarkdown } = input;

  const themeValue = metadata.theme as string | string[] | undefined;
  const themeId =
    (Array.isArray(themeValue) ? themeValue[0] : themeValue) ||
    DEFAULT_THEME_ID;

  const secondaryThemes = (metadata.secondaryThemes as unknown[]) || [];
  const needs = (metadata.needs as unknown[]) || [];
  // Explicit editorial `undefined` clears the field on RI: null value overrides
  // the existing value (RI only updates titreMarque when it receives a string),
  // whereas an absent value is convert to undefined and is omitted so RI keeps its value.
  const titreMarque = (
    metadata.titreMarque === undefined ? null : metadata.titreMarque
  ) as string | null;
  const abstract = (metadata.abstract as string) || "";

  // Sponsors at root level.
  // `logo` (URL Cloudinary posée dans les métadonnées) voyage avec la structure :
  // RI exige un `name` non vide sur chaque sponsor, donc un logo sans structure
  // ne peut pas être envoyé. Côté RI la valeur est stockée telle quelle, en string.
  const sponsors: RefugiesInfoSponsor[] = [];
  if (metadata.mainSponsor !== undefined && metadata.mainSponsor !== "") {
    const logo = typeof metadata.logo === "string" ? metadata.logo.trim() : "";
    sponsors.push({
      name: metadata.mainSponsor as string,
      ...(logo && { logo }),
    });
  }

  // Map (POIs) at root level — RI expects dispositif.map, not dispositif.metadatas.map
  // Coerce lat/lng to numbers for RI Typegoose.
  const toNum = (v: string | number | undefined) =>
    v !== undefined && v !== "" ? Number(v) : undefined;

  const normalizePoi = ({ lat, lng, ...rest }: RiPoi): RiPoi => {
    const nLat = toNum(lat);
    const nLng = toNum(lng);
    return {
      ...rest,
      ...(nLat != null && { lat: nLat }),
      ...(nLng != null && { lng: nLng }),
    };
  };

  const mapValue = metadata.map as RiPoi[] | RiPoi | undefined;
  const rawMap = Array.isArray(mapValue)
    ? mapValue
    : mapValue
      ? [mapValue]
      : undefined;
  const map = rawMap?.map(normalizePoi);

  // Structured metadatas
  const metadatas: Record<string, unknown> = {};
  const metadataKeys: Array<keyof typeof metadata> = [
    "location",
    "frenchLevel",
    "age",
    "price",
    "publicStatus",
    "public",
    "conditions",
    "commitment",
    "frequency",
    "timeSlots",
  ];

  for (const key of metadataKeys) {
    setIfDefined(metadatas, key, metadata[key]);
  }

  // Handle sessions in new canonical format: { modalitesEntreesSorties, items }
  if (
    metadata.periode &&
    typeof metadata.periode === "object" &&
    !Array.isArray(metadata.periode)
  ) {
    const p = metadata.periode as {
      modalitesEntreesSorties?: 0 | 1 | null;
      items?: unknown[] | null;
    };
    const hasItems = Array.isArray(p.items) && p.items.length > 0;
    setIfDefined(metadatas, "sessions", {
      modalitesEntreesSorties: p.modalitesEntreesSorties ?? null,
      items: hasItems && p.items ? mapPeriodeToSessions(p.items) : null,
    });
  }

  // Clean + normalize markdown
  const cleanedMarkdown = await stripFirstH1(markdown);
  const finalMarkdown = normalizeMarkdown
    ? normalizeMarkdown(cleanedMarkdown)
    : cleanedMarkdown;

  const dispositif: RefugiesInfoDispositif = {
    theme: themeId,
    secondaryThemes,
    needs,
    sponsors,
    metadatas,
    translations: {
      fr: {
        content: {
          titreInformatif: title,
          titreMarque,
          abstract,
          markdown: finalMarkdown,
        },
      },
    },
  };

  if (origin) {
    dispositif.origin = origin;
  }
  if (map && map.length > 0) {
    dispositif.map = map;
  }

  return { dispositif };
}
