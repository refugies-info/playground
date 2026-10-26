import { stringify } from "yaml";
import type { RcoActionDocument } from "./document";
import type { RcoStructureDocument } from "./structure";

const LINE_BREAK_TAGS = /<br\s*\/?>|<\/p>|<\/li>/gi;
const HTML_TAGS = /<[^>]+>/g;

// Carif-Oref often loses its line breaks: "OBJECTIFSLe projet", "chacun.Pour".
const GLUED_HEADING = /\b([A-ZÀ-Ý]{4,})(?=[A-ZÀ-Ý][a-zà-ÿ])/g;
const GLUED_SENTENCE = /([a-zà-ÿ)])\.(?=[A-ZÀ-Ý])/g;

export const toPlainText = (value: unknown): string =>
  typeof value === "string"
    ? value
        .replace(LINE_BREAK_TAGS, "\n")
        .replace(HTML_TAGS, "")
        .replace(GLUED_HEADING, "\n\n**$1**\n\n")
        .replace(GLUED_SENTENCE, "$1.\n\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    : "";

const section = (title: string, value: unknown): string => {
  const text = toPlainText(value);
  return text ? `## ${title}\n\n${text}` : "";
};

type Contact = {
  ligne1?: string;
  adresse?: { ligne1?: string; codepostal?: string; ville?: string };
  telfixe?: string;
  portable?: string;
  courriel?: string;
};

const contactLines = ({
  ligne1,
  adresse,
  telfixe,
  portable,
  courriel,
}: Contact) =>
  [
    ligne1,
    [
      adresse?.ligne1,
      [adresse?.codepostal, adresse?.ville].filter(Boolean).join(" "),
    ]
      .filter(Boolean)
      .join(", "),
    (telfixe ?? portable) && `Téléphone : ${telfixe ?? portable}`,
    courriel && `Courriel : ${courriel}`,
  ]
    .filter(Boolean)
    .map((line) => `- ${line}`)
    .join("\n");

const contactSection = (action: RcoActionDocument): string => {
  const contacts = (action.contact_formation as Contact[] | undefined) ?? [];
  const lines = [...new Set(contacts.map(contactLines))].filter(Boolean);
  return lines.length ? `## Coordonnées\n\n${lines.join("\n\n")}` : "";
};

export function actionToMarkdown(
  action: RcoActionDocument,
  structure: RcoStructureDocument,
): string {
  const frontmatter = stringify({ ...action, structure }).trim();
  const body = [
    `# ${action.nom}`,
    toPlainText(action.objectif_formation),
    section("Contenu", action.contenu_formation),
    section("Résultats attendus", action.resultat_attendus),
    section("Conditions d'accès", action.conditions_specifiques),
    contactSection(action),
  ]
    .filter(Boolean)
    .join("\n\n");
  return `---\n${frontmatter}\n---\n\n${body}`;
}
