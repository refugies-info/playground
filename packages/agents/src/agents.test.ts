import type { Letta } from "@letta-ai/letta-client";
import { LETTA_MODEL_NAME } from "@playground/shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAgentModel } from "./agents";

const retrieveMock = vi.fn();

/** Minimal Letta client stub — getAgentModel only touches agents.retrieve. */
const client = {
  agents: { retrieve: (...args: unknown[]) => retrieveMock(...args) },
} as unknown as Letta;

describe("getAgentModel", () => {
  beforeEach(() => {
    retrieveMock.mockReset();
  });

  it("returns the agent's model handle from agents.retrieve", async () => {
    retrieveMock.mockResolvedValue({ model: "anthropic/claude-sonnet-4.6" });

    const model = await getAgentModel("agent-success", client);

    expect(model).toBe("anthropic/claude-sonnet-4.6");
    expect(retrieveMock).toHaveBeenCalledWith("agent-success");
  });

  it("falls back to LETTA_MODEL_NAME when the agent has no model field", async () => {
    retrieveMock.mockResolvedValue({ model: null });

    const model = await getAgentModel("agent-null-model", client);

    expect(model).toBe(LETTA_MODEL_NAME);
  });

  it("falls back to LETTA_MODEL_NAME when the retrieve call fails", async () => {
    retrieveMock.mockRejectedValue(new Error("network down"));

    const model = await getAgentModel("agent-failure", client);

    expect(model).toBe(LETTA_MODEL_NAME);
  });

  it("serves subsequent calls for the same agent from the cache", async () => {
    retrieveMock.mockResolvedValue({ model: "letta/letta-free" });

    await getAgentModel("agent-cache", client);
    await getAgentModel("agent-cache", client);

    expect(retrieveMock).toHaveBeenCalledTimes(1);
  });
});
