import type { Letta } from "@letta-ai/letta-client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AGENT_RESPONSE_FORMATS,
  askComplianceAgent,
  PlainLanguageAnswerSchema,
} from "./arbitrage";

const sendMock = vi.fn();

const client = {
  conversations: {
    list: async () => [{ id: "conv-1", summary: "compliance-fiche-1" }],
    messages: { create: (...args: unknown[]) => sendMock(...args) },
  },
} as unknown as Letta;

const answering = (content: string) =>
  (async function* () {
    yield { message_type: "assistant_message", content };
  })();

const VALID =
  '{"decisions":[{"criterion":"audience","verdict":"accepted","reason":"FLE"}]}';
const DRIFTED = '{"audience":{"decision":"accepted","justification":"FLE"}}';

describe("askComplianceAgent", () => {
  beforeEach(() => sendMock.mockReset());

  it("reminds the agent of the format once when it drifts", async () => {
    sendMock
      .mockResolvedValueOnce(answering(DRIFTED))
      .mockResolvedValueOnce(answering(VALID));

    const { answer } = await askComplianceAgent(
      client,
      "agent-1",
      "fiche-1",
      ["audience"],
      {},
    );

    expect(answer.decisions[0].verdict).toBe("accepted");
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it("fails with the raw answer when the reminder does not help", async () => {
    sendMock.mockImplementation(async () => answering(DRIFTED));

    await expect(
      askComplianceAgent(client, "agent-1", "fiche-1", ["audience"], {}),
    ).rejects.toThrow(/justification/);
    expect(sendMock).toHaveBeenCalledTimes(2);
  });
});

describe("PlainLanguageAnswerSchema", () => {
  it("keeps an accordion body sent under another key", () => {
    const answer = PlainLanguageAnswerSchema.parse({
      title: "Améliorer son français",
      description: "Des cours.",
      goodToKnow: [],
      why: [{ title: "Parler", content: "Parler avec les voisins." }],
      how: [{ title: "Contacter l'organisme", text: "Appeler." }],
      otherInfo: [],
      lexicon: [],
      warnings: [],
    });
    expect(answer.why[0].text).toBe("Parler avec les voisins.");
    expect(
      AGENT_RESPONSE_FORMATS["rco-plain-language"].json_schema.schema,
    ).toBeDefined();
  });
});
