import type { Letta } from "@letta-ai/letta-client";
import { z } from "zod";
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

export const DuplicateAnswerSchema = z.object({
  duplicate: z.boolean(),
  dispositifId: z.string().nullable(),
  reason: z.string(),
});

export type ComplianceAnswer = z.infer<typeof ComplianceAnswerSchema>;
export type DuplicateAnswer = z.infer<typeof DuplicateAnswerSchema>;

// Untrusted data must not close our delimiters and pose as instructions.
const asTag = (tag: string, value: unknown) =>
  `<${tag}>\n${JSON.stringify(value, null, 2).replaceAll(`</${tag}>`, "")}\n</${tag}>`;

// Models sometimes wrap JSON in a ``` fence despite the instructions.
const extractJson = (content: string) =>
  content.slice(content.indexOf("{"), content.lastIndexOf("}") + 1);

async function askAgent<T>(
  client: Letta,
  agentId: string,
  conversationName: string,
  message: string,
  schema: z.ZodType<T>,
): Promise<{ answer: T; usage?: LettaUsage; conversationId: string }> {
  const conversationId = await findOrCreateConversation(
    client,
    agentId,
    conversationName,
  );
  const { content, usage } = await sendMessageToConversation(
    client,
    conversationId,
    message,
  );
  const answer = schema.parse(JSON.parse(extractJson(content)));
  return { answer, usage, conversationId };
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
