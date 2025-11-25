import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { convertXmlToJson } from "../src/json";

const sampleXmlPath = path.join(__dirname, "../samples/rco.xml");
const sampleXml = fs.readFileSync(sampleXmlPath, "utf-8");

describe("JSON Module", () => {
  it("should convert XML to JSON", async () => {
    const json = (await convertXmlToJson(sampleXml)) as any;
    expect(json.lheo).toBeDefined();
    expect(json.lheo.offres.formation).toBeDefined();
  });
});
