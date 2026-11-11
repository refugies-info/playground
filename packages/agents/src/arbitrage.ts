import type { Letta } from "@letta-ai/letta-client";
import { RCO_MODEL_HANDLE } from "@playground/shared-types";
// v4 API (shipped in zod 3.25) for z.toJSONSchema.
import { z } from "zod/v4";
import { findOrCreateConversation, sendMessageToConversation } from "./agents";
import type { LettaUsage } from "./types";

export const ComplianceAnswerSchema = z.object({
  decisions: z.array(
    z.object({
      criterion: z.enum(["audience", "scheme_type", "hours"]),
      verdict: z.enum(["accepted", "refused"]),
      reason: z.string(),
    }),
  ),
});

const Similarity = z.enum(["identical", "close", "different"]);

export const DuplicateAnswerSchema = z.object({
  matches: z.array(
    z.object({
      candidateId: z.string(),
      verdict: z.enum(["duplicate", "ambiguous"]),
      reason: z.string(),
      similarity: z.object({
        sponsor: Similarity,
        location: Similarity,
        title: Similarity,
      }),
    }),
  ),
  reason: z.string(),
});

export const MetadataAnswerSchema = z.object({
  fields: z.array(
    z.object({
      key: z.string(),
      value: z.unknown(),
      source: z.array(z.object({ field: z.string(), rawValue: z.unknown() })),
    }),
  ),
});

// gpt-oss sometimes names the body "content" or "texte": keep it rather than fail.
const AccordionSchema = z.preprocess(
  (item) =>
    item && typeof item === "object" && !("text" in item)
      ? {
          ...item,
          text: Object.entries(item).find(
            ([key, value]) => key !== "title" && typeof value === "string",
          )?.[1],
        }
      : item,
  z.object({ title: z.string(), text: z.string() }),
);

export const PlainLanguageAnswerSchema = z.object({
  title: z.string(),
  description: z.string(),
  goodToKnow: z.array(z.string()),
  why: z.array(AccordionSchema),
  how: z.array(AccordionSchema),
  otherInfo: z.array(z.string()),
  lexicon: z.array(z.object({ term: z.string(), definition: z.string() })),
  warnings: z.array(
    z.object({
      type: z.string(),
      field: z.string(),
      level: z.enum(["majeur", "moyen", "mineur", "faible"]),
      detail: z.string(),
      suggestion: z.string(),
    }),
  ),
});

const toResponseFormat = (name: string, schema: z.ZodType, strict = true) => ({
  type: "json_schema" as const,
  json_schema: { name, strict, schema: z.toJSONSchema(schema) },
});

// Pushed by agents:sync: the provider constrains the answer to the schema.
// Metadata values are free-form (`{}` schema), which strict mode rejects.
export const AGENT_RESPONSE_FORMATS: Record<
  string,
  ReturnType<typeof toResponseFormat>
> = {
  "rco-compliance": toResponseFormat("compliance", ComplianceAnswerSchema),
  "rco-duplicates": toResponseFormat("duplicates", DuplicateAnswerSchema),
  "rco-metadata": toResponseFormat("metadata", MetadataAnswerSchema, false),
  "rco-plain-language": toResponseFormat(
    "plain_language",
    PlainLanguageAnswerSchema,
  ),
};

export type ComplianceAnswer = z.infer<typeof ComplianceAnswerSchema>;
export type DuplicateAnswer = z.infer<typeof DuplicateAnswerSchema>;
export type MetadataAnswer = z.infer<typeof MetadataAnswerSchema>;
export type PlainLanguageAnswer = z.infer<typeof PlainLanguageAnswerSchema>;

// Untrusted data must not close our delimiters and pose as instructions.
const asTag = (tag: string, value: unknown) =>
  `<${tag}>\n${JSON.stringify(value, null, 2).replaceAll(`</${tag}>`, "")}\n</${tag}>`;

// Models sometimes wrap JSON in a ``` fence despite the instructions.
const extractJson = (content: string) =>
  content.slice(content.indexOf("{"), content.lastIndexOf("}") + 1);

const parseAnswer = <T>(content: string, schema: z.ZodType<T>) => {
  try {
    return schema.safeParse(JSON.parse(extractJson(content)));
  } catch (error) {
    return { success: false as const, error: error as Error };
  }
};

const FORMAT_REMINDER =
  "Ta réponse ne respecte pas le format attendu. Réponds à nouveau, uniquement avec l'objet JSON décrit dans le bloc `output_format` (mêmes clés, mêmes types), sans texte autour.";

const addUsage = (a?: LettaUsage, b?: LettaUsage): LettaUsage => ({
  promptTokens: (a?.promptTokens ?? 0) + (b?.promptTokens ?? 0),
  completionTokens: (a?.completionTokens ?? 0) + (b?.completionTokens ?? 0),
  totalTokens: (a?.totalTokens ?? 0) + (b?.totalTokens ?? 0),
});

async function askAgent<T>(
  client: Letta,
  agentId: string,
  conversationName: string,
  message: string,
  schema: z.ZodType<T>,
  model = RCO_MODEL_HANDLE,
): Promise<{ answer: T; usage?: LettaUsage; conversationId: string }> {
  const conversationId = await findOrCreateConversation(
    client,
    agentId,
    conversationName,
  );
  const first = await sendMessageToConversation(
    client,
    conversationId,
    message,
    model,
  );
  const parsed = parseAnswer(first.content, schema);
  if (parsed.success) {
    return { answer: parsed.data, usage: first.usage, conversationId };
  }

  // The prod model sometimes drifts from output_format: one reminder, then fail.
  const retry = await sendMessageToConversation(
    client,
    conversationId,
    `${FORMAT_REMINDER}\n\nErreur : ${parsed.error.message.slice(0, 1000)}`,
    model,
  );
  const reparsed = parseAnswer(retry.content, schema);
  if (!reparsed.success) {
    throw new Error(
      `${conversationName}: unexpected agent answer after reminder (${reparsed.error.message.slice(0, 500)}): ${retry.content.slice(0, 500)}`,
    );
  }
  return {
    answer: reparsed.data,
    usage: addUsage(first.usage, retry.usage),
    conversationId,
  };
}

export const askComplianceAgent = (
  client: Letta,
  agentId: string,
  documentId: string,
  criteria: string[],
  document: unknown,
) =>
  askAgent(
    client,
    agentId,
    `compliance-${documentId}`,
    [asTag("criteria", criteria), asTag("document", document)].join("\n\n"),
    ComplianceAnswerSchema,
  );

export const askDuplicatesAgent = (
  client: Letta,
  agentId: string,
  documentId: string,
  document: unknown,
  candidates: unknown[],
) =>
  askAgent(
    client,
    agentId,
    `duplicates-${documentId}`,
    [asTag("document", document), asTag("candidates", candidates)].join("\n\n"),
    DuplicateAnswerSchema,
  );

export const askMetadataAgent = (
  client: Letta,
  agentId: string,
  documentId: string,
  fields: string[],
  document: unknown,
) =>
  askAgent(
    client,
    agentId,
    `metadata-${documentId}`,
    [asTag("fields", fields), asTag("document", document)].join("\n\n"),
    MetadataAnswerSchema,
  );

export const askPlainLanguageAgent = (
  client: Letta,
  agentId: string,
  documentId: string,
  document: unknown,
  model?: string,
) =>
  askAgent(
    client,
    agentId,
    `plain-language-${documentId}`,
    asTag("document", document),
    PlainLanguageAnswerSchema,
    model,
  );
