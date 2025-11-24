import { XMLParser } from "fast-xml-parser";
import YAML from "yaml";
import { Lheo } from "./lheo-types";

export { Lheo };

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  attributesGroupName: "attributes",
  textNodeName: "_text",
});

export function parseLheoXml(xmlString: string): Lheo {
  return parser.parse(xmlString) as Lheo;
}

export function convertXmlToJson(xmlString: string): object {
  return parseLheoXml(xmlString);
}

export function convertXmlToYaml(xmlString: string): string {
  const json = parseLheoXml(xmlString);
  return YAML.stringify(json);
}

export function extractMarkdownContent(xmlString: string): string {
  const json = parseLheoXml(xmlString);

  // Helper to find nodes recursively
  function findNodes(obj: any, key: string): any[] {
    let results: any[] = [];
    if (!obj) return results;

    if (obj[key]) {
      results.push(obj[key]);
    }

    if (typeof obj === "object") {
      for (const k in obj) {
        if (typeof obj[k] === "object") {
          results = results.concat(findNodes(obj[k], key));
        }
      }
    }
    return results;
  }

  const intitules = findNodes(json, "intitule-formation");
  const objectifs = findNodes(json, "objectif-formation");
  const contenus = findNodes(json, "contenu-formation");

  let markdown = "";

  if (intitules.length > 0) {
    markdown += `# ${intitules[0]}\n\n`;
  }

  if (objectifs.length > 0) {
    markdown += `## Objectifs\n\n${objectifs[0]}\n\n`;
  }

  if (contenus.length > 0) {
    markdown += `## Contenu\n\n${contenus[0]}\n\n`;
  }

  return markdown;
}

export function convertXmlToMarkdownWithFrontmatter(xmlString: string): string {
  const yaml = convertXmlToYaml(xmlString);
  const markdownBody = extractMarkdownContent(xmlString);
  return `---\n${yaml}---\n\n${markdownBody}`;
}
