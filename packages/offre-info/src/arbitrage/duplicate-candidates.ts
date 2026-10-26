import { create, insertMultiple, type Orama, search } from "@orama/orama";
import type { RcoActionDocument } from "../document";

// Shape returned by getDispositifs() in @playground/mongo.
export type RiDispositif = {
  id: string;
  titreInformatif?: string | null;
  titreMarque?: string | null;
  location?: string[] | string | null;
  city?: string[] | null;
  mainSponsorNom?: string | null;
  mainSponsorAcronyme?: string | null;
};

export type DuplicateCandidate = {
  id: string;
  url: string;
  title: string;
  sponsor: string;
  departments: string[];
  score: number;
};

// A dispositif without any department (location "france") is national.
const DEPARTMENT_PREFIX = /^(\d{2,3}|2A|2B)\s*-/;

const toDepartments = (location: RiDispositif["location"]): string[] =>
  (Array.isArray(location) ? location : [])
    .map((place) => place.match(DEPARTMENT_PREFIX)?.[1])
    .filter((department): department is string => Boolean(department));

const join = (...parts: (string | null | undefined)[]) =>
  parts.filter(Boolean).join(" - ");

const toCandidate = (dispositif: RiDispositif) => ({
  id: dispositif.id,
  url: `https://refugies.info/dispositif/${dispositif.id}`,
  title: join(dispositif.titreInformatif, dispositif.titreMarque),
  sponsor: join(dispositif.mainSponsorNom, dispositif.mainSponsorAcronyme),
  departments: toDepartments(dispositif.location),
});

const INDEX_SCHEMA = {
  id: "string",
  title: "string",
  sponsor: "string",
} as const;

export type DispositifIndex = {
  index: Orama<typeof INDEX_SCHEMA>;
  candidatesById: Map<string, Omit<DuplicateCandidate, "score">>;
};

export async function createDispositifIndex(
  dispositifs: RiDispositif[],
): Promise<DispositifIndex> {
  const index = create({ schema: INDEX_SCHEMA, language: "french" });
  const candidates = dispositifs.map(toCandidate);
  await insertMultiple(index, candidates);
  return {
    index,
    candidatesById: new Map(candidates.map((c) => [c.id, c])),
  };
}

const actionDepartments = (action: RcoActionDocument): string[] => [
  ...new Set(
    action.sessions.flatMap((session) =>
      (
        (session.lieu_formation as { departement?: string }[] | undefined) ?? []
      ).map((place) => String(place.departement)),
    ),
  ),
];

// Location is eliminatory: a candidate must be national or share a department.
const isInSameArea = (candidateDepartments: string[], departments: string[]) =>
  departments.length === 0 ||
  candidateDepartments.length === 0 ||
  candidateDepartments.some((department) => departments.includes(department));

const SEARCH_POOL = 50;

export async function findDuplicateCandidates(
  { index, candidatesById }: DispositifIndex,
  action: RcoActionDocument,
  limit = 10,
): Promise<DuplicateCandidate[]> {
  const departments = actionDepartments(action);
  const results = await search(index, {
    term: join(action.nom, action.organisme_responsable?.nom),
    properties: ["title", "sponsor"],
    boost: { sponsor: 1.5 },
    tolerance: 1,
    // 1 = keep documents matching any word, not only all of them.
    threshold: 1,
    limit: SEARCH_POOL,
  });
  return results.hits
    .map((hit) => ({
      ...(candidatesById.get(hit.document.id) as DuplicateCandidate),
      score: Number(hit.score.toFixed(2)),
    }))
    .filter((candidate) => isInSameArea(candidate.departments, departments))
    .slice(0, limit);
}
