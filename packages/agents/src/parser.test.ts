import { describe, expect, it } from "vitest";
import { parseAgentResponse } from "./parser";
import { IngestionMetadataSchema, MetadataMetadataSchema } from "./schemas";

describe("parseAgentResponse", () => {
  const agentId = "test-agent";

  it("should handle frontmatter on the same line as conversational text", () => {
    const rawResponse = `Je lance l'audit de cette fiche Data Inclusion (conformité + doublons).---
compliant: false
duplicate: false
carif_oref_url: https://example.com
---

# Rapport de traitement DI

**Décision finale: Fiche refusée ❌**
---
Action requise: Contacter la source.`;

    const result = parseAgentResponse(
      rawResponse,
      agentId,
      IngestionMetadataSchema,
    );

    expect(result.status).toBe("complete");
    expect(result.metadata.compliant).toBe(false);
    expect(result.content).toContain("# Rapport de traitement DI");
  });

  it("should handle clean frontmatter correctly", () => {
    const rawResponse = `---
compliant: true
duplicate: false
carif_oref_url: https://example.com
---
# Content`;

    const result = parseAgentResponse(
      rawResponse,
      agentId,
      IngestionMetadataSchema,
    );
    expect(result.status).toBe("complete");
    expect(result.metadata.compliant).toBe(true);
  });

  it("should handle conversational text on a separate line", () => {
    const rawResponse = `Sure, here is the report:
---
compliant: true
duplicate: false
carif_oref_url: https://example.com
---
# Content`;

    const result = parseAgentResponse(
      rawResponse,
      agentId,
      IngestionMetadataSchema,
    );
    expect(result.status).toBe("complete");
    expect(result.metadata.compliant).toBe(true);
  });
});

describe("parseAgentResponse with MetadataMetadataSchema", () => {
  const agentId = "test-agent";

  it("should accept real AI metadata output and return complete status", () => {
    // Exact YAML frontmatter from the AI agent (simplified to key fields)
    const rawResponse = `---
metadata_ri:
  mainSponsor: "CPIE Centre Corse"
  needs: ["613721a409c5190dfa70d057", "613721a409c5190dfa70d066"]
  theme: "63286a015d31b2c0cad9960a"
  titreInformatif: "Actions socio-linguistiques"
  titreMarque: "CPIE Centre Corse"
  abstract: "Apprendre le français"
  location: ["2A - Corse-du-Sud", "2B - Haute-Corse"]
  frenchLevel: ["alpha", "A1", "A2"]
  age: null
  price:
    - values: ["gratuit"]
      details: ""
  publicStatus: ["refugie", "asile"]
  public: ["women"]
  conditions: ["cir"]
  commitment:
    - amountDetails: "exactly"
      hours: [100]
      timeUnit: "hours"
  frequency:
    - amountDetails: "exactly"
      hours: [3]
      timeUnit: "hours"
      frequencyUnit: "week"
  timeSlots: null
  map:
    - title: "CPIE Centre Corse"
      address: "7 Rue du Colonel Feracci"
      city: "Corte"
      lat: 42.306
      lng: 9.149
provenance:
  - key: "mainSponsor"
    label: "Structure"
    value: "CPIE Centre Corse"
    status: "valid"
    source: ["structure.nom"]
---

## Métadonnées mappées

| Métadonnée | Valeur |
|---|---|
| Structure | CPIE Centre Corse |`;

    const result = parseAgentResponse(
      rawResponse,
      agentId,
      MetadataMetadataSchema,
    );

    expect(result.status).toBe("complete");
    expect(result.content).not.toBe("");
    expect(result.content).toContain("Métadonnées mappées");

    // metadata_ri should be preserved in full
    const metadataRi = result.metadata.metadata_ri as Record<string, unknown>;
    expect(metadataRi).toBeDefined();
    expect(metadataRi.mainSponsor).toBe("CPIE Centre Corse");
    expect(metadataRi.location).toEqual([
      "2A - Corse-du-Sud",
      "2B - Haute-Corse",
    ]);
    expect(metadataRi.conditions).toEqual(["cir"]);
    expect(metadataRi.age).toBeNull();
    expect(metadataRi.timeSlots).toBeNull();

    // provenance should also be preserved
    const provenance = result.metadata.provenance as Array<
      Record<string, unknown>
    >;
    expect(provenance).toBeDefined();
    expect(provenance).toHaveLength(1);
    expect(provenance[0].key).toBe("mainSponsor");
  });

  it("should accept metadata_ri with unexpected field shapes", () => {
    // AI might return weird shapes — passthrough should accept all
    const rawResponse = `---
metadata_ri:
  someNewField: 42
  anotherField:
    deeply:
      nested: true
  conditions: "single-string-instead-of-array"
---
# Report`;

    const result = parseAgentResponse(
      rawResponse,
      agentId,
      MetadataMetadataSchema,
    );

    expect(result.status).toBe("complete");
    expect(result.content).toContain("# Report");

    const metadataRi = result.metadata.metadata_ri as Record<string, unknown>;
    expect(metadataRi.someNewField).toBe(42);
    expect(metadataRi.conditions).toBe("single-string-instead-of-array");
  });

  it("should return incomplete when metadata_ri is missing entirely", () => {
    const rawResponse = `---
some_other_key: "no metadata_ri"
---
# Report`;

    const result = parseAgentResponse(
      rawResponse,
      agentId,
      MetadataMetadataSchema,
    );

    expect(result.status).toBe("error");
  });
});
