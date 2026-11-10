import { stringify } from "yaml";
import type { RcoActionDocument } from "./document";
import type { RcoStructureDocument } from "./structure";

const LINE_BREAK_TAGS = /<br\s*\/?>|<\/p>|<\/li>/gi;
const HTML_TAGS = /<[^>]+>/g;

const toPlainText = (value: unknown): string =>
  typeof value === "string"
    ? value.replace(LINE_BREAK_TAGS, "\n").replace(HTML_TAGS, "").trim()
    : "";

const section = (title: string, value: unknown): string => {
  const text = toPlainText(value);
  return text ? `## ${title}\n\n${text}` : "";
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
  ]
    .filter(Boolean)
    .join("\n\n");
  return `---\n${frontmatter}\n---\n\n${body}`;
}
