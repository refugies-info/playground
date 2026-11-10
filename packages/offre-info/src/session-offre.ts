// Top-level fields of the swagger `SessionOffre` schema. The API omits null
// attributes, so this list is the source of truth for the document shape.
export const SESSION_OFFRE_FIELDS = [
  "id",
  "numero_formation",
  "numero_action",
  "numero_session",
  "url_formation",
  "url_action",
  "url_session",
  "intitule_formation",
  "objectif_formation",
  "contenu_formation",
  "resultat_attendus",
  "parcours_de_formation",
  "objectif_general_formation",
  "positionnement",
  "certifiante",
  "conventionnement",
  "extra_contrat_apprentissage",
  "extra_contrat_professionnalisation",
  "modalites_enseignement",
  "modalites_entrees_sorties",
  "modalites_alternance",
  "modalites_recrutement",
  "conditions_specifiques",
  "detail_conditions_prise_en_charge",
  "niveau_entree_obligatoire",
  "prise_en_charge_frais_possible",
  "prix_horaire_TTC",
  "prix_total_TTC",
  "duree_indicative",
  "rythme_formation",
  "duree_conventionnee",
  "duree_cycle",
  "code_modalite_pedagogique",
  "frais_restants",
  "nombre_heures_centre",
  "nombre_heures_entreprise",
  "nombre_heures_total",
  "code_niveau_entree",
  "code_niveau_sortie",
  "info_public_vise",
  "code_public_vise",
  "cycles",
  "recrutements",
  "modalites_inscription",
  "periode_inscription_debut",
  "periode_inscription_fin",
  "code_perimetre_recrutement",
  "etat_recrutement",
  "date_debut",
  "date_fin",
  "datecrea",
  "datemaj",
  "organisme_responsable",
  "organisme_formateur",
  "lieu_formation",
  "restauration",
  "hebergement",
  "transport",
  "acces_handicapes",
  "equipement",
  "contact_formation",
  "contact_session",
  "adresse_inscription",
  "code_formacode",
  "code_rome",
  "code_nsf",
  "certification",
  "blocs_competences",
  "session_reference_certification",
  "organisme_financeur",
  "financeur_info_public_vise",
] as const;

export type SessionOffreField = (typeof SESSION_OFFRE_FIELDS)[number];

// Swagger says object, the API returns arrays: always exposed as arrays.
export const SESSION_OFFRE_ARRAY_FIELDS = [
  "code_modalite_pedagogique",
  "code_public_vise",
  "cycles",
  "recrutements",
  "organisme_formateur",
  "lieu_formation",
  "equipement",
  "contact_formation",
  "contact_session",
  "code_formacode",
  "code_rome",
  "code_nsf",
  "certification",
  "blocs_competences",
  "session_reference_certification",
  "organisme_financeur",
] as const satisfies readonly SessionOffreField[];

export type OrganismeResponsable = {
  siret?: string | null;
  nom?: string | null;
  raison_sociale?: string | null;
  numero_activite?: string | null;
  coordonnees?: Record<string, unknown> | null;
  contact?: unknown[] | null;
};

export type SessionOffre = Record<SessionOffreField, unknown> & {
  id: string;
  numero_action: string;
  intitule_formation: string | null;
  datemaj: string | null;
  date_debut: string | null;
  organisme_responsable: OrganismeResponsable | null;
};
