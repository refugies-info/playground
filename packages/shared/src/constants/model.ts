// Model name is hardcoded since it doesn't change frequently
export const LETTA_MODEL_NAME =
  process.env.LETTA_MODEL_NAME ?? "Claude Sonnet 5.5";

// Forced on every request: agents configured with `letta/auto`
// Direct Anthropic handles use hyphens; dotted ones are OpenRouter.
export const LETTA_MODEL_HANDLE =
  process.env.LETTA_MODEL_HANDLE ?? "letta/auto"; // "anthropic/claude-sonnet-5-5";

// Forced on the RCO agents only, to try a model without touching DI/translation.
export const RCO_MODEL_HANDLE =
  process.env.RCO_MODEL_HANDLE || LETTA_MODEL_HANDLE;
