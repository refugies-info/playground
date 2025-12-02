import { MockDocument, DocumentStatus, DocumentState } from "@shared/types";
import { SeededRandom } from "./seededRandom";

const SOURCES = ["RCO", "Manual", "API"];
const STATUSES: DocumentStatus[] = ["accepted", "rejected"];
const STATES: DocumentState[] = [
  "draft",
  "to_process",
  "archived",
  "published",
];

// Cache to store generated documents
let cachedDocuments: MockDocument[] | null = null;

export function generateMockDocuments(count: number = 50): MockDocument[] {
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
      source: SOURCES[sourceIdx],
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

  // Cache the generated documents
  cachedDocuments = documents;
  return documents;
}
