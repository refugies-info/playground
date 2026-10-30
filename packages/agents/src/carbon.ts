import { type CarbonImpact, logger } from "@playground/shared-types";
import type { LettaUsage } from "./types";

// Hosted EcoLogits API (https://github.com/mlco2/ecologits-api), no key needed.
const ECOLOGITS_URL = "https://api.ecologits.ai/v1beta/estimations";
const ECOLOGITS_TIMEOUT_MS = 5_000;
const ECOLOGITS_PROVIDERS = new Set([
  "anthropic",
  "mistralai",
  "openai",
  "cohere",
  "google_genai",
]);

// "openai/gpt-6-astra" → openai + gpt-6-astra. Open-weight models
// (".../gpt-oss-120b") are listed under huggingface_hub with their full name.
// "letta/auto" hides the real model: no estimate.
export const toEcologitsModel = (handle: string) => {
  const [provider, ...rest] = handle.split("/");
  const name = rest.join("/");
  if (!name || provider === "letta") return null;
  if (ECOLOGITS_PROVIDERS.has(provider)) {
    return { provider, model_name: name };
  }
  return {
    provider: "huggingface_hub",
    model_name: name.includes("/") ? name : `${provider}/${name}`,
  };
};

const KG_TO_G = 1000;

/**
 * Estimates the emissions of the generated tokens with the French electricity
 * mix. An unknown model or an API failure gives null: never blocks a report.
 */
export async function estimateCarbonImpact(
  modelHandle: string | null | undefined,
  usage: LettaUsage | undefined,
): Promise<CarbonImpact | null> {
  const model = modelHandle ? toEcologitsModel(modelHandle) : null;
  const outputTokens = usage?.completionTokens;
  if (!model || !outputTokens) return null;
  try {
    const response = await fetch(ECOLOGITS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...model,
        output_token_count: outputTokens,
        electricity_mix_zone: "FRA",
      }),
      signal: AbortSignal.timeout(ECOLOGITS_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const { impacts } = (await response.json()) as {
      impacts?: { gwp?: { value?: { min?: number; max?: number } } };
    };
    const gwp = impacts?.gwp?.value;
    if (typeof gwp?.min !== "number" || typeof gwp.max !== "number") {
      return null;
    }
    return { gwpMinGrams: gwp.min * KG_TO_G, gwpMaxGrams: gwp.max * KG_TO_G };
  } catch (error) {
    logger.warn({ error, modelHandle }, "[carbon] EcoLogits estimate failed");
    return null;
  }
}
