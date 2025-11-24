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

// Basic types
export interface Civilite { _text: string; attributes?: LheoAttributeGroup; }
export interface Nom { _text: string; attributes?: LheoAttributeGroup; }
export interface Prenom { _text: string; attributes?: LheoAttributeGroup; }
export interface Ligne { _text: string; attributes?: LheoAttributeGroup; }
export interface Denomination { _text: string; attributes?: LheoAttributeGroup; }
export interface Codepostal { _text: string; attributes?: LheoAttributeGroup; }
export interface Ville { _text: string; attributes?: LheoAttributeGroup; }
export interface Departement { _text: string; attributes?: LheoAttributeGroup; }
export interface CodeInseeCommune { _text: string; attributes?: LheoAttributeGroup; }
export interface CodeInseeCanton { _text: string; attributes?: LheoAttributeGroup; }
export interface Region { _text: string; attributes?: LheoAttributeGroup; }
export interface Pays { _text: string; attributes?: LheoAttributeGroup; }
export interface Latitude { _text: string; attributes?: LheoAttributeGroup; }
export interface Longitude { _text: string; attributes?: LheoAttributeGroup; }

export interface Geolocalisation {
  latitude: Latitude;
  longitude: Longitude;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface Adresse {
  denomination?: Denomination;
  ligne: Ligne[]; // 1 to 4
  codepostal: Codepostal;
  ville: Ville;
  departement?: Departement;
  "code-INSEE-commune"?: CodeInseeCommune;
  "code-INSEE-canton"?: CodeInseeCanton;
  region?: Region;
  pays?: Pays;
  geolocalisation?: Geolocalisation;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface NumTel { _text: string; attributes?: LheoAttributeGroup; }

export interface Telfixe {
  numtel: NumTel[]; // 1 to 3
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface Portable {
  numtel: NumTel[]; // 1 to 3
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface Fax {
  numtel: NumTel[]; // 1 to 3
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface Courriel { _text: string; attributes?: LheoAttributeGroup; }

export interface UrlWeb { _text: string; attributes?: LheoAttributeGroup; }

export interface Web {
  urlweb: UrlWeb[]; // 1 to 3
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface Coordonnees {
  civilite?: Civilite;
  nom?: Nom;
  prenom?: Prenom;
  ligne?: Ligne[]; // 0 to 3
  adresse?: Adresse;
  telfixe?: Telfixe;
  portable?: Portable;
  fax?: Fax;
  courriel?: Courriel;
  web?: Web;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface Siret { _text: string; attributes?: LheoAttributeGroup; }
export interface CodeUai { _text: string; attributes?: LheoAttributeGroup; }

export interface TypeContact {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface ContactFormation {
  "type-contact"?: TypeContact;
  coordonnees: Coordonnees;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
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

export interface CodeElu { _text: string; attributes?: LheoAttributeGroup; }

export interface CodeTypeFormation {
  "code-CPF"?: CodeCpf;
  "code-ELU"?: CodeElu;
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

export interface SiretLieuFormation extends Siret {
  extras?: Extras[];
}

export interface CodeUaiLieuFormation extends CodeUai {
  extras?: Extras[];
}

export interface LieuDeFormation {
  "SIRET-lieu-formation"?: SiretLieuFormation;
  "code-UAI-lieu-formation"?: CodeUaiLieuFormation;
  coordonnees: Coordonnees;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface ModalitesEntreesSorties {
  _text: "0" | "1";
  attributes?: LheoAttributeGroup;
}

export interface UrlAction {
  urlweb: UrlWeb[]; // 1 to 3
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface DureeCycle {
  _text: number;
  attributes?: LheoAttributeGroup;
}

// Session related types
export interface Debut { _text: string; attributes?: LheoAttributeGroup; }
export interface Fin { _text: string; attributes?: LheoAttributeGroup; }

export interface Periode {
  debut: Debut;
  fin: Fin;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface AdresseInscription {
  adresse: Adresse;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface ModalitesInscription { _text: string; attributes?: LheoAttributeGroup; }

export interface PeriodeInscription {
  periode: Periode;
  attributes?: LheoAttributeGroup;
}

export interface EtatRecrutement { _text: "1" | "2" | "3"; attributes?: LheoAttributeGroup; }

export interface ModaliteRecrutement { _text: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"; attributes?: LheoAttributeGroup; }

export interface ADistance { _text: "0" | "1"; attributes?: LheoAttributeGroup; }
export interface NbPlaces { _text: number; attributes?: LheoAttributeGroup; }
export interface HeureDebut { _text: string; attributes?: LheoAttributeGroup; }
export interface HeureFin { _text: string; attributes?: LheoAttributeGroup; }
export interface Commentaire { _text: string; attributes?: LheoAttributeGroup; }

export interface Recrutement {
  "modalite-recrutement": ModaliteRecrutement;
  "code-perimetre-recrutement"?: CodePerimetreRecrutement;
  "infos-perimetre-recrutement"?: InfosPerimetreRecrutement;
  "a-distance"?: ADistance;
  adresse?: Adresse;
  urlweb?: UrlWeb;
  "nb-places"?: NbPlaces;
  periode?: Periode;
  "heure-debut"?: HeureDebut;
  "heure-fin"?: HeureFin;
  commentaire?: Commentaire;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface UrlSession {
  urlweb: UrlWeb[]; // 1 to 3
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface ContactSession {
  "type-contact"?: TypeContact;
  coordonnees: Coordonnees;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface ReferenceCodeRncp { _text: string; attributes?: LheoAttributeGroup; }
export interface ReferenceCodeCertifinfo { _text: string; attributes?: LheoAttributeGroup; }
export interface ReferenceCodeRs { _text: string; attributes?: LheoAttributeGroup; }

export interface ReferenceCertification {
  "reference-code-RNCP"?: ReferenceCodeRncp;
  "reference-code-CERTIFINFO"?: ReferenceCodeCertifinfo;
  "reference-code-RS"?: ReferenceCodeRs;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface LibelleBloc { _text: string; attributes?: LheoAttributeGroup; }
export interface CodeBloc { _text: string; attributes?: LheoAttributeGroup; }

export interface BlocCompetences {
  "libelle-bloc": LibelleBloc;
  "code-bloc": CodeBloc;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface ValidationBlocs { _text: "0" | "1" | "2"; attributes?: LheoAttributeGroup; }

export interface BlocsCompetences {
  "validation-blocs": ValidationBlocs;
  "reference-certification": ReferenceCertification;
  "bloc-competences": BlocCompetences[];
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface TypeCycle { _text: "0" | "1"; attributes?: LheoAttributeGroup; }
export interface AnneeCycle { _text: number; attributes?: LheoAttributeGroup; }
export interface EffectifMinimal { _text: number; attributes?: LheoAttributeGroup; }
export interface CapaciteSimultanee { _text: number; attributes?: LheoAttributeGroup; }
export interface CapaciteCumulee { _text: number; attributes?: LheoAttributeGroup; }
export interface TypeAlternance { _text: "0" | "1" | "2"; attributes?: LheoAttributeGroup; }
export interface UniteRythmeAlternance { _text: "0" | "1" | "2" | "3" | "4"; attributes?: LheoAttributeGroup; }
export interface UnitesEntreprise { _text: number; attributes?: LheoAttributeGroup; }
export interface UnitesCentre { _text: number; attributes?: LheoAttributeGroup; }

export interface RythmeAlternance {
  "unite-rythme-alternance": UniteRythmeAlternance;
  "unites-entreprise": UnitesEntreprise;
  "unites-centre": UnitesCentre;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface Alternance {
  "type-alternance": TypeAlternance;
  "rythme-alternance"?: RythmeAlternance;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface Cycle {
  "type-cycle": TypeCycle;
  "annee-cycle"?: AnneeCycle[];
  "effectif-minimal"?: EffectifMinimal;
  "capacite-simultanee"?: CapaciteSimultanee;
  "capacite-cumulee"?: CapaciteCumulee;
  alternance?: Alternance;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface Session {
  periode: Periode;
  "adresse-inscription": AdresseInscription;
  "modalites-inscription"?: ModalitesInscription;
  "periode-inscription"?: PeriodeInscription;
  "etat-recrutement"?: EtatRecrutement;
  recrutement?: Recrutement[];
  "url-session"?: UrlSession;
  "contact-session"?: ContactSession[];
  "reference-certification"?: ReferenceCertification[];
  "blocs-competences"?: BlocsCompetences[];
  cycle?: Cycle[];
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

// Action related types
export interface AdresseInformation {
  adresse: Adresse;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface DateLheo { _text: string; attributes?: LheoAttributeGroup; }

export interface DateInformation {
  date: DateLheo;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface Restauration {
  _text: string; // 1-250 chars
  attributes?: LheoAttributeGroup;
}

export interface Hebergement {
  _text: string; // 1-250 chars
  attributes?: LheoAttributeGroup;
}

export interface Transport {
  _text: string; // 1-250 chars
  attributes?: LheoAttributeGroup;
}

export interface AccesHandicapes {
  _text: string; // 1-250 chars
  attributes?: LheoAttributeGroup;
}

export interface LangueFormation {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface ModalitesRecrutement {
  _text: string; // max 3000 chars
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

export interface TypeEquipement { _text: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11"; attributes?: LheoAttributeGroup; }
export interface CoutIndicatifEquipement { _text: number; attributes?: LheoAttributeGroup; }

export interface Equipement {
  "type-equipement": TypeEquipement;
  "cout-indicatif-equipement"?: CoutIndicatifEquipement;
  commentaire?: Commentaire;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface FraisRestants {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface CodePerimetreRecrutement {
  _text: "0" | "1" | "2" | "3" | "4" | "5" | "6";
  attributes?: LheoAttributeGroup;
}

export interface InfosPerimetreRecrutement {
  _text: string;
  attributes?: LheoAttributeGroup;
}

export interface PrixHoraireTtc {
  _text: string; // XSD says string 1-6 chars
  attributes?: LheoAttributeGroup;
}

export interface PrixTotalTtc {
  _text: string; // XSD says string 1-10 chars
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
  _text: "0" | "1";
  attributes?: LheoAttributeGroup;
}

export interface DureeConventionnee {
  _text: number;
  attributes?: LheoAttributeGroup;
}

export interface SiretFormateur extends Siret {
  extras?: Extras[];
}

export interface RaisonSocialeFormateur { _text: string; attributes?: LheoAttributeGroup; }

export interface ContactFormateur {
  "type-contact"?: TypeContact;
  coordonnees: Coordonnees;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface CodeUaiFormateur extends CodeUai {
  extras?: Extras[];
}

export interface Potentiel {
  "code-FORMACODE": CodeFormacode[]; // 1 to 25
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface OrganismeFormateur {
  "SIRET-formateur": SiretFormateur;
  "raison-sociale-formateur": RaisonSocialeFormateur;
  "contact-formateur"?: ContactFormateur[];
  potentiel?: Potentiel;
  "code-UAI-formateur"?: CodeUaiFormateur;
  "reference-certification"?: ReferenceCertification[];
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface CodeFinanceur { _text: "11" | "12" | "13" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "15" | "10" | "0" | "14" | "16" | "17" | "18" | "19" | "20" | "1"; attributes?: LheoAttributeGroup; }
export interface NbPlacesFinancees { _text: number; attributes?: LheoAttributeGroup; }

export interface OrganismeFinanceur {
  "code-financeur": CodeFinanceur;
  "nb-places-financees"?: NbPlacesFinancees;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface LibelleEnseignement { _text: string; attributes?: LheoAttributeGroup; }
export interface TypeEnseignement { _text: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10"; attributes?: LheoAttributeGroup; }
export interface Obligatoire { _text: "0" | "1"; attributes?: LheoAttributeGroup; }

export interface Enseignement {
  "libelle-enseignement": LibelleEnseignement;
  "type-enseignement": TypeEnseignement;
  obligatoire: Obligatoire;
  commentaire?: Commentaire;
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

export interface NumeroActivite { _text: string; attributes?: LheoAttributeGroup; }
export interface SiretOrganismeFormation extends Siret {
  extras?: Extras[];
}

export interface RaisonSociale { _text: string; attributes?: LheoAttributeGroup; }

export interface CoordonneesOrganisme {
  coordonnees: Coordonnees;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface ContactOrganisme {
  "type-contact"?: TypeContact;
  coordonnees: Coordonnees;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface RenseignementsSpecifiques { _text: string; attributes?: LheoAttributeGroup; }

export interface CodeUaiOrganismeFormation extends CodeUai {
  extras?: Extras[];
}

export interface OrganismeFormationResponsable {
  "numero-activite": NumeroActivite;
  "SIRET-organisme-formation": SiretOrganismeFormation;
  "nom-organisme": NomOrganisme;
  "raison-sociale": RaisonSociale;
  "coordonnees-organisme": CoordonneesOrganisme;
  "contact-organisme": ContactOrganisme[];
  "renseignements-specifiques"?: RenseignementsSpecifiques;
  potentiel?: Potentiel;
  "code-UAI-organisme-formation"?: CodeUaiOrganismeFormation;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface IdentifiantModule { _text: string; attributes?: LheoAttributeGroup; }
export interface Positionnement { _text: "1" | "2"; attributes?: LheoAttributeGroup; }

export interface ReferenceModule { _text: string; attributes?: LheoAttributeGroup; }
export interface TypeModule { _text: "0" | "1" | "2"; attributes?: LheoAttributeGroup; }

export interface SousModule {
  "reference-module": ReferenceModule;
  "type-module": TypeModule;
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface SousModules {
  "sous-module": SousModule[];
  extras?: Extras[];
  attributes?: LheoAttributeGroup;
}

export interface ModulesPrerequis {
  "reference-module": ReferenceModule[];
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
  "identifiant-module"?: IdentifiantModule;
  positionnement?: Positionnement;
  "sous-modules"?: SousModules;
  "modules-prerequis"?: ModulesPrerequis;
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

export interface LheoDocument {
  lheo: Lheo;
}
