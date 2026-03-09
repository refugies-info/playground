/**
 * LLM-readable specification of the metadata_ri output schema.
 *
 * Injected into the /metadata message so the agent always knows the
 * exact format it must produce. Derived from MetadataRiSchema in
 * packages/shared/src/schemas/metadata-ri.ts.
 *
 * Keep this in sync with that Zod schema when fields change.
 */
export const METADATA_SCHEMA_SPEC = `
## Output Schema: metadata_ri

Your output MUST include a YAML frontmatter block with a \`metadata_ri\` key.
The \`metadata_ri\` object must conform to this schema exactly.
After writing your output, call \`validate_metadata_ri\` to check it and fix any errors.

### TypeScript Type

\`\`\`typescript
type MetadataRi = {
  // Identity
  titreMarque?: string | null;
  mainSponsor?: string | null;
  logo?: string | null;
  abstract?: string | null;

  // Themes & Needs (arrays of string IDs, or null)
  theme?: string | null;
  secondaryThemes?: string[] | null;
  needs?: string[] | null;

  // Public
  publicStatus?: string[] | null;
  public?: string[] | null;
  frenchLevel?: string[] | null;
  age?: {
    type?: "lessThan" | "moreThan" | "between";
    ages?: number[];
  } | null;

  // Modalities
  price?: {
    values: number[];   // MUST be numbers, not strings
    details?: string;   // omit if empty
  } | null;
  commitment?: {
    amountDetails?: "minimum" | "maximum" | "approximately" | "exactly" | "between";
    hours?: number[];
    timeUnit?: string;
  } | null;
  frequency?: {
    amountDetails?: "minimum" | "maximum" | "approximately" | "exactly";
    hours?: number;     // single number, NOT an array
    timeUnit?: string;
    frequencyUnit?: string;
  } | null;
  periode?: {
    modalitesEntreesSorties: 0 | 1 | null;  // 0=fixed dates, 1=permanent, null=unknown
    items: Array<{ startDate?: string; endDate?: string }> | null;
  } | null;
  timeSlots?: string[] | null;

  // Geography
  location?: "france" | "online" | string[] | null;
  conditions?: string[] | null;
  map?: Array<{
    title?: string; address?: string; city?: string;
    lat?: number; lng?: number;
    email?: string; phone?: string; description?: string;
  }> | null;
};
\`\`\`

### Critical Rules (most common mistakes)

**Rule 1 — Never wrap objects in arrays.**
Fields like \`price\`, \`age\`, \`commitment\`, \`frequency\` are objects, NOT arrays.
❌ \`price: [{ values: [0] }]\`
✅ \`price: { values: [0] }\`

**Rule 2 — price.values must be numbers, not strings.**
❌ \`price: { values: ["50"] }\`
❌ \`price: { values: ["gratuit"] }\`   # free = values: [0]
✅ \`price: { values: [50] }\`
✅ \`price: { values: [0] }\`           # free

**Rule 3 — price.details must be omitted (not empty string) when absent.**
❌ \`price: { values: [0], details: "" }\`
✅ \`price: { values: [0] }\`

**Rule 4 — frequency.hours is a single number, not an array.**
❌ \`frequency: { hours: [4], frequencyUnit: "week" }\`
✅ \`frequency: { hours: 4, frequencyUnit: "week" }\`

**Rule 5 — Use null, not [], for absent optional arrays.**
❌ \`secondaryThemes: []\`
✅ \`secondaryThemes: null\`

**Rule 6 — periode is an OBJECT with modalitesEntreesSorties + items, NOT a plain array.**
❌ \`periode: [{ startDate: "2025-01-01" }]\`
✅ \`periode: { modalitesEntreesSorties: null, items: [{ startDate: "2025-01-01" }] }\`

**Rule 7 — amountDetails must be an exact enum value.**
commitment.amountDetails: "minimum" | "maximum" | "approximately" | "exactly" | "between"
frequency.amountDetails:  "minimum" | "maximum" | "approximately" | "exactly"

### Correct YAML Frontmatter Example

\`\`\`yaml
---
metadata_ri:
  titreMarque: "Formation FLE A1-A2"
  mainSponsor: null
  abstract: "Formation de français langue étrangère pour débutants."
  theme: "FR"
  secondaryThemes: null
  needs: ["LEARN_FRENCH"]
  publicStatus: ["ASYLUM_SEEKER", "REFUGEE"]
  public: null
  frenchLevel: ["A1", "A2"]
  age: null
  price:
    values: [0]
  commitment:
    amountDetails: "exactly"
    hours: [20]
    timeUnit: "week"
  frequency:
    hours: 4
    frequencyUnit: "week"
  periode:
    modalitesEntreesSorties: 0
    items:
      - startDate: "2025-09-01"
        endDate: "2025-12-20"
  timeSlots: ["morning"]
  location: ["75", "92"]
  conditions: null
  map: null
---
\`\`\`
`;
