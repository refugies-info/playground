import { type RcoActionDocument, toSourceUrl } from "../document";
import { toPlainText } from "../markdown";
import { mapPlaces, withoutEmpty } from "../metadata/metadata-rules";

// The rco-plain-language agent only writes the texts: the code owns the fiche
// structure, the typography fixes and the checks it can run on its own.

type Accordion = { title: string; text: string };

export type PlainLanguageWarning = {
  type: string;
  field: string;
  level: "majeur" | "moyen" | "mineur" | "faible";
  detail: string;
  suggestion: string;
};

export type PlainLanguageFiche = {
  title: string;
  description: string;
  goodToKnow: string[];
  why: Accordion[];
  how: Accordion[];
  otherInfo: string[];
  lexicon: { term: string; definition: string }[];
  warnings: PlainLanguageWarning[];
};

const MAX_SENTENCE_WORDS = 25;
const MIN_WHY_ACCORDIONS = 3;

// Source: agathe/règles_rédaction_langage_clair.md, "Termes interdits".
const FORBIDDEN_TERMS = [
  "reconnaissance officielle",
  "gestes concrets",
  "multisectoriel",
  "plan de travail",
  "programme d'apprentissage linguistique",
  "vers l'emploi",
  "obtenir",
  "acquérir",
  "pré-requis",
  "FLE",
  "primo-arrivant",
  "être d'origine étrangère",
  "codes français",
  "complètement",
  "parler beaucoup le français",
  "socio-professionnel",
  "linguistique",
];
const FORBIDDEN_IN_WHY = ["postuler"];
const FORBIDDEN_IN_HOW = [
  "se rendre à l'inscription",
  "aller à l'adresse suivante",
  "à votre vie",
  "placé dans le bon groupe",
];

const CIR_TRIGGER = /actions socio-?linguistiques compl[ée]mentaires au CIR/i;
const CIR_GOOD_TO_KNOW =
  "Il est possible de venir à ces cours en même temps que la formation du CIR (contrat d'intégration républicaine) avec l'OFII (Office français de l'immigration et de l'intégration).";

const TEXT_FIELDS = [
  "objectif_formation",
  "contenu_formation",
  "resultat_attendus",
  "conditions_specifiques",
  "info_public_vise",
  "positionnement",
  "modalites_recrutement",
  "parcours_de_formation",
  "duree_indicative",
  "rythme_formation",
] as const;

// No organisation, funder, places, prices or dates: the fiche
// must not mention them, and the metadata already carry them.
export const toPlainLanguageDocument = (action: RcoActionDocument) =>
  withoutEmpty({
    nom: action.nom,
    ...Object.fromEntries(
      TEXT_FIELDS.map((field) => [field, toPlainText(action[field])]),
    ),
    nombre_heures_total: action.nombre_heures_total,
    niveau_entree_obligatoire: action.niveau_entree_obligatoire,
    certifiante: action.certifiante,
  });

export const needsCirGoodToKnow = (action: RcoActionDocument) =>
  [action.nom, ...TEXT_FIELDS.map((field) => toPlainText(action[field]))].some(
    (text) => CIR_TRIGGER.test(String(text ?? "")),
  );

export const fixTypography = (text: string) =>
  text
    .replace(/\p{Extended_Pictographic}️?/gu, "")
    .replace(/—/g, "–")
    .replace(/-{2,}/g, "-")
    .replace(/_/g, "-")
    .replace(/(?<!\p{L})courriel(s?)(?!\p{L})/giu, "mail$1")
    .replace(
      /France Travail(?!\s*\(anciennement)/g,
      "France Travail (anciennement Pôle emploi)",
    )
    .trim();

const fixFiche = (fiche: PlainLanguageFiche): PlainLanguageFiche => {
  const fixAccordion = ({ title, text }: Accordion) => ({
    title: fixTypography(title),
    text: fixTypography(text),
  });
  return {
    ...fiche,
    title: fixTypography(fiche.title),
    description: fixTypography(fiche.description),
    goodToKnow: fiche.goodToKnow.map(fixTypography),
    why: fiche.why.map(fixAccordion),
    how: fiche.how.map(fixAccordion),
    otherInfo: fiche.otherInfo.map(fixTypography),
    lexicon: fiche.lexicon.map(({ term, definition }) => ({
      term: fixTypography(term),
      definition: fixTypography(definition),
    })),
  };
};

const containsTerm = (text: string, term: string) =>
  new RegExp(`(?<!\\p{L})${term}(?!\\p{L})`, "iu").test(text);

const accordionsText = (accordions: Accordion[]) =>
  accordions.map(({ title, text }) => `${title}\n${text}`).join("\n");

const forbiddenTermWarnings = (
  field: string,
  text: string,
  terms: string[],
): PlainLanguageWarning[] =>
  terms
    .filter((term) => containsTerm(text, term))
    .map((term) => ({
      type: "Terme interdit",
      field,
      level: "moyen",
      detail: `« ${term} » est dans la liste des termes interdits.`,
      suggestion: "Reformuler avec des mots simples.",
    }));

const longSentenceWarnings = (
  field: string,
  text: string,
): PlainLanguageWarning[] =>
  text
    .split(/(?<=[.!?])\s+|\n+/)
    .filter((sentence) => sentence.split(/\s+/).length > MAX_SENTENCE_WORDS)
    .map((sentence) => ({
      type: "Phrase trop longue",
      field,
      level: "mineur",
      detail: `Plus de ${MAX_SENTENCE_WORDS} mots : « ${sentence} »`,
      suggestion: "Couper en deux phrases.",
    }));

export const checkPlainLanguage = (
  fiche: PlainLanguageFiche,
  action: RcoActionDocument,
): PlainLanguageWarning[] => {
  const sections = [
    {
      field: "Description",
      text: [fiche.title, fiche.description, ...fiche.goodToKnow].join("\n"),
      terms: FORBIDDEN_TERMS,
    },
    {
      field: "Pourquoi c'est intéressant ?",
      text: accordionsText(fiche.why),
      terms: [...FORBIDDEN_TERMS, ...FORBIDDEN_IN_WHY],
    },
    {
      field: "Comment faire ?",
      text: accordionsText(fiche.how),
      terms: [...FORBIDDEN_TERMS, ...FORBIDDEN_IN_HOW],
    },
    {
      field: "Autres informations",
      text: fiche.otherInfo.join("\n"),
      terms: FORBIDDEN_TERMS,
    },
  ];
  const missingSource: PlainLanguageWarning[] =
    toPlainText(action.objectif_formation) ||
    toPlainText(action.contenu_formation)
      ? []
      : [
          {
            type: "Donnée manquante",
            field: "objectif_formation / contenu_formation",
            level: "majeur",
            detail: "La fiche RCO ne décrit ni l'objectif ni le contenu.",
            suggestion: "Compléter avec l'organisme avant publication.",
          },
        ];
  const structure: PlainLanguageWarning[] = [
    ...(fiche.why.length < MIN_WHY_ACCORDIONS
      ? [
          {
            type: "Contenu insuffisant",
            field: "Pourquoi c'est intéressant ?",
            level: "moyen" as const,
            detail: `${fiche.why.length} accordéon(s) au lieu de ${MIN_WHY_ACCORDIONS} minimum.`,
            suggestion: "Compléter à partir de la fiche source.",
          },
        ]
      : []),
    ...(fiche.goodToKnow.length > 1
      ? [
          {
            type: "Bon à savoir en trop",
            field: "Bon à savoir",
            level: "mineur" as const,
            detail: `Non publiés : ${fiche.goodToKnow.slice(1).join(" / ")}`,
            suggestion:
              "Un seul bon à savoir : déplacer le reste dans la description ou les autres informations.",
          },
        ]
      : []),
    ...(fiche.how.length > 1
      ? [
          {
            type: "Accordéons en trop",
            field: "Comment faire ?",
            level: "mineur" as const,
            detail: `Non publiés : ${fiche.how
              .slice(1)
              .map(({ title }) => title)
              .join(" / ")}`,
            suggestion:
              "Un seul accordéon : regrouper les étapes dans le premier.",
          },
        ]
      : []),
    ...(fiche.how.length === 0
      ? [
          {
            type: "Contenu insuffisant",
            field: "Comment faire ?",
            level: "majeur" as const,
            detail: "Aucune démarche décrite.",
            suggestion: "Ajouter la démarche d'inscription.",
          },
        ]
      : []),
  ];
  return [
    ...missingSource,
    ...structure,
    ...sections.flatMap(({ field, text, terms }) => [
      ...forbiddenTermWarnings(field, text, terms),
      ...longSentenceWarnings(field, text),
    ]),
  ];
};

const directive = (name: string, text: string) => `:::${name}\n${text}\n:::`;

const toggle = ({ title, text }: Accordion) =>
  directive(`toggle{title="${title.replaceAll('"', "'")}"}`, text);

const tableCell = (value: string) =>
  value.replaceAll("|", "/").replaceAll("\n", " ");

const warningsTable = (warnings: PlainLanguageWarning[]) =>
  [
    "| Type de problème | Champ ou élément | Niveau de risque | Détail / justification | Suggestion de correction |",
    "|------------------|------------------|------------------|------------------------|--------------------------|",
    ...warnings.map(
      ({ type, field, level, detail, suggestion }) =>
        `| ${[type, field, level, detail, suggestion].map(tableCell).join(" | ")} |`,
    ),
  ].join("\n");

type Poi = { address?: string; city?: string; email?: string; phone?: string };

// Same contact as the "Lieux" metadata, so the fiche and the map agree.
const contactDetails = (action: RcoActionDocument) => {
  const pois = (mapPlaces(action)?.value ?? []) as Poi[];
  return [
    pois[0]?.phone && `- Téléphone : ${pois[0].phone}`,
    pois[0]?.email && `- Mail : ${pois[0].email}`,
    ...pois.map(
      ({ address, city }) =>
        `- Adresse : ${[address, city].filter(Boolean).join(" ")}`,
    ),
  ]
    .filter(Boolean)
    .join("\n");
};

// Like the published fiches: "Contacter <organisme>" and "… à <ville>",
// added by code because the agent never sees the organisation or places.
const contactTitle = (title: string | undefined, organisation?: string) =>
  organisation && (!title || title.startsWith("Contacter"))
    ? `Contacter ${organisation}`
    : (title ?? "Contacter l'organisme");

const withContactDetails = (
  how: Accordion[],
  details: string,
  organisation?: string,
) => {
  if (!details && !organisation) return how;
  const [firstStep, ...otherSteps] = how;
  return [
    {
      title: contactTitle(firstStep?.title, organisation),
      text: [firstStep?.text, details].filter(Boolean).join("\n\n"),
    },
    ...otherSteps,
  ];
};

const withSingleCity = (title: string, action: RcoActionDocument) => {
  const cities = [
    ...new Set(
      ((mapPlaces(action)?.value ?? []) as Poi[])
        .map(({ city }) => city)
        .filter(Boolean),
    ),
  ];
  return cities.length === 1 && !title.includes(String(cities[0]))
    ? `${title} à ${cities[0]}`
    : title;
};

const section = (heading: string, body: string) =>
  body ? `${heading}\n\n${body}` : "";

// Output layout: agathe/format_sortie_transformation.md.
export const renderPlainLanguageFiche = (
  answer: PlainLanguageFiche,
  action: RcoActionDocument,
): string => {
  const fiche = fixFiche(answer);
  // One good-to-know from the agent, plus the CIR one as a separate block.
  const goodToKnow = [
    fiche.goodToKnow[0],
    needsCirGoodToKnow(action) && CIR_GOOD_TO_KNOW,
  ].filter((text): text is string => Boolean(text));
  const how = withContactDetails(
    fiche.how.slice(0, 1),
    contactDetails(action),
    action.organisme_responsable?.nom ?? undefined,
  );
  const warnings = [...fiche.warnings, ...checkPlainLanguage(fiche, action)];
  const body = [
    `# ${withSingleCity(fiche.title, action)}`,
    fiche.description,
    ...goodToKnow.map((text) => directive("good-to-know", text)),
    section(
      "## Pourquoi c'est intéressant ?",
      fiche.why.map(toggle).join("\n\n"),
    ),
    section("## Comment faire ?", how.map(toggle).join("\n\n")),
    section("### Autres informations", fiche.otherInfo.join(", ")),
    section(
      "### Pour aller plus loin",
      `- Source 1: ${action.nom} – Carif-Oref – ${toSourceUrl(action)}`,
    ),
    section(
      "### Journal des Avertissements",
      warnings.length ? warningsTable(warnings) : "",
    ),
    section(
      "### Lexique",
      fiche.lexicon
        .map(({ term, definition }) => `**${term}** : ${definition}`)
        .join("\n\n"),
    ),
  ]
    .filter(Boolean)
    .join("\n\n");
  return `---\n---\n\n${body}\n`;
};
