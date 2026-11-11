/**
 * @file metadata-rco.ts
 *
 * Metadata of one RCO record, called by forceMetadataReportStep.
 *
 *   [1] mapMetadata          → fields read from the API codes and figures (no AI)
 *   [2] rco-metadata agent   → only the fields the code left open
 *   [3] validateField        → an AI value that breaks the RI schema is dropped
 */

import { askMetadataAgent, createLettaClient } from "@playground/agents";
import {
  type MappedField,
  METADATA_LABELS,
  type MetadataKey,
  mapMetadata,
  metadataKeysForAi,
  type RcoActionDocument,
  toMetadataDocument,
} from "@playground/offre-info";
import { RCO_MODEL_HANDLE, validateField } from "@playground/shared-types";
import { FatalError } from "@workflow/errors";

type ProvenanceStatus = "valid" | "missing" | "warning";

type Provenance = {
  key: MetadataKey;
  label: string;
  value: string;
  status: ProvenanceStatus;
  source: MappedField["source"];
};

const SOURCE_ICONS = { code: "⚙️ API", ai: "🤖 IA" } as const;

const displayValue = (value: unknown): string => {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(displayValue).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const toProvenance = (
  { key, value, source }: MappedField,
  status: ProvenanceStatus = value == null ? "missing" : "valid",
): Provenance => ({
  key,
  label: METADATA_LABELS[key],
  value: displayValue(value),
  status,
  source,
});

// An agent value that breaks the RI schema would block the editor: drop it.
const validateAiField = (field: MappedField) => {
  const result = validateField(field.key, field.value);
  return result.success
    ? {
        field: { ...field, value: result.data },
        provenance: toProvenance(field),
      }
    : {
        field: { ...field, value: null },
        provenance: {
          ...toProvenance({ ...field, value: null }, "warning"),
          value: `Valeur IA rejetée : ${result.error}`,
        },
      };
};

const metadataTable = (rows: (Provenance & { origin: string })[]) =>
  [
    "| Métadonnée | Valeur | Origine |",
    "| --- | --- | --- |",
    ...rows.map(
      ({ label, value, origin }) =>
        `| ${label} | ${value.replaceAll("|", "/")} | ${origin} |`,
    ),
  ].join("\n");

export async function generateRcoMetadata(action: RcoActionDocument) {
  const agentId = process.env.RCO_METADATA_AGENT_ID;
  if (!agentId) {
    throw new FatalError(
      "RCO_METADATA_AGENT_ID is not defined (pnpm agents:sync)",
    );
  }

  const codeFields = mapMetadata(action);
  const keysForAi = metadataKeysForAi(codeFields);
  const { answer, usage } = await askMetadataAgent(
    createLettaClient(),
    agentId,
    action.id,
    keysForAi,
    toMetadataDocument(action),
  );

  // Only the requested keys, each exactly once: a missing answer means null.
  const aiFields = keysForAi.map((key) => {
    const answered = answer.fields.find((field) => field.key === key);
    return validateAiField({
      key,
      value: answered?.value ?? null,
      source: answered?.source ?? [],
    });
  });

  const rows = [
    ...codeFields.map((field) => ({
      ...toProvenance(field),
      origin: SOURCE_ICONS.code,
    })),
    ...aiFields.map(({ provenance }) => ({
      ...provenance,
      origin: SOURCE_ICONS.ai,
    })),
  ].sort(
    (a, b) =>
      Object.keys(METADATA_LABELS).indexOf(a.key) -
      Object.keys(METADATA_LABELS).indexOf(b.key),
  );

  return {
    agentId,
    usage,
    model: RCO_MODEL_HANDLE,
    rawResponse: JSON.stringify(answer),
    status: "complete" as const,
    metadata: {
      metadata_ri: Object.fromEntries(
        [...codeFields, ...aiFields.map(({ field }) => field)].map(
          ({ key, value }) => [key, value],
        ),
      ),
      provenance: rows.map(({ origin: _origin, ...provenance }) => provenance),
    },
    markdown: `## Métadonnées mappées\n\n${metadataTable(rows)}`,
  };
}
