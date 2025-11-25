import { parseLheoXml } from "./lheo";
import { lheoXmlToYaml } from "./yaml";

export const extractMarkdownContent = async (
  xmlString: string,
): Promise<string> => {
  const json = await parseLheoXml(xmlString);

  // Helper to find nodes recursively
  const findNodes = (obj: any, key: string): any[] => {
    let results: any[] = [];
    if (!obj) return results;

    if (obj[key]) {
      // If the node itself is an array (due to isArray=true), spread it
      if (Array.isArray(obj[key])) {
        results = results.concat(obj[key]);
      } else {
        results.push(obj[key]);
      }
    }

    if (typeof obj === "object") {
      for (const k in obj) {
        if (typeof obj[k] === "object") {
          results = results.concat(findNodes(obj[k], key));
        }
      }
    }
    return results;
  };

  // Helper to get text content from potentially object with _text property
  const getText = (node: any): string => {
    if (typeof node === "string") return node;
    if (node && typeof node === "object" && node._text) return node._text;
    return "";
  };

  const intitules = findNodes(json, "intitule-formation");
  const objectifs = findNodes(json, "objectif-formation");
  const contenus = findNodes(json, "contenu-formation");

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
