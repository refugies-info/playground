import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { convertXmlToJson } from "../src/json";

const sampleXmlPath = path.join(__dirname, "sample.xml");
const sampleXml = fs.readFileSync(sampleXmlPath, "utf-8");

describe("JSON Module", () => {
  it("should convert XML to JSON", () => {
    const json = convertXmlToJson(sampleXml) as any;
    expect(json.lheo).toBeDefined();
    expect(json.lheo["offre-formation"]).toBeDefined();
  });
});
