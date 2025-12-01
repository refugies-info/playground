import { MockDocument, DocumentStatus, DocumentState } from "@shared/types";

const SOURCES = ["RCO", "Manual", "API"];
const STATUSES: DocumentStatus[] = ["accepted", "rejected"];
const STATES: DocumentState[] = [
  "draft",
  "to_process",
  "archived",
  "published",
];

export function generateMockDocuments(count: number = 50): MockDocument[] {
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

  return Array.from({ length: count }).map((_, i) => {
    const id = crypto.randomUUID();
    const date = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
    const title = titles[i % titles.length];
    const objective = objectives[i % objectives.length];
    const location = locations[i % locations.length];

    // Generate markdown content with YAML frontmatter (inspired by RCO format)
    const yamlFrontmatter = `---
title: "${title}"
source: "${SOURCES[Math.floor(Math.random() * SOURCES.length)]}"
date_created: "${date.toISOString().split("T")[0]}"
location: "${location}"
contact:
  email: "contact${i}@example.fr"
  phone: "+33 ${Math.floor(Math.random() * 900000000) + 100000000}"
duration: "${Math.floor(Math.random() * 100) + 10} heures"
level: "${["A1", "A2", "B1", "B2"][Math.floor(Math.random() * 4)]}"
target_audience:
  - "Migrants"
  - "Demandeurs d'emploi"
  - "Adultes en formation"
certification: ${Math.random() > 0.5 ? "true" : "false"}
---`;

    const markdownBody = `
# ${title}

## Objectifs

${objective}

## Contenu

Le programme couvre les aspects essentiels de la formation avec une approche pratique et progressive.

## Modalités

- **Lieu**: ${location}
- **Durée**: ${Math.floor(Math.random() * 100) + 10} heures
- **Rythme**: ${
      ["Hebdomadaire", "Bi-hebdomadaire", "Intensif"][
        Math.floor(Math.random() * 3)
      ]
    }
- **Certification**: ${Math.random() > 0.5 ? "Oui" : "Non"}

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
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      state: STATES[Math.floor(Math.random() * STATES.length)],
      source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
      content,
      metadata: {
        location,
        duration: `${Math.floor(Math.random() * 100) + 10} heures`,
        level: ["A1", "A2", "B1", "B2"][Math.floor(Math.random() * 4)],
        certification: Math.random() > 0.5,
        contact_email: `contact${i}@example.fr`,
        contact_phone: `+33 ${
          Math.floor(Math.random() * 900000000) + 100000000
        }`,
        tags: ["formation", "intégration", "français"],
        target_audience: ["Migrants", "Demandeurs d'emploi"],
      },
    };
  });
}
