import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseLheoXml } from "../src/lheo";

const sampleXmlPath = path.join(__dirname, "sample.xml");
const sampleXml = fs.readFileSync(sampleXmlPath, "utf-8");

describe("LHEO Module", () => {
  it("should parse Lhéo XML", () => {
    const result = parseLheoXml(sampleXml);
    expect(result).toBeDefined();
    expect(result.lheo).toBeDefined();
  });
});
