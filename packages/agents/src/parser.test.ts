import { describe, expect, it } from "vitest";
import { parseAgentResponse } from "./parser";
import { IngestionMetadataSchema } from "./schemas";

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
