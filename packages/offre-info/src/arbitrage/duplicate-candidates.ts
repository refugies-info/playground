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
};

// "refugies-info": published dispositif; "playground": document still being
// processed in the playground (to process or draft).
export type DuplicateSource = "refugies-info" | "playground";

export type DuplicateCandidate = {
  id: string;
  source: DuplicateSource;
  url: string;
  title: string;
  sponsor: string;
  departments: string[];
  cities: string[];
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
});

export const actionDepartments = (action: RcoActionDocument): string[] => [
  ...new Set(
    action.sessions.flatMap((session) =>
      (
        (session.lieu_formation as { departement?: string }[] | undefined) ?? []
      ).map((place) => String(place.departement)),
    ),
  ),
];
