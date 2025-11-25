import { XMLParser } from "fast-xml-parser";
import type { XmlDocument, XsdValidator } from "libxml2-wasm";
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
    if (
      name === "reference-module" &&
      jpath.endsWith("modules-prerequis.reference-module")
    )
      return true;
    if (name === "urlweb" && !jpath.endsWith("recrutement.urlweb")) return true;
    // In lheo-plus, organisme-formation-responsable is unbounded (array).
    // JPath for lheo-plus might vary depending on if it's root or nested, but typically 'lheo-plus.organisme-formation-responsable'
    if (
      name === "organisme-formation-responsable" &&
      jpath.indexOf("lheo-plus") !== -1
    )
      return true;
    return false;
  },
});

export const parseLheoXml = async (
  xmlString: string
): Promise<LheoDocument> => {
  const { XmlDocument, XsdValidator } = await import("libxml2-wasm");
  const fs = await import("node:fs");
  const path = await import("node:path");

  const xsdPath = path.join(__dirname, "lheo.xsd");
  const xsdContent = fs.readFileSync(xsdPath, "utf-8");

  let xsdDoc: XmlDocument | undefined;
  let validator: XsdValidator | undefined;
  let xmlDoc: XmlDocument | undefined;

  try {
    xsdDoc = XmlDocument.fromString(xsdContent);
    validator = XsdValidator.fromDoc(xsdDoc);
    xmlDoc = XmlDocument.fromString(xmlString);

    validator.validate(xmlDoc);
  } catch (error) {
    throw new Error(`XML Validation failed: ${error}`);
  } finally {
    if (xmlDoc) xmlDoc.dispose();
    if (validator) validator.dispose();
    if (xsdDoc) xsdDoc.dispose();
  }

  return parser.parse(xmlString) as LheoDocument;
};
