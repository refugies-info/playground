// This file is manually maintained to provide a clean, typed interface to the Data Inclusion API
// Based on OpenAPI v1 spec

/**
 * Paginated response wrapper
 */
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// --- Enums ---

export type TypeService =
  | "accompagnement"
  | "aide-financiere"
  | "aide-materielle"
  | "atelier"
  | "formation"
  | "information";

export type Thematique =
  | "choisir-un-metier--confirmer-son-choix-de-metier"
  | "choisir-un-metier--connaitre-les-opportunites-demploi"
  | "choisir-un-metier--decouvrir-un-metier-ou-un-secteur-dactivite"
  | "choisir-un-metier--identifier-ses-points-forts-et-ses-competences"
  | "creer-une-entreprise--definir-son-projet-de-creation-dentreprise"
  | "creer-une-entreprise--developper-son-entreprise"
  | "creer-une-entreprise--structurer-son-projet-de-creation-dentreprise"
  | "difficultes-administratives-ou-juridiques--accompagnement-aux-demarches-administratives"
  | "difficultes-administratives-ou-juridiques--accompagnement-pour-lacces-a-la-citoyennete"
  | "difficultes-administratives-ou-juridiques--accompagnement-pour-lacces-aux-droits"
  | "difficultes-administratives-ou-juridiques--beneficier-dune-mesure-daccompagnement-adapte"
  | "difficultes-administratives-ou-juridiques--connaitre-ses-droits-face-a-une-discrimination"
  | "difficultes-administratives-ou-juridiques--prendre-en-compte-une-problematique-judiciaire"
  | "difficultes-financieres--acquerir-une-autonomie-budgetaire"
  | "difficultes-financieres--ameliorer-sa-gestion-budgetaire"
  | "difficultes-financieres--mettre-en-place-une-mesure-de-protection-financiere"
  | "difficultes-financieres--prevenir-une-degradation-de-la-situation-financiere"
  | "difficultes-financieres--situation-dendettement-surendettement"
  | "equipement-et-alimentation--aide-menagere"
  | "equipement-et-alimentation--alimentation"
  | "equipement-et-alimentation--electromenager"
  | "equipement-et-alimentation--habillement"
  | "famille--garde-denfants"
  | "famille--prise-en-charge-personne-dependante"
  | "famille--soutien-a-la-parentalite-et-a-leducation"
  | "famille--soutien-aidants"
  | "famille--surmonter-conflits-separation-violence"
  | "lecture-ecriture-calcul--maitriser-le-calcul"
  | "lecture-ecriture-calcul--maitriser-le-francais"
  | "logement-hebergement--acheter-un-logement"
  | "logement-hebergement--changer-de-logement"
  | "logement-hebergement--louer-un-logement"
  | "logement-hebergement--rechercher-une-solution-dhebergement-temporaire"
  | "logement-hebergement--reduire-les-impayes-de-loyer"
  | "logement-hebergement--se-maintenir-dans-le-logement"
  | "logement-hebergement--sinformer-sur-les-demarches-liees-a-lacces-au-logement"
  | "mobilite--acceder-a-un-vehicule"
  | "mobilite--entretenir-reparer-son-vehicule"
  | "mobilite--etre-accompagne-dans-son-parcours-mobilite"
  | "mobilite--financer-ma-mobilite"
  | "mobilite--preparer-un-permis"
  | "mobilite--mobilite-douce-partagee-collective"
  | "numerique--acceder-a-des-services-en-ligne"
  | "numerique--acceder-a-une-connexion-internet"
  | "numerique--acquerir-un-equipement"
  | "numerique--maitriser-les-fondamentaux-du-numerique"
  | "preparer-sa-candidature--developper-son-reseau"
  | "preparer-sa-candidature--organiser-ses-demarches-de-recherche-demploi"
  | "preparer-sa-candidature--realiser-un-cv-et-ou-une-lettre-de-motivation"
  | "preparer-sa-candidature--valoriser-ses-competences"
  | "remobilisation--activites-sportives-et-culturelles"
  | "remobilisation--benevolat-action-citoyenne"
  | "remobilisation--bien-etre-confiance-en-soi"
  | "remobilisation--lien-social"
  | "sante--acces-aux-soins"
  | "sante--addictions"
  | "sante--constituer-un-dossier-mdph-invalidite"
  | "sante--sante-mentale"
  | "sante--sante-sexuelle"
  | "se-former--monter-son-dossier-de-formation"
  | "se-former--trouver-sa-formation"
  | "souvrir-a-linternational--connaitre-les-opportunites-demploi-a-letranger"
  | "souvrir-a-linternational--sinformer-sur-les-aides-pour-travailler-a-letranger"
  | "souvrir-a-linternational--sorganiser-suite-a-son-retour-en-france"
  | "trouver-un-emploi--convaincre-un-recruteur-en-entretien"
  | "trouver-un-emploi--faire-des-candidatures-spontanees"
  | "trouver-un-emploi--maintien-dans-lemploi"
  | "trouver-un-emploi--repondre-a-des-offres-demploi"
  | "trouver-un-emploi--suivre-ses-candidatures-et-relancer-les-employeurs";

export type Frais = "gratuit" | "payant";

export type Public =
  | "tous-publics"
  | "actifs"
  | "beneficiaires-des-minimas-sociaux"
  | "demandeurs-emploi"
  | "etudiants"
  | "familles"
  | "femmes"
  | "jeunes"
  | "personnes-en-situation-de-handicap"
  | "personnes-en-situation-durgence"
  | "personnes-en-situation-juridique-specifique"
  | "personnes-exilees"
  | "residents-qpv-frr"
  | "seniors";

export type ModeAccueil = "a-distance" | "en-presentiel";

export type ModeMobilisation =
  | "envoyer-un-courriel"
  | "se-presenter"
  | "telephoner"
  | "utiliser-lien-mobilisation";

export type PersonneMobilisatrice = "usagers" | "professionnels";

export type ReseauPorteur =
  | "60000-rebonds"
  | "action-logement"
  | "adie"
  | "afpa"
  | "agefiph"
  | "ai"
  | "aidants-connect"
  | "alliance-villes-emploi"
  | "anlci"
  | "apprentis-dauteuil"
  | "ase"
  | "banques-alimentaires"
  | "caarud"
  | "cada"
  | "caf"
  | "campus-connecte"
  | "cap-emploi-reseau-cheops"
  | "cava"
  | "ccas-cias"
  | "chambres-consulaires"
  | "chantier-ecole"
  | "chrs"
  | "chu"
  | "cidff"
  | "cmp"
  | "cms"
  | "cnam"
  | "collectif-emploi"
  | "communes"
  | "coorace"
  | "conseillers-numeriques"
  | "cpam"
  | "cph"
  | "creches-avip"
  | "crepi"
  | "cresus"
  | "croix-rouge"
  | "csapa"
  | "delegataire-conseil-departemental"
  | "departements"
  | "duo-for-a-job"
  | "ecoles-de-la-deuxieme-chance"
  | "ea"
  | "eatt"
  | "egee"
  | "emmaus"
  | "epide"
  | "esat"
  | "espaces-publics-numeriques"
  | "etcld"
  | "fabrique-de-territoire"
  | "face"
  | "fcsf"
  | "federation-professionnelle-femmes"
  | "federation-des-acteurs-de-la-solidarite"
  | "france-active"
  | "france-service"
  | "france-travail"
  | "french-tech"
  | "geiq"
  | "grandes-ecoles-du-numerique"
  | "huda"
  | "hup"
  | "inae"
  | "initiative-france"
  | "konexio"
  | "la-cravate-solidaire"
  | "la-poste"
  | "les-premieres"
  | "maisons-de-l-emploi"
  | "maison-departementale-de-lautonomie"
  | "maisons-des-solidarites"
  | "mission-locale"
  | "mjc"
  | "mobin"
  | "msap"
  | "mutualite-sociale-agricole"
  | "nqt"
  | "pimms-mediation"
  | "pjj"
  | "plie"
  | "points-conseil-budget"
  | "points-justice"
  | "positive-planet"
  | "regions"
  | "reseau-app"
  | "reseau-bge"
  | "reseau-entreprendre"
  | "reseau-information-jeunesse"
  | "residences-fjt"
  | "ressourceries"
  | "restos-du-coeur"
  | "secours-populaire"
  | "ei"
  | "aci"
  | "etti"
  | "eiti"
  | "siao"
  | "simplon"
  | "singa"
  | "snc"
  | "spip"
  | "tous-tes-possibles"
  | "unaf"
  | "unea"
  | "unis-cite"
  | "wimoov";

// --- Shared Types ---

export interface Source {
  slug: string;
  nom: string;
  description: string | null;
}

export interface StructureBase {
  source: string;
  id: string;
  nom: string;
  date_maj: string;
  description?: string | null;
  lien_source?: string | null;
  siret?: string | null;
  commune?: string | null;
  code_postal?: string | null;
  code_insee?: string | null;
  adresse?: string | null;
  complement_adresse?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  telephone?: string | null;
  courriel?: string | null;
  site_web?: string | null;
  horaires_accueil?: string | null;
  accessibilite_lieu?: string | null;
  reseaux_porteurs?: ReseauPorteur[] | null;
}

export interface StructureSummary extends StructureBase {
  score_qualite?: number;
  doublons?: { source: string; id: string }[];
}

export interface Structure extends StructureBase {
  score_qualite?: number;
  doublons?: StructureBase[]; // The spec is a bit recursive here, usually simplified in details
  services?: Service[];
}

export interface Service {
  source: string;
  structure_id: string;
  id: string;
  nom: string;
  description: string;
  lien_source?: string | null;
  date_maj: string;
  type?: TypeService | null;
  thematiques?: Thematique[] | null;
  frais?: Frais | null;
  frais_precisions?: string | null;
  publics?: Public[] | null;
  publics_precisions?: string | null;
  conditions_acces?: string | null;
  commune?: string | null;
  code_postal?: string | null;
  code_insee?: string | null;
  adresse?: string | null;
  complement_adresse?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  telephone?: string | null;
  courriel?: string | null;
  modes_accueil?: ModeAccueil[] | null;
  zone_eligibilite?: string[] | null;
  contact_nom_prenom?: string | null;
  lien_mobilisation?: string | null;
  modes_mobilisation?: ModeMobilisation[] | null;
  mobilisable_par?: PersonneMobilisatrice[] | null;
  mobilisation_precisions?: string | null;
  volume_horaire_hebdomadaire?: number | null;
  nombre_semaines?: number | null;
  horaires_accueil?: string | null;
  score_qualite: number;
  extra?: {
    action?: {
      conventionnement?: string;
      [key: string]: any;
    };
    formation?: {
      [key: string]: any;
    };
    [key: string]: any;
  } | null;
}

export interface ServiceDetail extends Service {
  structure: StructureBase;
}

export interface ServiceResult {
  service: ServiceDetail;
  distance?: number | null;
}

// --- Query Params ---

export interface StructureSearchParams {
  page?: number;
  size?: number;
  sources?: string[];
  reseaux_porteurs?: ReseauPorteur[];
  code_region?: string;
  slug_region?: string;
  code_departement?: string;
  slug_departement?: string;
  code_commune?: string;
  exclure_doublons?: boolean;
}

export interface ServiceSearchParams {
  page?: number;
  size?: number;
  sources?: string[];
  thematiques?: Thematique[];
  code_region?: string;
  slug_region?: string;
  code_departement?: string;
  slug_departement?: string;
  code_commune?: string;
  frais?: Frais[];
  publics?: Public[];
  recherche_public?: string;
  modes_accueil?: ModeAccueil[];
  types?: TypeService[];
  score_qualite_minimum?: number;
}

export interface ServiceFullSearchParams extends ServiceSearchParams {
  lat?: number;
  lon?: number;
  exclure_doublons?: boolean;
}
