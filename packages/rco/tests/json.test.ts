import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { lheoXmlToJson } from "../src/json";

const sampleXmlPath = path.join(__dirname, "../samples/rco.xml");
const sampleXml = fs.readFileSync(sampleXmlPath, "utf-8");

describe("JSON Module", () => {
  it("should convert XML to JSON", async () => {
    const json = await lheoXmlToJson(sampleXml);
    expect(json.tag).toBe("#document");
    expect(json.children.length).toBeGreaterThan(0);
    const lheo = json.children.find((child) => child.tag === "lheo");
    expect(lheo).toBeDefined();
    if (!lheo) return;
    const offres = lheo.children.find((child) => child.tag === "offres");
    expect(offres).toBeDefined();
    if (!offres) return;
    const formations = offres.children.filter(
      (child) => child.tag === "formation"
    );
    expect(formations.length).toBeGreaterThan(0);
  });
});
