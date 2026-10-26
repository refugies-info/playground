import { RI_DEPARTMENTS } from "@playground/shared-types";
import { isSessionOpen } from "../arbitrage/compliance-rules";
import type { RcoActionDocument } from "../document";
import {
  DISTANCE_LEARNING_CODE,
  ILE_DE_FRANCE_DEPARTMENTS,
  METADATA_LABELS,
  type MetadataKey,
  PUBLIC_STATUS_BY_AUDIENCE_CODE,
} from "./metadata-config";

export type MetadataSource = { field: string; rawValue?: unknown };

export type MappedField = {
  key: MetadataKey;
  value: unknown;
  source: MetadataSource[];
};

// The API omits null attributes: every field read here may be undefined.
type Place = {
  denomination?: string;
  adresse_ligne1?: string;
  codepostal?: string;
  ville?: string;
  departement?: string;
  latitude?: number | string;
  longitude?: number | string;
};

type Contact = { courriel?: string; telfixe?: string; portable?: string };

const mapped = (
  key: MetadataKey,
  value: unknown,
  ...source: MetadataSource[]
): MappedField => ({ key, value, source });

const places = (action: RcoActionDocument): Place[] =>
  action.sessions.flatMap(
    (session) => (session.lieu_formation as Place[] | undefined) ?? [],
  );

const unique = <T>(values: T[]) => [...new Set(values)];

export function mapBrandTitle(action: RcoActionDocument): MappedField | null {
  if (!action.intitule_formation) return null;
  return mapped("titreMarque", action.intitule_formation, {
    field: "intitule_formation",
    rawValue: action.intitule_formation,
  });
}

export function mapSponsor(action: RcoActionDocument): MappedField | null {
  const name =
    action.organisme_responsable?.nom ??
    action.organisme_responsable?.raison_sociale;
  if (!name) return null;
  return mapped("mainSponsor", name, {
    field: "organisme_responsable.nom",
    rawValue: name,
  });
}

const toRiDepartment = (code: string) =>
  RI_DEPARTMENTS.find((department) =>
    department.startsWith(`${code.padStart(2, "0")} - `),
  );

export function mapLocation(action: RcoActionDocument): MappedField | null {
  if (action.modalites_enseignement === DISTANCE_LEARNING_CODE) {
    return mapped("location", "online", {
      field: "modalites_enseignement",
      rawValue: action.modalites_enseignement,
    });
  }
  const codes = unique(
    places(action)
      .map((place) => place.departement)
      .filter((code): code is string => Boolean(code)),
  );
  const withIleDeFrance = codes.some((code) =>
    ILE_DE_FRANCE_DEPARTMENTS.includes(code),
  )
    ? unique([...codes, ...ILE_DE_FRANCE_DEPARTMENTS])
    : codes;
  const departments = withIleDeFrance
    .map(toRiDepartment)
    .filter((department): department is (typeof RI_DEPARTMENTS)[number] =>
      Boolean(department),
    );
  if (departments.length === 0) return null;
  return mapped("location", departments.sort(), {
    field: "sessions[].lieu_formation[].departement",
    rawValue: codes,
  });
}

export function mapPeriode(
  action: RcoActionDocument,
  today: string,
): MappedField | null {
  const permanent = action.modalites_entrees_sorties;
  const items = action.sessions
    .filter(
      (session) =>
        session.date_debut &&
        session.date_fin &&
        isSessionOpen(session, permanent, today),
    )
    .map((session) => ({
      startDate: `${session.date_debut}T00:00:00.000Z`,
      endDate: `${session.date_fin}T00:00:00.000Z`,
    }));
  if (items.length === 0 && typeof permanent !== "boolean") return null;
  return mapped(
    "periode",
    {
      modalitesEntreesSorties:
        typeof permanent === "boolean" ? Number(permanent) : null,
      items: items.length ? items : null,
    },
    { field: "modalites_entrees_sorties", rawValue: permanent },
    {
      field: "sessions[].date_debut / date_fin",
      rawValue: items.map((item) => `${item.startDate} → ${item.endDate}`),
    },
  );
}

export function mapCommitment(action: RcoActionDocument): MappedField | null {
  const hours = action.nombre_heures_total;
  if (typeof hours !== "number") return null;
  return mapped(
    "commitment",
    { amountDetails: "exactly", hours: [hours], timeUnit: "hours" },
    { field: "nombre_heures_total", rawValue: hours },
  );
}

// "1 200,50 €" → 1200.5; free text without a number stays undecided.
const AMOUNT = /^\s*(\d[\d\s]*(?:[.,]\d+)?)\s*(€|euros?)?\s*$/i;

export function mapPrice(action: RcoActionDocument): MappedField | null {
  const remaining = action.frais_restants;
  const source = { field: "frais_restants", rawValue: remaining ?? null };
  if (remaining == null || String(remaining).trim() === "") {
    return mapped("price", { values: [0] }, source);
  }
  const match = String(remaining).match(AMOUNT);
  if (!match) return null;
  const amount = Number(match[1].replace(/\s/g, "").replace(",", "."));
  return mapped("price", { values: [amount] }, source);
}

export function mapPublicStatus(action: RcoActionDocument): MappedField | null {
  const codes = ((action.code_public_vise as unknown[] | undefined) ?? []).map(
    String,
  );
  const statuses = unique(
    codes.flatMap((code) => PUBLIC_STATUS_BY_AUDIENCE_CODE[code] ?? []),
  );
  if (statuses.length === 0) return null;
  return mapped("publicStatus", statuses, {
    field: "code_public_vise",
    rawValue: codes,
  });
}

const toCoordinate = (value: unknown) =>
  value == null || value === "" ? undefined : Number(value);

export const withoutEmpty = (object: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );

export function mapPlaces(action: RcoActionDocument): MappedField | null {
  const contact = (action.contact_formation as Contact[] | undefined)?.[0];
  const pois = [
    ...new Map(
      places(action).map((place) => [
        `${place.denomination}|${place.adresse_ligne1}|${place.ville}`,
        withoutEmpty({
          title: place.denomination,
          address: [place.adresse_ligne1, place.codepostal]
            .filter(Boolean)
            .join(", "),
          city: place.ville,
          lat: toCoordinate(place.latitude),
          lng: toCoordinate(place.longitude),
          email: contact?.courriel,
          phone: contact?.telfixe ?? contact?.portable,
        }),
      ]),
    ).values(),
  ];
  if (pois.length === 0) return null;
  return mapped(
    "map",
    pois,
    { field: "sessions[].lieu_formation[]", rawValue: pois.length },
    { field: "contact_formation[0]", rawValue: contact ?? null },
  );
}

export function mapMetadata(
  action: RcoActionDocument,
  today = new Date().toISOString().slice(0, 10),
): MappedField[] {
  return [
    mapBrandTitle(action),
    mapSponsor(action),
    mapLocation(action),
    mapPeriode(action, today),
    mapCommitment(action),
    mapPrice(action),
    mapPublicStatus(action),
    mapPlaces(action),
  ].filter((field): field is MappedField => field !== null);
}

// Everything the code left open goes to the rco-metadata agent.
export const metadataKeysForAi = (fields: MappedField[]): MetadataKey[] => {
  const decided = new Set(fields.map((field) => field.key));
  return (Object.keys(METADATA_LABELS) as MetadataKey[]).filter(
    (key) => !decided.has(key),
  );
};

// Only the texts and figures the agent needs: no ids, no addresses.
export const toMetadataDocument = (action: RcoActionDocument) => ({
  nom: action.nom,
  organisme: action.organisme_responsable?.nom,
  objectif_formation: action.objectif_formation,
  contenu_formation: action.contenu_formation,
  resultat_attendus: action.resultat_attendus,
  conditions_specifiques: action.conditions_specifiques,
  info_public_vise: action.info_public_vise,
  code_public_vise: action.code_public_vise,
  duree_indicative: action.duree_indicative,
  nombre_heures_total: action.nombre_heures_total,
  rythme_formation: action.rythme_formation,
  frais_restants: action.frais_restants,
  detail_conditions_prise_en_charge: action.detail_conditions_prise_en_charge,
  sessions: action.sessions.map((session) => ({
    date_debut: session.date_debut,
    date_fin: session.date_fin,
    villes: ((session.lieu_formation as Place[] | undefined) ?? []).map(
      (place) => place.ville,
    ),
  })),
});
