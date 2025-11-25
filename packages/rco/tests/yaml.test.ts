import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { lheoXmlToYaml } from "../src/yaml";

const sampleXmlPath = path.join(__dirname, "../samples/rco.xml");
const sampleXml = fs.readFileSync(sampleXmlPath, "utf-8");

describe("YAML Module", () => {
  it("should convert XML to YAML", async () => {
    const yaml = await lheoXmlToYaml(sampleXml);
    expect(yaml).toContain("lheo:");
    expect(yaml).toContain("formation:");
  });
});
