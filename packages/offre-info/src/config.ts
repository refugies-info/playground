import type { SessionOffreField } from "./session-offre";

export const RCO_DEFAULT_BASE_URL = "https://api-offreinfo.intercariforef.org";
export const RCO_SOURCE = "carif-oref";
export const RCO_ORIGIN_PREFIX = "carif-oref--";

export const RCO_FORMACODES = ["15235", "15281", "15043", "15242"] as const;

export const RCO_CERTIFINFO_CODES = [
  "118037",
  "113144",
  "117684",
  "113143",
  "116917",
  "90241",
  "112670",
  "111377",
  "111359",
  "111389",
  "68844",
  "68846",
  "62926",
  "109659",
  "109661",
  "109663",
  "109665",
  "109655",
  "109657",
  "115712",
  "115736",
  "115738",
  "115764",
  "115765",
  "115767",
  "115768",
  "115769",
  "115770",
  "115771",
  "115772",
  "115773",
  "115774",
  "112949",
  "84482",
  "115780",
  "117121",
  "121182",
] as const;

export const RCO_SEARCH_PAGE_LIMIT = 1000;

export const RCO_CONVENTIONNEMENT = true;

export const RCO_FINANCEUR_CODES = [2, 3, 8, 9, 11, 12, 13, 15, 19] as const;

// /recherche only exposes a subset of SessionOffre: the detail (contenu,
// lieux, contacts...) is read from /offre when a fiche is arbitrated.
export const RCO_SEARCH_FIELDS = [
  "id",
  "numero_action",
  "numero_session",
  "url_formation",
  "url_action",
  "intitule_formation",
  "organisme_responsable",
  "date_debut",
  "date_fin",
  "etat_recrutement",
  "modalites_enseignement",
  "nombre_heures_total",
  "info_public_vise",
  "code_public_vise",
] as const satisfies readonly SessionOffreField[];

// Half of the documented 10 req/s quota: we are a guest on their API.
export const RCO_DEFAULT_MAX_REQUESTS_PER_SECOND = 5;

// Same key format as Data Inclusion, which keeps DI history attached.
export const toOriginId = (numeroAction: string): string =>
  `${RCO_ORIGIN_PREFIX}${numeroAction}`;
