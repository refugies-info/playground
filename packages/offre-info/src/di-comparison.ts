import type { RcoActionDocument } from "./document";

export type DiComparisonRow = {
  field: string;
  di: string | null;
  rco: string | null;
  same: boolean;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};

const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

const asText = (value: unknown): string | null =>
  value === null || value === undefined || value === "" ? null : String(value);

// DI (LHEO) dates are YYYYMMDD, RCO dates are YYYY-MM-DD.
const toIsoDate = (value: unknown): string | null => {
  const text = asText(value);
  return text && /^\d{8}$/.test(text)
    ? `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`
    : text;
};

const formatSession = (
  numero: unknown,
  start: unknown,
  end: unknown,
  recruitment: unknown,
) =>
  `${asText(numero) ?? "?"} ${toIsoDate(start) ?? "?"} → ${toIsoDate(end) ?? "?"} (recrutement ${asText(recruitment) ?? "?"})`;

const joinSorted = (values: string[]): string | null =>
  values.length > 0 ? [...values].sort().join(" ; ") : null;

function diSessions(diData: Record<string, unknown>): string | null {
  const sessions = asArray(asRecord(asRecord(diData.extra).action).session);
  return joinSorted(
    sessions.map((session) => {
      const { periode, ...rest } = asRecord(session);
      return formatSession(
        rest["@numero"],
        asRecord(periode).debut,
        asRecord(periode).fin,
        rest["etat-recrutement"],
      );
    }),
  );
}

const rcoSessions = (document: RcoActionDocument): string | null =>
  joinSorted(
    document.sessions.map((session) =>
      formatSession(
        session.numero_session,
        session.date_debut,
        session.date_fin,
        session.etat_recrutement,
      ),
    ),
  );

const firstRcoCity = (document: RcoActionDocument): string | null =>
  document.sessions
    .flatMap((session) => asArray(session.lieu_formation))
    .map((place) => asText(asRecord(place).ville))
    .find((city) => city !== null) ?? null;

const row = (
  field: string,
  di: string | null,
  rco: string | null,
): DiComparisonRow => ({ field, di, rco, same: di === rco });

// Fields present in both shapes, to check a DI → RCO switch by hand.
export function compareWithDiVersion(
  diServiceData: unknown,
  document: RcoActionDocument,
): DiComparisonRow[] {
  const di = asRecord(diServiceData);
  const diAction = asRecord(asRecord(di.extra).action);
  return [
    row("Titre", asText(di.nom), asText(document.nom)),
    row("Structure", asText(di.structure_id), asText(document.structure_id)),
    row("Commune", asText(di.commune), firstRcoCity(document)),
    row(
      "Heures totales",
      asText(diAction["nombre-heures-total"]),
      asText(document.nombre_heures_total),
    ),
    row("Sessions", diSessions(di), rcoSessions(document)),
  ];
}
