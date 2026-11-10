import { RCO_SOURCE, toOriginId } from "./config";
import type { SessionOffre } from "./session-offre";

// Fields that vary per session. Everything else describes the action itself,
// so a change limited to these fields is a "sessions only" change.
export const SESSION_LEVEL_FIELDS = [
  "id",
  "numero_session",
  "url_session",
  "date_debut",
  "date_fin",
  "etat_recrutement",
  "periode_inscription_debut",
  "periode_inscription_fin",
  "modalites_inscription",
  "recrutements",
  "cycles",
  "contact_session",
  "lieu_formation",
  "adresse_inscription",
  "datecrea",
  "datemaj",
] as const;

type SessionLevelField = (typeof SESSION_LEVEL_FIELDS)[number];

export type RcoSession = Pick<SessionOffre, SessionLevelField>;

export type RcoActionDocument = Omit<SessionOffre, SessionLevelField> & {
  id: string;
  nom: string;
  source: string;
  structure_id: string;
  sessions: RcoSession[];
};

const SESSION_LEVEL_FIELD_SET = new Set<string>(SESSION_LEVEL_FIELDS);

const compareNullableText = (a: unknown, b: unknown) =>
  String(a ?? "").localeCompare(String(b ?? ""));

export function pickReferenceSession(sessions: SessionOffre[]): SessionOffre {
  const [reference] = [...sessions].sort(
    (a, b) =>
      compareNullableText(b.datemaj, a.datemaj) ||
      compareNullableText(a.id, b.id),
  );
  if (!reference) throw new Error("An RCO action needs at least one session");
  return reference;
}

const pickSessionFields = (session: SessionOffre): RcoSession =>
  Object.fromEntries(
    SESSION_LEVEL_FIELDS.map((field) => [field, session[field]]),
  ) as RcoSession;

export function buildActionDocument(
  sessions: SessionOffre[],
  structureId: string,
): RcoActionDocument {
  const reference = pickReferenceSession(sessions);
  const actionFields = Object.fromEntries(
    Object.entries(reference).filter(
      ([field]) => !SESSION_LEVEL_FIELD_SET.has(field),
    ),
  );
  return {
    ...actionFields,
    id: toOriginId(reference.numero_action),
    nom: reference.intitule_formation ?? reference.numero_action,
    source: RCO_SOURCE,
    structure_id: structureId,
    sessions: sessions
      .map(pickSessionFields)
      .sort(
        (a, b) =>
          compareNullableText(a.date_debut, b.date_debut) ||
          compareNullableText(a.id, b.id),
      ),
  } as RcoActionDocument;
}
