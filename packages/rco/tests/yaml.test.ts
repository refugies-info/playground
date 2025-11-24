import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { convertXmlToYaml } from "../src/yaml";

const sampleXmlPath = path.join(__dirname, "sample.xml");
const sampleXml = fs.readFileSync(sampleXmlPath, "utf-8");

describe("YAML Module", () => {
  it("should convert XML to YAML", () => {
    const yaml = convertXmlToYaml(sampleXml);
    expect(yaml).toContain("lheo:");
    expect(yaml).toContain("offre-formation:");
  });
});
