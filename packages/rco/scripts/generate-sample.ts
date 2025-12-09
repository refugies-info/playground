/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
/** biome-ignore-all lint/suspicious/noConsole: <explanation> */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { XMLBuilder, XMLParser } from "fast-xml-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Updated path: script is in packages/rco/scripts/, samples are in packages/rco/samples/
const RCO_DIR = path.join(__dirname, "../samples");
const DUMMY_DIR = path.join(RCO_DIR, "dummy_data");
const TARGET_FILE = path.join(RCO_DIR, "rco_30.xml");

// Helper to read file content
const readFile = (filePath: string) => fs.readFileSync(filePath, "utf-8");

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  isArray: (name) => {
    return ["formation", "extra", "code-public-vise"].includes(name);
  },
});

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  format: true,
  indentBy: "	", // Use tabs to match original style if possible, or 2 spaces
});

// Helper to extract formations from XML content using parser
const extractFormations = (xmlContent: string): any[] => {
  const jsonObj = parser.parse(xmlContent);
  return jsonObj.lheo?.offres?.formation || [];
};

// Helper to get header parts (we don't strictly need this if we parse everything, but we want to preserve root structure)
// We will just read the base structure from the first file.

// Main function
const generate = () => {
  console.log("Reading source files...");

  // 1. Get base formation from rco.xml
  const rcoPath = path.join(RCO_DIR, "rco.xml");
  const rcoContent = readFile(rcoPath);

  // Parse the main file fully to keep as a template
  const mainObj = parser.parse(rcoContent);

  if (!mainObj.lheo || !mainObj.lheo.offres) {
    console.error("Invalid rco.xml structure");
    process.exit(1);
  }

  // Ensure formation is an array (handled by isArray option, but good to be safe)
  let baseFormations = mainObj.lheo.offres.formation || [];
  if (!Array.isArray(baseFormations)) {
    baseFormations = [baseFormations];
  }

  if (baseFormations.length === 0) {
    console.error("No formation found in rco.xml");
    process.exit(1);
  }

  // 2. Get formations from dummy_data
  const dummyFiles = fs
    .readdirSync(DUMMY_DIR)
    .filter((f) => f.endsWith(".xml"));

  for (const file of dummyFiles) {
    const content = readFile(path.join(DUMMY_DIR, file));
    const forms = extractFormations(content);
    baseFormations.push(...forms);
  }

  console.log(`Found ${baseFormations.length} base formations.`);

  // 3. Generate 30 formations
  const generatedFormations: any[] = [];
  const TOTAL_NEEDED = 30;

  for (let i = 0; i < TOTAL_NEEDED; i++) {
    // Round robin selection of base formation
    const base = baseFormations[i % baseFormations.length];

    // Deep clone the base object
    const modified = JSON.parse(JSON.stringify(base));

    // Generate a unique ID suffix
    // const idSuffix = `_SESSION_${i + 1}`;

    // Modify numero attribute
    if (modified.numero) {
      modified.numero = `NUM_${i + 1}_${Date.now()}`;
    }

    // Modify intitule-formation to add session number
    if (modified["intitule-formation"]) {
      modified["intitule-formation"] = `${
        modified["intitule-formation"]
      } - Session ${i + 1}`;
    }

    generatedFormations.push(modified);
  }

  // 4. Construct final XML Object
  const finalObj = {
    lheo: {
      ...mainObj.lheo,
      offres: {
        ...mainObj.lheo.offres,
        formation: generatedFormations,
        // Keep existing extras if any, or add default
        extras: mainObj.lheo.offres.extras || {
          info: "flux-intercarif",
          extra: [
            { info: "date-export", "#text": "20251101" },
            { info: "heure-export", "#text": "062847" },
          ],
        },
      },
    },
  };

  // 5. Build XML string
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(
    finalObj,
  )}`;

  // 6. Write file
  fs.writeFileSync(TARGET_FILE, xmlContent);
  console.log(
    `Successfully generated ${TARGET_FILE} with ${generatedFormations.length} formations.`,
  );
};

generate();
