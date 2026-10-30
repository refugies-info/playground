import { describe, expect, it } from "vitest";
import { toEcologitsModel } from "./carbon";

describe("toEcologitsModel", () => {
  it("maps Letta handles to EcoLogits providers", () => {
    expect(toEcologitsModel("openai/gpt-6-astra")).toEqual({
      provider: "openai",
      model_name: "gpt-6-astra",
    });
    expect(toEcologitsModel("albert/openai/gpt-oss-120b")).toEqual({
      provider: "huggingface_hub",
      model_name: "openai/gpt-oss-120b",
    });
    expect(toEcologitsModel("letta/auto")).toBeNull();
  });
});
