import { describe, expect, it } from "vitest";
import { extractTranslatedMarkdown, parseAgentResponse } from "./parser";
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

  it("should recover when the agent forgets the closing frontmatter delimiter", () => {
    // Real Agathe failure mode: valid metadata_ri + provenance YAML, then the
    // markdown body starts WITHOUT a closing `---`. Previously js-yaml tried to
    // parse the tables as YAML and threw, producing an `error` report.
    const rawResponse = `---
metadata_ri:
  titreMarque: "APP Mulhouse"
  mainSponsor: "ARFP"
  price:
    values: [0]
  location: "68 - Haut-Rhin"
provenance:
  - key: "map"
    label: "Carte"
    value: "APP Mulhouse"
    status: "valid"
    source:
      - field: "longitude"
        rawValue: "7.33195"

## Métadonnées mappées

| Métadonnée | Valeur(s) renseignée(s) | Source |
|---|---|---|
| Titre marque | APP Mulhouse | \`structure.nom\` |

## ⚠️ Métadonnées incomplètes

| Métadonnée | Problème | Suggestion |
|---|---|---|
| Âge | Non mentionné | Non applicable |`;

    const result = parseAgentResponse(
      rawResponse,
      agentId,
      MetadataMetadataSchema,
    );

    expect(result.status).toBe("complete");
    expect(result.content).toContain("Métadonnées mappées");

    const metadataRi = result.metadata.metadata_ri as Record<string, unknown>;
    expect(metadataRi).toBeDefined();
    expect(metadataRi.titreMarque).toBe("APP Mulhouse");
    expect(metadataRi.location).toBe("68 - Haut-Rhin");

    const provenance = result.metadata.provenance as Array<
      Record<string, unknown>
    >;
    expect(provenance).toHaveLength(1);
    expect(provenance[0].key).toBe("map");
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

  // Real shape from prod (claude-sonnet-5-5, 2026-10-13): all indentation dropped.
  const flatResponse = `Le contenu n'est pas affiché, je le récupère via grep.---
metadata_ri:
titreMarque: ATELIER DES ARTISTES EN EXIL
logo: null
needs:
- 613721a409c5190dfa70d057
- 613721a409c5190dfa70d05e
price:
values:
- 0
commitment:
amountDetails: exactly
hours:
- 93
timeUnit: hours
frequency:
amountDetails: exactly
hours: 6
frequencyUnit: week
periode:
modalitesEntreesSorties: 1
items:
- startDate: '2026-09-07T00:00:00.000Z'
endDate: '2027-06-06T00:00:00.000Z'
timeSlots: null
location:
- 75 - Paris
map:
address: 106 Rue Brancion 75015
lat: 48.8307988
provenance:
- key: titreMarque
label: Titre marque
value: ""
status: valid
source:
- field: structure.nom
rawValue: ATELIER DES ARTISTES EN EXIL
- field: description
rawValue: "Programme hebdomadaire (6h)"
- key: price
label: Prix
status: valid
source:
- field: extra.action.frais-restants
rawValue: "null"
---

## Métadonnées mappées`;

  it("should rebuild the nesting of a fully flat metadata frontmatter", () => {
    const result = parseAgentResponse(
      flatResponse,
      agentId,
      MetadataMetadataSchema,
    );

    expect(result.status).toBe("complete");
    expect(result.metadata.metadata_ri).toEqual({
      titreMarque: "ATELIER DES ARTISTES EN EXIL",
      logo: null,
      needs: ["613721a409c5190dfa70d057", "613721a409c5190dfa70d05e"],
      price: { values: [0] },
      commitment: { amountDetails: "exactly", hours: [93], timeUnit: "hours" },
      frequency: { amountDetails: "exactly", hours: 6, frequencyUnit: "week" },
      periode: {
        modalitesEntreesSorties: 1,
        items: [
          {
            startDate: "2026-09-07T00:00:00.000Z",
            endDate: "2027-06-06T00:00:00.000Z",
          },
        ],
      },
      timeSlots: null,
      location: ["75 - Paris"],
      map: { address: "106 Rue Brancion 75015", lat: 48.8307988 },
    });
    expect(result.metadata.provenance).toEqual([
      {
        key: "titreMarque",
        label: "Titre marque",
        value: "",
        status: "valid",
        source: [
          { field: "structure.nom", rawValue: "ATELIER DES ARTISTES EN EXIL" },
          { field: "description", rawValue: "Programme hebdomadaire (6h)" },
        ],
      },
      {
        key: "price",
        label: "Prix",
        status: "valid",
        source: [{ field: "extra.action.frais-restants", rawValue: "null" }],
      },
    ]);
    expect(result.content).toContain("## Métadonnées mappées");
  });

  it("should rebuild a flat frontmatter carrying stray markdown spacing", () => {
    const rawResponse = `---
metadata_ri:
titreMarque: Commune de Evry-Courcouronnes
needs:

-   613721a409c5190dfa70d057
    publicStatus:
-   asile
    price:
    values:
    -   0
        commitment: null
        periode:
        items:
    -   startDate: '2026-09-28T00:00:00.000Z'
        endDate: '2027-06-11T00:00:00.000Z'
provenance:
-   key: titreMarque
    source:
    -   field: structure.nom
---
# Report`;

    const result = parseAgentResponse(
      rawResponse,
      agentId,
      MetadataMetadataSchema,
    );

    expect(result.status).toBe("complete");
    expect(result.metadata.metadata_ri).toEqual({
      titreMarque: "Commune de Evry-Courcouronnes",
      needs: ["613721a409c5190dfa70d057"],
      publicStatus: ["asile"],
      price: { values: [0] },
      commitment: null,
      periode: {
        items: [
          {
            startDate: "2026-09-28T00:00:00.000Z",
            endDate: "2027-06-11T00:00:00.000Z",
          },
        ],
      },
    });
    expect(result.metadata.provenance).toEqual([
      { key: "titreMarque", source: [{ field: "structure.nom" }] },
    ]);
  });

  it("should keep the error when a flat frontmatter has an unknown key", () => {
    const result = parseAgentResponse(
      flatResponse.replace("logo: null", "inventedKey: x"),
      agentId,
      MetadataMetadataSchema,
    );

    expect(result.status).toBe("error");
  });
});

describe("extractTranslatedMarkdown", () => {
  it("should drop narration and unwrap the markdown fence (prod, 2026-10-06)", () => {
    const response = `I'll load the translation skill first, since it defines the pipeline and rules.The skill tool isn't available here, so I'll translate directly.

\`\`\`markdown
# Reach level A1 in Paris to find a job

- French lessons

:::good-to-know
The training is open to people who:
:::
\`\`\``;

    expect(
      extractTranslatedMarkdown(response),
    ).toBe(`# Reach level A1 in Paris to find a job

- French lessons

:::good-to-know
The training is open to people who:
:::`);
  });

  it("should drop review notes after a lone closing fence", () => {
    const response =
      "# Title\n\nBody\n```\n\nPoints à signaler avant validation :\n\n1. note";
    expect(extractTranslatedMarkdown(response)).toBe("# Title\n\nBody");
  });

  it("should return an unfenced response unchanged", () => {
    const response = "# Title\n\nBody";
    expect(extractTranslatedMarkdown(response)).toBe(response);
  });
});
