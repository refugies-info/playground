import type { Letta } from "@letta-ai/letta-client";
import { LETTA_MODEL_HANDLE } from "@playground/shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendMessageToConversation } from "./agents";

const createMock = vi.fn();

/** Minimal Letta client stub — sendMessageToConversation only touches conversations.messages.create. */
const client = {
  conversations: {
    messages: { create: (...args: unknown[]) => createMock(...args) },
  },
} as unknown as Letta;

const streamOf = async function* (chunks: unknown[]) {
  yield* chunks;
};

describe("sendMessageToConversation", () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it("forces the model on every request instead of relying on the agent's", async () => {
    createMock.mockResolvedValue(
      streamOf([{ message_type: "assistant_message", content: "Привіт" }]),
    );

    const { content } = await sendMessageToConversation(
      client,
      "conv-1",
      "Bonjour",
    );

    expect(content).toBe("Привіт");
    expect(createMock).toHaveBeenCalledWith(
      "conv-1",
      expect.objectContaining({ override_model: LETTA_MODEL_HANDLE }),
    );
  });
});
