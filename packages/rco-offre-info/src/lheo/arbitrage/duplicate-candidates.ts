import type { DuplicateMatch, DuplicateSource } from "@playground/shared-types";
import type { RcoActionDocument } from "../document";

// Shape returned by the RI duplicate search endpoint (/api/agent/dispositifs/duplicates).
export type RiDispositif = {
  id: string;
  titreInformatif?: string | null;
  titreMarque?: string | null;
  location?: string[] | string | null;
  city?: string[] | null;
  mainSponsorNom?: string | null;
  mainSponsorAcronyme?: string | null;
  status?: string | null;
};

export type DuplicateCandidate = {
  id: string;
  source: DuplicateSource;
  url: string;
  title: string;
  sponsor: string;
  departments: string[];
  cities: string[];
  status: string;
  score: number;
};

// A dispositif without any department (location "france") is national.
const DEPARTMENT_PREFIX = /^(\d{2,3}|2A|2B)\s*-/;

const toDepartments = (location: RiDispositif["location"]): string[] =>
  (Array.isArray(location) ? location : [location])
    .map((place) => place?.match(DEPARTMENT_PREFIX)?.[1])
    .filter((department): department is string => Boolean(department));

const join = (...parts: (string | null | undefined)[]) =>
  parts.filter(Boolean).join(" - ");

const candidateUrl = (source: DuplicateSource, id: string) =>
  source === "playground"
    ? `/documents/${id}`
    : `https://refugies.info/dispositif/${id}`;

export const toCandidate = (
  dispositif: RiDispositif,
  source: DuplicateSource,
) => ({
  id: dispositif.id,
  source,
  url: candidateUrl(source, dispositif.id),
  title: join(dispositif.titreInformatif, dispositif.titreMarque),
  sponsor: join(dispositif.mainSponsorNom, dispositif.mainSponsorAcronyme),
  departments: toDepartments(dispositif.location),
  cities: (dispositif.city ?? []).filter(Boolean),
  status: dispositif.status || "—",
});

type PlaceField = "departement" | "codepostal" | "ville";

const actionPlaceValues = (
  action: RcoActionDocument,
  field: PlaceField,
): string[] => [
  ...new Set(
    action.sessions.flatMap((session) =>
      ((session.lieu_formation as Partial<Record<PlaceField, string>>[]) ?? [])
        .map((place) => place[field])
        .filter((value): value is string => Boolean(value))
        .map(String),
    ),
  ),
];

export const actionDepartments = (action: RcoActionDocument) =>
  actionPlaceValues(action, "departement");

export const actionPostalCodes = (action: RcoActionDocument) =>
  actionPlaceValues(action, "codepostal");

export const actionCities = (action: RcoActionDocument) =>
  actionPlaceValues(action, "ville");

// A doubt only shows in the report: it doesn't make the fiche non-compliant.
export const hasCertainDuplicate = (
  matches: Pick<DuplicateMatch, "verdict">[],
) => matches.some((match) => match.verdict === "duplicate");
