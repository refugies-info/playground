import { parseLheoXml } from "./lheo";
import type {
  ContenuFormation,
  IntituleFormation,
  ObjectifFormation,
} from "./lheo-types";
import { lheoXmlToYaml } from "./yaml";

export const extractMarkdownContent = async (
  xmlString: string,
): Promise<string> => {
  const json = await parseLheoXml(xmlString);

  // Helper to find nodes recursively
  const findNodes = <T>(obj: unknown, key: string): T[] => {
    let results: T[] = [];
    if (!obj || typeof obj !== "object") return results;

    const record = obj as Record<string, unknown>;

    if (key in record) {
      const value = record[key];
      // If the node itself is an array (due to isArray=true), spread it
      if (Array.isArray(value)) {
        results = results.concat(value as T[]);
      } else {
        results.push(value as T);
      }
    }

    for (const k in record) {
      const value = record[k];
      if (typeof value === "object" && value !== null) {
        results = results.concat(findNodes<T>(value, key));
      }
    }
    return results;
  };

  // Helper to get text content from potentially object with _text property
  const getText = (node: unknown): string => {
    if (typeof node === "string") return node;
    if (node && typeof node === "object" && "_text" in node) {
      const record = node as Record<string, unknown>;
      if (typeof record._text === "string") {
        return record._text;
      }
    }
    return "";
  };

  const intitules = findNodes<IntituleFormation>(json, "intitule-formation");
  const objectifs = findNodes<ObjectifFormation>(json, "objectif-formation");
  const contenus = findNodes<ContenuFormation>(json, "contenu-formation");

  let markdown = "";

  if (intitules.length > 0) {
    markdown += `# ${getText(intitules[0])}\n\n`;
  }

  if (objectifs.length > 0) {
    markdown += `## Objectifs\n\n${getText(objectifs[0])}\n\n`;
  }

  if (contenus.length > 0) {
    markdown += `## Contenu\n\n${getText(contenus[0])}\n\n`;
  }

  return markdown;
};

export const lheoXmlToMarkdownWithFrontmatter = async (
  xmlString: string,
): Promise<string> => {
  const yaml = await lheoXmlToYaml(xmlString);
  const markdownBody = await extractMarkdownContent(xmlString);
  return `---\n${yaml}---\n\n${markdownBody}`;
};
