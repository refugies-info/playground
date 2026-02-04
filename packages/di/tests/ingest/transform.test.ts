import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { diRecordToIngestionRecord } from "../../src/ingest/transform";

describe("diRecordToIngestionRecord", () => {
  const mockStructure = { id: "struct-1", nom: "Structure Test" };

  it("should convert a basic record to markdown with frontmatter", () => {
    const service = {
      id: "123",
      nom: "Service Test",
      source: "source-test",
    };

    const result = diRecordToIngestionRecord(service, mockStructure);

    expect(result).toMatch(/id: ["']?123["']?/);
    expect(result).toContain("nom: Service Test");
    expect(result).toContain("# Service Test");
    expect(result).toContain("structure:");
  });

  it("should include presentation_resume in the body", () => {
    const service = {
      id: "123",
      nom: "Service Test",
      presentation_resume: "This is a short description.",
    };

    const result = diRecordToIngestionRecord(service, mockStructure);

    expect(result).toContain("This is a short description.");
  });

  it("should include presentation_detail in the body", () => {
    const service = {
      id: "123",
      nom: "Service Test",
      presentation_detail: "This is a long detailed description.",
    };

    const result = diRecordToIngestionRecord(service, mockStructure);

    expect(result).toContain("This is a long detailed description.");
  });

  it("should include both presentation fields in the body", () => {
    const service = {
      id: "123",
      nom: "Service Test",
      presentation_resume: "Short.",
      presentation_detail: "Long.",
    };

    const result = diRecordToIngestionRecord(service, mockStructure);

    expect(result).toContain("Short.\n\nLong.");
  });

  it("should handle structure data in frontmatter", () => {
    const service = {
      id: "service-1",
      nom: "Service",
    };
    const structure = {
      id: "struct-1",
      nom: "Structure",
    };

    const result = diRecordToIngestionRecord(service, structure);

    // Parse frontmatter to verify structure nesting
    const match = result.match(/^---\n([\s\S]*?)\n---/);
    expect(match).not.toBeNull();

    const frontmatter = parse(match?.[1] ?? "");
    expect(frontmatter.structure).toEqual(structure);
    expect(frontmatter.id).toBe("service-1");
  });

  it("should handle special characters in frontmatter", () => {
    const service = {
      id: "123",
      nom: "L'école de la vie: C'est super",
    };

    const result = diRecordToIngestionRecord(service, mockStructure);

    expect(result).toContain("nom: \"L'école de la vie: C'est super\"");
    expect(result).toContain("# L'école de la vie: C'est super");
  });
});
