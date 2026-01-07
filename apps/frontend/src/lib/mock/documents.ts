import type {
  Document,
  DocumentState,
  DocumentStatus,
} from "@playground/shared-types";
import { SeededRandom } from "./seededRandom";

const SOURCES = ["RCO", "Manual", "API"];
const STATUSES: DocumentStatus[] = ["compliant", "non_compliant"];
const STATES: DocumentState[] = [
  "draft",
  "to_process",
  "archived",
  "published",
];

// Cache to store generated documents
let cachedDocuments: Document[] | null = null;

export function generateMockDocuments(count: number = 50): Document[] {
  // Return cached documents if already generated
  if (cachedDocuments && cachedDocuments.length === count) {
    return cachedDocuments;
  }

  const titles = [
    "Cours de français langue d'intégration",
    "Formation en informatique de base",
    "Aide à la recherche d'emploi",
    "Accompagnement social et administratif",
    "Cours de mathématiques appliquées",
    "Atelier de communication professionnelle",
    "Formation en gestion budgétaire",
    "Cours de civisme et citoyenneté",
  ];

  const objectives = [
    "Développer les compétences communicatives orales et écrites",
    "Favoriser l'autonomie et l'indépendance",
    "Préparer à l'intégration professionnelle",
    "Améliorer les compétences numériques",
    "Renforcer les connaissances administratives",
  ];

  const locations = [
    "Paris (75)",
    "Lyon (69)",
    "Marseille (13)",
    "Toulouse (31)",
    "Nice (06)",
    "Strasbourg (67)",
    "Bordeaux (33)",
    "Lille (59)",
  ];

  // First document: Actions socio-linguistiques complémentaires du CIR (ASL)
  const aslDocument: Document = {
    id: "asl-languaction-2025",
    title:
      "Actions socio-linguistiques complémentaires du CIR (ASL) - Langu'Action - métiers en tension",
    date_added: new Date("2025-11-25").toISOString(),
    status: "accepted",
    state: "published",
    content: `# Actions socio-linguistiques complémentaires du CIR (ASL) - Langu'Action - métiers en tension

Date de mise à jour : 25/11/2025 | Identifiant OffreInfo : 14_AF_0000214846

## Objectifs, programme, validation de la formation

### **Objectifs**

Objectifs visés :

- Accéder à un emploi
- Accéder à une formation ou à une certification professionnelle
- Préparer un diplôme ou une certification de langue française [DELF A2 ou B1, TCF]

Niveau de langue et de compétences visé par la formation :

- CECRL : A2

### **Programme de la formation**

L'action est destinée à un public éloigné de l'emploi, migrant.es allophones ayant acquis une base en français (A1 acquis à l'oral et à l'écrit) mais dont le niveau reste encore trop fragile pour être employable ou suivre une formation qualifiante. Ces personnes ont, pour la plupart, une expérience (même informelle) dans certains domaines et souhaitent intégrer des secteurs formels. Langu'Action constitue donc une suite logique à leur parcours vers l'intégration et l'autonomie?: en leur permettant d'atteindre un niveau linguistique nécessaire pour un premier pas dans le monde du travail (A2 voire B1) et en leur donnant une vision plus concrète des attendus et contraintes des domaines professionnels en tension (services à la personne, BTP, restauration, vente, métiers de la réparation et du réemploi, transport et logistique, commerce et grande distribution, petite enfance…).

Langu'Action est une formation intensive de 3 mois, soit 288 heures, gratuite pour les bénéficiaires, incluant la certification linguistique de fin de formation (DELF, TCF). Elle prévoit 3 sessions de 15 personnes. Les cours seront dispensés lundi, mardi, jeudi et vendredi, de 09h à 16h avec une pause de 12h à 13h. Ils seront répartis de la façon suivante : cours de FLE/FOS le matin ; ateliers numériques, socio-culturels ou professionnels l'après-midi.

Le programme comprend :

- 162h de français langue étrangère et sur objectifs spécifiques (FLE/FOS), axés sur les secteurs en tension ;
- 21h d'ateliers socio-culturels et compétences transversales (confiance en soi, mobilité, mathématiques, citoyenneté)?;
- 42h d'ateliers numériques, accès aux droits et insertion permettant de découvrir ou de s'approprier des outils numériques via les sites indispensables pour les démarches et l'autonomie dans la vie quotidienne mais aussi aborder les étapes de la création d'un CV et d'une lettre de motivation?;
- 33h d'ateliers professionnels qui leur donneront les outils pour une meilleure compréhension du marché de l'emploi, avec un travail sur le projet professionnel (technique Explorama), des ateliers Techniques de Recherche d'Emploi et de Stage et sorties (CIDJ/Cité des métiers)?;
- 30h d'interventions de professionnels partenaires et/ou visites de sites (voir pièce jointe) de métiers en tension pour donner un aperçu aux bénéficiaires des réalités des secteurs et leur permettre de partager leurs interrogations sur les domaines concernés. Le nombre d'ateliers par secteur pourra varier selon les projets professionnels et/ou les appétences du groupe ;
- Stage optionnel d'une semaine à un mois, selon la maturité du projet professionnel?;
- Accompagnement individuel de 4h pendant la formation et 3h de suivi post-formation par notre CIP.

### **Validation et sanction**

Attestation de formation

### **Type de formation**

Non certifiante

### **Sortie**

Sans niveau spécifique

## Métiers visés

**Code Rome**

Aucun code métiers (ROME) n'a été associé à cette formation.

**Formacode**

- [15235 : Français langue étrangère](https://formacode.centre-inffo.fr/spip.php?page=thesaurus&recherche_libre=15235)

## Durée, rythme, financement

**Durée :** 240 heures en centre**Modalité d'enseignement :** Formation entièrement en présentielle

**Conventionnement :**

Oui

**Financeur**

- **Etat - Ministère de l'intérieur**Programme : Actions socio-linguistiques (ASL) complémentaires du CIR 75 - 2025-26

## Conditions d'accès

**Public visé :**

- Public réfugié

**Niveau d'entrée :**

Sans niveau spécifique

**Conditions spécifiques et prérequis :**

Niveau de scolarisation et de maîtrise des savoirs de base : Scolarisé (3ans et +) en langue étrangère Maîtrise les savoirs de base Compétences linguistiques à l'entrée en formation : CECRL : Oral : A1 Écrit : A1

## Lieu de réalisation de l'action

**Modalité d'enseignement :** Formation entièrement en présentielle**Adresse**12 Rue Bellot75019 Paris 19e**Responsable :** ASLC - site Bellot**Téléphone fixe :** 0188321127

## Périodes prévisibles de déroulement des sessions

**Dates de début et fin :** 30/03/2026 au 15/06/2026

**Adresse d'inscription**

ASLC

75010 Paris 10e

**Etat du recrutement :** Ouvert

**Modalités :** Entrées / Sorties à dates fixes

## Organisme responsable

ASLC
**SIRET :** 41000945000017
**Adresse :**10 Rue du Buisson Saint-louis75010 Paris 10e

**Téléphone fixe :** 0188321127 [**Contacter l'organisme**](mailto:li-pro@aslc-paris.org)

## Contact de la formation

**Téléphone fixe :**

0188321127

[**Contacter l'organisme**](mailto:li-pro@aslc-paris.org)

## Contact de l'organisme formateur

Association d'assistance scolaire linguistique et culturelle

**SIRET :**

41000945000017`,
    metadata: {
      location: "Paris 19e",
      duration: "240 heures",
      level: "A2",
      certification: true,
      contact_email: "li-pro@aslc-paris.org",
      contact_phone: "0188321127",
      tags: ["ASL", "FLE", "intégration", "métiers en tension", "réfugiés"],
      target_audience: ["Public réfugié", "Migrants allophones"],
    },
  };

  const documents = Array.from({ length: count }).map((_, i) => {
    // Use index as seed for consistent generation
    const rng = new SeededRandom(i + 1000);

    const id = rng.uuid();
    // Generate a consistent date based on index (newer documents have higher index)
    const daysAgo = count - i;
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const title = titles[i % titles.length];
    const objective = objectives[i % objectives.length];
    const location = locations[i % locations.length];

    const sourceIdx = rng.randomInt(0, SOURCES.length);
    const levelIdx = rng.randomInt(0, 4);
    const rhythmIdx = rng.randomInt(0, 3);
    const duration = rng.randomInt(10, 110);
    const phone = rng.randomInt(100000000, 999999999);
    const hasCertification = rng.random() > 0.5;

    // Generate markdown content with YAML frontmatter (inspired by RCO format)
    const yamlFrontmatter = `---
title: "${title}"
source: "${SOURCES[sourceIdx]}"
date_created: "${date.toISOString().split("T")[0]}"
location: "${location}"
contact:
  email: "contact${i}@example.fr"
  phone: "+33 ${phone}"
duration: "${duration} heures"
level: "${["A1", "A2", "B1", "B2"][levelIdx]}"
target_audience:
  - "Migrants"
  - "Demandeurs d'emploi"
  - "Adultes en formation"
certification: ${hasCertification ? "true" : "false"}
---`;

    const markdownBody = `
# ${title}

## Objectifs

${objective}

## Contenu

Le programme couvre les aspects essentiels de la formation avec une approche pratique et progressive.

## Modalités

- **Lieu**: ${location}
- **Durée**: ${duration} heures
- **Rythme**: ${["Hebdomadaire", "Bi-hebdomadaire", "Intensif"][rhythmIdx]}
- **Certification**: ${hasCertification ? "Oui" : "Non"}

## Conditions d'accès

Aucun prérequis particulier. Positionnement selon le niveau de l'apprenant.

## Inscription

Contactez-nous pour plus d'informations et pour vous inscrire.
`;

    const content = yamlFrontmatter + markdownBody;

    return {
      id,
      title,
      date_added: date.toISOString(),
      status: STATUSES[rng.randomInt(0, STATUSES.length)],
      state: STATES[rng.randomInt(0, STATES.length)],
      content,
      metadata: {
        location,
        duration: `${duration} heures`,
        level: ["A1", "A2", "B1", "B2"][levelIdx],
        certification: hasCertification,
        contact_email: `contact${i}@example.fr`,
        contact_phone: `+33 ${phone}`,
        tags: ["formation", "intégration", "français"],
        target_audience: ["Migrants", "Demandeurs d'emploi"],
      },
    };
  });

  // Cache the generated documents with ASL document first
  cachedDocuments = [aslDocument, ...documents];
  return cachedDocuments;
}
