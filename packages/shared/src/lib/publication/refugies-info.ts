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
  metadatas: Record<string, unknown>;
  translations: {
    fr: {
      content: {
        titreInformatif: string;
        titreMarque: string;
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
  const titreMarque = (metadata.titreMarque as string) || title;
  const abstract = (metadata.abstract as string) || "";

  // Sponsors at root level
  const sponsors: RefugiesInfoSponsor[] = [];
  if (metadata.mainSponsor !== undefined && metadata.mainSponsor !== "") {
    sponsors.push({ name: metadata.mainSponsor as string });
  }

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

  if (Array.isArray(metadata.periode) && metadata.periode.length > 0) {
    metadatas.sessions = mapPeriodeToSessions(metadata.periode);
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

  return { dispositif };
}
