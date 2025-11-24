export interface LheoAttributeGroup {
  numero?: string;
  info?: string;
  ref?: string;
  id?: string;
  idref?: string;
  tag?: string;
  "horodatage-creation"?: string;
  "horodatage-modification"?: string;
  "horodatage-export"?: string;
  uri?: string;
}

export interface LheoRootAttributes extends LheoAttributeGroup {
  datemaj?: string;
  datecrea?: string;
}

export interface Extras {
  [key: string]: any;
}

export interface CodeFormacode {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface CodeNsf {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface CodeRome {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface DomaineFormation {
  "code-FORMACODE"?: CodeFormacode[];
  "code-NSF"?: CodeNsf[];
  "code-ROME"?: CodeRome[];
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface IntituleFormation {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface NomOrganisme {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface ObjectifFormation {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface ResultatsAttendus {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface ContenuFormation {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface Certifiante {
  _text: "0" | "1";
  attributes?: LheoAttributeGroup;
}

export interface TypeContact {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface Coordonnees {
  // Assuming structure based on usage in other contexts or generic XSD pattern
  // The XSD snippet didn't fully detail Coordonnees but it's referenced.
  // We will infer common fields or use 'any' for now if not fully clear,
  // but based on typical Lheo, it usually has address, phone, email etc.
  // Let's use a generic structure for now or refine if we see more.
  // Actually, let's look at what we saw: "lheo:coordonnees" is an element.
  // I will define a placeholder and we can refine if needed.
  [key: string]: any;
}

export interface ContactFormation {
  "type-contact"?: TypeContact;
  coordonnees: Coordonnees;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface ParcoursDeFormation {
  _text: "1" | "2" | "3" | "4";
  attributes?: LheoAttributeGroup;
}

export interface CodeNiveauEntree {
  _text:
    | "0"
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "11"
    | "12"
    | "13"
    | "14"
    | "15"
    | "16"
    | "17"
    | "18";
  attributes?: LheoAttributeGroup;
}

export interface ObjectifGeneralFormation {
  _text: "1" | "6" | "7" | "8" | "5" | "9" | "2" | "3" | "4";
  attributes?: LheoAttributeGroup;
}

export interface CodeRncp {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface CodeCertifinfo {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface CodeRs {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface CodeCpf {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface ReferenceCodeFormacode {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface Certification {
  "code-RNCP"?: CodeRncp;
  "code-CERTIFINFO"?: CodeCertifinfo;
  "code-RS"?: CodeRs;
  "code-CPF"?: CodeCpf;
  "reference-code-FORMACODE"?: ReferenceCodeFormacode;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface CodeTypeFormation {
  "code-CPF"?: CodeCpf;
  "code-ELU"?: any; // Not fully seen but referenced
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface CodeNiveauSortie {
  _text:
    | "0"
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "11"
    | "12"
    | "13"
    | "14"
    | "15"
    | "16"
    | "17"
    | "18";
  attributes?: LheoAttributeGroup;
}

export interface UrlWeb {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface UrlFormation {
  urlweb: UrlWeb[];
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface RythmeFormation {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface CodePublicVise {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface InfoPublicVise {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface NiveauEntreeObligatoire {
  _text: "0" | "1";
  attributes?: LheoAttributeGroup;
}

export interface ModalitesAlternance {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface ModalitesEnseignement {
  _text: "0" | "1" | "2";
  attributes?: LheoAttributeGroup;
}

export interface ConditionsSpecifiques {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface PriseEnChargeFraisPossible {
  _text: "0" | "1";
  attributes?: LheoAttributeGroup;
}

export interface LieuDeFormation {
  "SIRET-lieu-formation"?: any;
  "code-UAI-lieu-formation"?: any;
  coordonnees: Coordonnees;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface ModalitesEntreesSorties {
  _text: "0" | "1";
  attributes?: LheoAttributeGroup;
}

export interface UrlAction {
  urlweb: UrlWeb[]; // Assuming similar structure to UrlFormation
  attributes?: LheoAttributeGroup;
}

export interface DureeCycle {
  _text: string; // Assuming simple text or similar
  attributes?: LheoAttributeGroup;
}

export interface Session {
  periode?: any;
  adresse?: any;
  "adresse-inscription"?: any;
  "modalites-inscription"?: any;
  "etat-recrutement"?: any;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface AdresseInformation {
  // Placeholder
  [key: string]: any;
}

export interface DateInformation {
  // Placeholder
  [key: string]: any;
}

export interface Restauration {
  _text: "0" | "1"; // Assuming boolean-like
  attributes?: LheoAttributeGroup;
}

export interface Hebergement {
  _text: "0" | "1";
  attributes?: LheoAttributeGroup;
}

export interface Transport {
  _text: "0" | "1";
  attributes?: LheoAttributeGroup;
}

export interface AccesHandicapes {
  _text: "0" | "1";
  attributes?: LheoAttributeGroup;
}

export interface LangueFormation {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface ModalitesRecrutement {
  _text: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
  attributes?: LheoAttributeGroup;
}

export interface ModalitesPedagogiques {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface CodeModalitePedagogique {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface Equipement {
  "type-equipement": any;
  "cout-indicatif-equipement"?: any;
  commentaire?: any;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface FraisRestants {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface CodePerimetreRecrutement {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface InfosPerimetreRecrutement {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface PrixHoraireTtc {
  _text: number; // Assuming numeric
  attributes?: LheoAttributeGroup;
}

export interface PrixTotalTtc {
  _text: number;
  attributes?: LheoAttributeGroup;
}

export interface DureeIndicative {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface NombreHeuresCentre {
  _text: number;
  attributes?: LheoAttributeGroup;
}

export interface NombreHeuresEntreprise {
  _text: number;
  attributes?: LheoAttributeGroup;
}

export interface NombreHeuresTotal {
  _text: number;
  attributes?: LheoAttributeGroup;
}

export interface DetailConditionsPriseEnCharge {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface Conventionnement {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface DureeConventionnee {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface OrganismeFormateur {
  "SIRET-formateur": any;
  "raison-sociale-formateur": any;
  "contact-formateur"?: any[];
  potentiel?: any;
  "code-UAI-formateur"?: any;
  "reference-certification"?: any[];
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface OrganismeFinanceur {
  // Placeholder
  [key: string]: any;
}

export interface Enseignement {
  "libelle-enseignement": any;
  "type-enseignement": any;
  obligatoire: any;
  commentaire?: any;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface Action {
  "rythme-formation": RythmeFormation;
  "code-public-vise": CodePublicVise[];
  "info-public-vise"?: InfoPublicVise;
  "niveau-entree-obligatoire": NiveauEntreeObligatoire;
  "modalites-alternance": ModalitesAlternance;
  "modalites-enseignement": ModalitesEnseignement;
  "conditions-specifiques": ConditionsSpecifiques;
  "prise-en-charge-frais-possible": PriseEnChargeFraisPossible;
  "lieu-de-formation"?: LieuDeFormation[];
  "modalites-entrees-sorties": ModalitesEntreesSorties;
  "url-action"?: UrlAction;
  "duree-cycle"?: DureeCycle;
  session: Session[];
  "adresse-information"?: AdresseInformation;
  "date-information"?: DateInformation[];
  restauration?: Restauration;
  hebergement?: Hebergement;
  transport?: Transport;
  "acces-handicapes"?: AccesHandicapes;
  "langue-formation"?: LangueFormation[];
  "modalites-recrutement"?: ModalitesRecrutement;
  "modalites-pedagogiques"?: ModalitesPedagogiques;
  "code-modalite-pedagogique"?: CodeModalitePedagogique[];
  equipement?: Equipement[];
  "frais-restants"?: FraisRestants;
  "code-perimetre-recrutement"?: CodePerimetreRecrutement;
  "infos-perimetre-recrutement"?: InfosPerimetreRecrutement;
  "prix-horaire-TTC"?: PrixHoraireTtc;
  "prix-total-TTC"?: PrixTotalTtc;
  "duree-indicative"?: DureeIndicative;
  "nombre-heures-centre"?: NombreHeuresCentre;
  "nombre-heures-entreprise"?: NombreHeuresEntreprise;
  "nombre-heures-total"?: NombreHeuresTotal;
  "detail-conditions-prise-en-charge"?: DetailConditionsPriseEnCharge;
  conventionnement?: Conventionnement;
  "duree-conventionnee"?: DureeConventionnee;
  "organisme-formateur"?: OrganismeFormateur[];
  "organisme-financeur"?: OrganismeFinanceur[];
  enseignement?: Enseignement[];
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface OrganismeFormationResponsable {
  "numero-activite": any;
  "SIRET-organisme-formation": any;
  "nom-organisme": NomOrganisme;
  "raison-sociale": any;
  "coordonnees-organisme": any;
  "contact-organisme": any[];
  "renseignements-specifiques"?: any;
  potentiel?: any;
  "code-UAI-organisme-formation"?: any;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface Formation {
  "domaine-formation": DomaineFormation;
  "intitule-formation": IntituleFormation;
  "objectif-formation": ObjectifFormation;
  "resultats-attendus": ResultatsAttendus;
  "contenu-formation": ContenuFormation;
  certifiante: Certifiante;
  "contact-formation": ContactFormation[];
  "parcours-de-formation": ParcoursDeFormation;
  "code-niveau-entree": CodeNiveauEntree;
  "objectif-general-formation"?: ObjectifGeneralFormation;
  certification?: Certification[];
  "code-type-formation"?: CodeTypeFormation[];
  "code-niveau-sortie"?: CodeNiveauSortie;
  "url-formation"?: UrlFormation;
  action: Action[];
  "organisme-formation-responsable": OrganismeFormationResponsable;
  "identifiant-module"?: any;
  positionnement?: any;
  "sous-modules"?: any;
  "modules-prerequis"?: any;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface Offres {
  formation: Formation[];
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface Lheo {
  offres: Offres;
  extras?: Extras[];
  attributes?: LheoRootAttributes;
}
