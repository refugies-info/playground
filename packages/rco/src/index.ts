import { XMLParser } from "fast-xml-parser";
import YAML from "yaml";
import { Lheo, LheoDocument } from "./lheo-types";

export { Lheo, LheoDocument };

const alwaysArray = [
  "code-FORMACODE",
  "code-NSF",
  "code-ROME",
  "extras",
  "extra",
  "contact-formation",
  "contact-session",
  "contact-organisme",
  "contact-formateur",
  "certification",
  "reference-certification",
  "code-type-formation",
  "action",
  "lieu-de-formation",
  "session",
  "date-information",
  "langue-formation",
  "code-modalite-pedagogique",
  "equipement",
  "organisme-formateur",
  "organisme-financeur",
  "enseignement",
  "ligne",
  "numtel",
  "annee-cycle",
  "sous-module",
  "formation",
  "resume-offre",
  "resume-organisme",
  "recrutement",
  "bloc-competences",
  "contact-formation-resume",
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  attributesGroupName: "attributes",
  textNodeName: "_text",
  isArray: (name, jpath) => {
    if (alwaysArray.includes(name)) return true;
    if (name === "reference-module" && jpath.endsWith("modules-prerequis.reference-module")) return true;
    if (name === "urlweb" && !jpath.endsWith("recrutement.urlweb")) return true;
    // In lheo-plus, organisme-formation-responsable is unbounded (array).
    // JPath for lheo-plus might vary depending on if it's root or nested, but typically 'lheo-plus.organisme-formation-responsable'
    if (name === "organisme-formation-responsable" && jpath.indexOf("lheo-plus") !== -1) return true;
    return false;
  },
});

export function parseLheoXml(xmlString: string): LheoDocument {
  return parser.parse(xmlString) as LheoDocument;
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
  }

  // Helper to get text content from potentially object with _text property
  function getText(node: any): string {
    if (typeof node === "string") return node;
    if (node && typeof node === "object" && node._text) return node._text;
    return "";
  }

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
}

export function convertXmlToMarkdownWithFrontmatter(xmlString: string): string {
  const yaml = convertXmlToYaml(xmlString);
  const markdownBody = extractMarkdownContent(xmlString);
  return `---\n${yaml}---\n\n${markdownBody}`;
}
